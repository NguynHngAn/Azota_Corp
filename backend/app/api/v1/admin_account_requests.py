import secrets
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.security import hash_password
from app.services.password_reset import issue_password_reset_for_user
from app.database import get_db
from app.models.account_request import (
    AccountRequest,
    AccountRequestRole,
    AccountRequestStatus,
)
from app.models.user import Role, User
from app.schemas.account_request import (
    AccountRequestAdminItem,
    AccountRequestListResponse,
    AccountRequestStatusUpdate,
)

router = APIRouter(prefix="/admin/account-requests", tags=["admin-account-requests"])


@router.get("", response_model=AccountRequestListResponse)
def list_account_requests(
    _: Annotated[User, Depends(require_role(Role.admin))],
    db: Session = Depends(get_db),
    filter_status: AccountRequestStatus | None = Query(None, alias="status"),
    search: str | None = Query(None, max_length=255),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
):
    q = db.query(AccountRequest)
    if filter_status is not None:
        q = q.filter(AccountRequest.status == filter_status)
    if search and (s := search.strip()):
        pattern = f"%{s}%"
        q = q.filter(
            or_(
                AccountRequest.full_name.ilike(pattern),
                AccountRequest.email.ilike(pattern),
            )
        )
    total = q.count()
    items = (
        q.order_by(AccountRequest.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return AccountRequestListResponse(items=items, total=total)


@router.patch("/{request_id}", response_model=AccountRequestAdminItem)
def update_account_request_status(
    request_id: int,
    body: AccountRequestStatusUpdate,
    _: Annotated[User, Depends(require_role(Role.admin))],
    db: Session = Depends(get_db),
):
    row = db.get(AccountRequest, request_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if row.status != AccountRequestStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending requests can be approved or rejected",
        )

    if body.status == "rejected":
        row.status = AccountRequestStatus.rejected
        db.commit()
        db.refresh(row)
        return row

    # approved
    exists = db.query(User).filter(func.lower(User.email) == row.email.lower()).first()
    if exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )
    placeholder_pw = secrets.token_urlsafe(48)
    role = Role.student if row.role == AccountRequestRole.student else Role.teacher
    user = User(
        email=row.email,
        password_hash=hash_password(placeholder_pw),
        full_name=row.full_name,
        role=role,
        is_active=True,
    )
    db.add(user)
    db.flush()
    issue_password_reset_for_user(db, user)
    row.status = AccountRequestStatus.approved
    db.commit()
    db.refresh(row)
    return row
