from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.account_request import AccountRequest, AccountRequestRole, AccountRequestStatus
from app.models.user import User
from app.schemas.account_request import AccountRequestCreate, AccountRequestResponse

router = APIRouter(prefix="/account-requests", tags=["account-requests"])


@router.post("", response_model=AccountRequestResponse, status_code=status.HTTP_201_CREATED)
def create_account_request(body: AccountRequestCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(func.lower(User.email) == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    row = AccountRequest(
        full_name=body.full_name,
        email=body.email,
        organization=body.organization,
        role=AccountRequestRole(body.role),
        message=body.message,
        status=AccountRequestStatus.pending,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
