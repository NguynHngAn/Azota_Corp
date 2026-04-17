from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, update
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    PasswordResetCompletedResponse,
    PasswordResetRequestedResponse,
    RefreshRequest,
    RequestPasswordResetRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
)
from app.services.password_reset import issue_password_reset_for_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User inactive")
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id, remember=body.remember_me),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")
    try:
        user_id = int(payload["sub"])
    except (KeyError, ValueError, TypeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    remember = bool(payload.get("remember", True))
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id, remember=remember),
    )


@router.post("/request-password-reset", response_model=PasswordResetRequestedResponse)
def request_password_reset(body: RequestPasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(func.lower(User.email) == body.email).first()
    if user and user.is_active:
        issue_password_reset_for_user(db, user)
        db.commit()
    return PasswordResetRequestedResponse()


@router.post("/reset-password", response_model=PasswordResetCompletedResponse)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    row = db.query(PasswordResetToken).filter(PasswordResetToken.token == body.token.strip()).first()
    if not row or row.used or row.expires_at < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset link",
        )
    user = db.get(User, row.user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset link",
        )
    user.password_hash = hash_password(body.new_password)
    db.execute(update(PasswordResetToken).where(PasswordResetToken.user_id == user.id).values(used=True))
    db.commit()
    return PasswordResetCompletedResponse()
