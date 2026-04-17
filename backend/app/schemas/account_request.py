from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AccountRequestCreate(BaseModel):
    full_name: str = Field(..., max_length=255)
    email: str = Field(..., max_length=255)
    organization: str | None = Field(None, max_length=255)
    role: Literal["student", "teacher"]
    message: str | None = Field(None, max_length=10_000)

    @field_validator("full_name")
    @classmethod
    def full_name_stripped(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("Full name is required")
        return s

    @field_validator("email")
    @classmethod
    def email_normalized(cls, v: str) -> str:
        s = v.strip().lower()
        if not s:
            raise ValueError("Email is required")
        if "@" not in s or "." not in s.split("@", 1)[-1]:
            raise ValueError("Invalid email address")
        return s

    @field_validator("organization", "message", mode="before")
    @classmethod
    def blank_strings_to_none(cls, v: str | None) -> str | None:
        if v is None:
            return None
        s = str(v).strip()
        return s if s else None


class AccountRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int


class AccountRequestAdminItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    organization: str | None
    role: Literal["student", "teacher"]
    status: Literal["pending", "approved", "rejected"]
    created_at: datetime


class AccountRequestListResponse(BaseModel):
    items: list[AccountRequestAdminItem]
    total: int


class AccountRequestStatusUpdate(BaseModel):
    status: Literal["approved", "rejected"]
