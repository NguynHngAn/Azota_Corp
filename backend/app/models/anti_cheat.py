from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AntiCheatEvent(Base):
    __tablename__ = "anti_cheat_events"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    assignment_id: Mapped[int] = mapped_column(
        ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    submission_id: Mapped[int | None] = mapped_column(
        ForeignKey("submissions.id", ondelete="CASCADE"), nullable=True, index=True
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    event_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    meta: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    assignment = relationship("Assignment", backref="anti_cheat_events")
    submission = relationship("Submission", backref="anti_cheat_events")
    user = relationship("User", backref="anti_cheat_events")

