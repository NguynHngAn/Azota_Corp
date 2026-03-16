from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import Role, User
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.api.deps import get_current_user, require_role
from app.core.security import hash_password

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user


@router.get("", response_model=list[UserResponse])
def list_users(
    current_user: Annotated[User, Depends(require_role(Role.admin))],
    db: Session = Depends(get_db),
    role: Role | None = Query(None),
):
    q = db.query(User)
    if role is not None:
        q = q.filter(User.role == role)
    return q.order_by(User.id).all()


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    body: UserCreate,
    current_user: Annotated[User, Depends(require_role(Role.admin))],
    db: Session = Depends(get_db),
):
    if body.role not in (Role.teacher, Role.student):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only teacher or student roles are allowed")
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        full_name=body.full_name,
        role=body.role,
        is_active=body.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    body: UserUpdate,
    current_user: Annotated[User, Depends(require_role(Role.admin))],
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if body.role is not None and body.role not in (Role.teacher, Role.student):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only teacher or student roles are allowed")
    if body.full_name is not None:
        user.full_name = body.full_name
    if body.role is not None:
        user.role = body.role
    if body.is_active is not None:
        user.is_active = body.is_active
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_user(
    user_id: int,
    current_user: Annotated[User, Depends(require_role(Role.admin))],
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    # Soft delete: deactivate account
    user.is_active = False
    db.commit()
    return None
