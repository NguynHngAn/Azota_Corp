from datetime import datetime

from pydantic import BaseModel, Field, model_validator

from app.models.exam import QuestionType
from app.models.question_bank import QuestionDifficulty


class BankAnswerOptionBase(BaseModel):
    order_index: int = Field(..., ge=0)
    text: str = Field(..., min_length=1)
    is_correct: bool = False


class BankAnswerOptionCreate(BankAnswerOptionBase):
    pass


class BankAnswerOptionResponse(BankAnswerOptionBase):
    id: int

    model_config = {"from_attributes": True}


class BankQuestionBase(BaseModel):
    question_type: QuestionType
    text: str = Field(..., min_length=1)
    explanation: str | None = None
    difficulty: QuestionDifficulty = QuestionDifficulty.medium
    is_active: bool = True
    options: list[BankAnswerOptionCreate] = Field(..., min_length=1)
    tags: list[str] = Field(default_factory=list)


class BankQuestionCreate(BankQuestionBase):
    @model_validator(mode="after")
    def validate_correct_options(self):
        correct_count = sum(1 for o in self.options if o.is_correct)
        if self.question_type == QuestionType.single_choice and correct_count != 1:
            raise ValueError("Single choice must have exactly one correct option")
        if self.question_type == QuestionType.multiple_choice and correct_count < 1:
            raise ValueError("Multiple choice must have at least one correct option")
        return self


class BankQuestionUpdate(BaseModel):
    question_type: QuestionType | None = None
    text: str | None = Field(None, min_length=1)
    explanation: str | None = None
    difficulty: QuestionDifficulty | None = None
    is_active: bool | None = None
    options: list[BankAnswerOptionCreate] | None = None
    tags: list[str] | None = None

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


class BankQuestionResponse(BaseModel):
    id: int
    owner_id: int
    question_type: QuestionType
    text: str
    explanation: str | None = None
    difficulty: QuestionDifficulty
    is_active: bool
    created_at: datetime
    updated_at: datetime
    options: list[BankAnswerOptionResponse] = []
    tags: list[str] = []

    model_config = {"from_attributes": True}


class BankQuestionListItem(BaseModel):
    id: int
    question_type: QuestionType
    text: str
    difficulty: QuestionDifficulty
    is_active: bool
    created_at: datetime
    updated_at: datetime
    tags: list[str] = []


class BankQuestionListResponse(BaseModel):
    total: int
    items: list[BankQuestionListItem]


class AddFromBankRequest(BaseModel):
    bank_question_ids: list[int] = Field(..., min_length=1)


class AddFromBankResponse(BaseModel):
    added: int
    question_ids: list[int]


class QuestionImportPreviewItem(BaseModel):
    question_type: QuestionType
    text: str
    difficulty: QuestionDifficulty
    options_count: int
    tags: list[str] = []


class QuestionImportResponse(BaseModel):
    total: int
    imported: int
    preview: list[QuestionImportPreviewItem]
