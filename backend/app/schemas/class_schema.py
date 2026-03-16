from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.user import UserResponse


class ClassBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)


class ClassCreate(ClassBase):
    pass


class ClassResponse(ClassBase):
    id: int
    created_by: int
    invite_code: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ClassDetail(ClassResponse):
    creator: UserResponse | None = None
    member_count: int = 0


class ClassMemberResponse(BaseModel):
    id: int
    class_id: int
    user_id: int
    joined_at: datetime
    user: UserResponse | None = None

    model_config = {"from_attributes": True}


class AddMemberRequest(BaseModel):
    user_id: int = Field(..., gt=0)


class JoinClassRequest(BaseModel):
    invite_code: str = Field(..., min_length=1, max_length=32)


class UpdateClassTeacherRequest(BaseModel):
    teacher_id: int = Field(..., gt=0)
