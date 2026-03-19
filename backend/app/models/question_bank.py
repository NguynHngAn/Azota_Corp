import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.exam import QuestionType


class QuestionDifficulty(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class BankQuestion(Base):
    __tablename__ = "bank_questions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    question_type: Mapped[QuestionType] = mapped_column(Enum(QuestionType), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    difficulty: Mapped[QuestionDifficulty] = mapped_column(Enum(QuestionDifficulty), nullable=False, default=QuestionDifficulty.medium)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    owner = relationship("User", backref="bank_questions", foreign_keys=[owner_id])
    options = relationship(
        "BankAnswerOption",
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="BankAnswerOption.order_index",
    )
    tags = relationship("BankTag", secondary="bank_question_tags", back_populates="questions")


class BankAnswerOption(Base):
    __tablename__ = "bank_answer_options"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("bank_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    question = relationship("BankQuestion", back_populates="options")


class BankTag(Base):
    __tablename__ = "bank_tags"
    __table_args__ = (UniqueConstraint("owner_id", "name", name="uq_bank_tag_owner_name"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    owner = relationship("User", backref="bank_tags", foreign_keys=[owner_id])
    questions = relationship("BankQuestion", secondary="bank_question_tags", back_populates="tags")


class BankQuestionTag(Base):
    __tablename__ = "bank_question_tags"
    __table_args__ = (UniqueConstraint("question_id", "tag_id", name="uq_bank_question_tag"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("bank_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    tag_id: Mapped[int] = mapped_column(ForeignKey("bank_tags.id", ondelete="CASCADE"), nullable=False, index=True)

