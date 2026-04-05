from datetime import datetime

from pydantic import BaseModel, Field, model_validator

from app.schemas.user import UserResponse


class ClassBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)


class ClassCreate(ClassBase):
    pass


class ClassUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)

    @model_validator(mode="after")
    def at_least_one_field(self):
        if self.name is None and self.description is None:
            raise ValueError("At least one of name or description must be provided")
        return self


class ClassResponse(ClassBase):
    id: int
    created_by: int
    invite_code: str
    created_at: datetime
    is_archived: bool = False

    model_config = {"from_attributes": True}


class ClassDetail(ClassResponse):
    creator: UserResponse | None = None
    member_count: int = 0
    can_manage: bool = False


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


class AddClassTeachersRequest(BaseModel):
    teacher_ids: list[int] = Field(..., min_length=1)
