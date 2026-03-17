from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Class(Base):
    __tablename__ = "classes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    invite_code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    creator = relationship("User", backref="created_classes", foreign_keys=[created_by], lazy="joined")
    members = relationship("ClassMember", back_populates="class_", cascade="all, delete-orphan")
    teachers = relationship("ClassTeacher", back_populates="class_", cascade="all, delete-orphan")


class ClassMember(Base):
    __tablename__ = "class_members"
    __table_args__ = (UniqueConstraint("class_id", "user_id", name="uq_class_member"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    class_id: Mapped[int] = mapped_column(ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    class_ = relationship("Class", back_populates="members")
    user = relationship("User", backref="class_memberships")


class ClassTeacher(Base):
    __tablename__ = "class_teachers"
    __table_args__ = (UniqueConstraint("class_id", "teacher_id", name="uq_class_teacher"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    class_id: Mapped[int] = mapped_column(ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    teacher_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    class_ = relationship("Class", back_populates="teachers")
    teacher = relationship("User", backref="teaching_assignments")
