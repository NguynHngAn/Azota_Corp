from typing import Literal

from pydantic import BaseModel, Field, model_validator

from app.models.exam import QuestionType
from app.models.question_bank import QuestionDifficulty
from app.schemas.question_bank_schema import BankQuestionCreate


TeacherAITask = Literal["generate_questions", "suggest_similar_questions"]


class TeacherAIQuestionRequest(BaseModel):
    task: TeacherAITask
    prompt: str = Field(..., min_length=1, max_length=2000)
    count: int = Field(default=5, ge=1, le=20)
    question_type: QuestionType | None = None
    difficulty: QuestionDifficulty = QuestionDifficulty.medium
    language: str = Field(default="Vietnamese", min_length=1, max_length=50)
    source_question_text: str | None = Field(default=None, max_length=4000)
    tags: list[str] = Field(default_factory=list, max_length=10)

    @model_validator(mode="after")
    def validate_source_question(self):
        if self.task == "suggest_similar_questions" and not (self.source_question_text or "").strip():
            raise ValueError("source_question_text is required for suggest_similar_questions")
        return self


class TeacherAIQuestionResponse(BaseModel):
    task: TeacherAITask
    model: str
    provider: str
    note: str | None = None
    items: list[BankQuestionCreate]


class AssignmentInsightResponse(BaseModel):
    """AI commentary for an assignment report (teacher-triggered)."""

    model: str
    provider: str
    summary: str
    strengths: list[str] = Field(default_factory=list)
    concerns: list[str] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)
