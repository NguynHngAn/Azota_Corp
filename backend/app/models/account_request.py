import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AccountRequestRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"


class AccountRequestStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class AccountRequest(Base):
    __tablename__ = "account_requests"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    organization: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[AccountRequestRole] = mapped_column(
        Enum(
            AccountRequestRole,
            name="accountrequestrole",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
    )
    status: Mapped[AccountRequestStatus] = mapped_column(
        Enum(
            AccountRequestStatus,
            name="accountrequeststatus",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
    )
    message: Mapped[str | None] = mapped_column(Text(), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
