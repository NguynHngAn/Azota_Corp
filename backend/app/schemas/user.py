from datetime import datetime

from pydantic import BaseModel, Field

from app.models.user import Role


class UserBase(BaseModel):
    email: str = Field(..., max_length=255)
    full_name: str = Field(..., min_length=1, max_length=255)
    role: Role
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=1, max_length=255)
    role: Role | None = None
    is_active: bool | None = None


class UserInDB(UserBase):
    id: int
    password_hash: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: Role
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
