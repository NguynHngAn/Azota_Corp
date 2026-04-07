from datetime import datetime

from pydantic import BaseModel, Field, model_validator

from app.models.exam import QuestionType


class AnswerOptionBase(BaseModel):
    order_index: int = Field(..., ge=0)
    text: str = Field(..., min_length=1)
    is_correct: bool = False


class AnswerOptionCreate(AnswerOptionBase):
    pass


class AnswerOptionResponse(AnswerOptionBase):
    id: int

    model_config = {"from_attributes": True}


class QuestionBase(BaseModel):
    order_index: int = Field(..., ge=0)
    question_type: QuestionType
    text: str = Field(..., min_length=1)
    options: list[AnswerOptionCreate] = Field(..., min_length=1)


class QuestionCreate(QuestionBase):
    @model_validator(mode="after")
    def validate_correct_options(self):
        correct_count = sum(1 for o in self.options if o.is_correct)
        if self.question_type == QuestionType.single_choice and correct_count != 1:
            raise ValueError("Single choice must have exactly one correct option")
        if self.question_type == QuestionType.multiple_choice and correct_count < 1:
            raise ValueError("Multiple choice must have at least one correct option")
        return self


class QuestionUpdate(BaseModel):
    order_index: int | None = Field(None, ge=0)
    question_type: QuestionType | None = None
    text: str | None = Field(None, min_length=1)
    options: list[AnswerOptionCreate] | None = None

    @model_validator(mode="after")
    def validate_correct_options(self):
        if self.options is None:
            return self
        qtype = self.question_type or QuestionType.single_choice
        correct_count = sum(1 for o in self.options if o.is_correct)
        if qtype == QuestionType.single_choice and correct_count != 1:
            raise ValueError("Single choice must have exactly one correct option")
        if qtype == QuestionType.multiple_choice and correct_count < 1:
            raise ValueError("Multiple choice must have at least one correct option")
        return self


class QuestionResponse(BaseModel):
    id: int
    exam_id: int
    order_index: int
    question_type: QuestionType
    text: str
    options: list[AnswerOptionResponse] = []

    model_config = {"from_attributes": True}


class ExamBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)
    is_draft: bool = True
    shuffle_questions: bool = False
    shuffle_options: bool = False


class ExamCreate(ExamBase):
    questions: list[QuestionCreate] | None = None


class ExamUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)
    is_draft: bool | None = None
    shuffle_questions: bool | None = None
    shuffle_options: bool | None = None


class ExamResponse(ExamBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None

    model_config = {"from_attributes": True}


class ExamDetail(ExamResponse):
    questions: list[QuestionResponse] = []
