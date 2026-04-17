"""add submission deadline and heartbeat fields

Revision ID: c1d2e3f4a5b6
Revises: b9c8d7e6f5a4
Create Date: 2026-04-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c1d2e3f4a5b6"
down_revision: Union[str, None] = "b9c8d7e6f5a4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("submissions", sa.Column("deadline_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("submissions", sa.Column("last_heartbeat_at", sa.DateTime(timezone=True), nullable=True))
    op.create_index("ix_submissions_deadline_at", "submissions", ["deadline_at"], unique=False)
    op.create_check_constraint(
        "ck_submissions_deadline_requires_started",
        "submissions",
        "deadline_at IS NULL OR started_at IS NOT NULL",
    )
    op.execute(
        sa.text(
            """
            UPDATE submissions AS s
            SET deadline_at = s.started_at + make_interval(mins => a.duration_minutes)
            FROM assignments AS a
            WHERE s.assignment_id = a.id
              AND s.started_at IS NOT NULL
              AND s.deadline_at IS NULL
            """
        )
    )


def downgrade() -> None:
    op.drop_constraint("ck_submissions_deadline_requires_started", "submissions", type_="check")
    op.drop_index("ix_submissions_deadline_at", table_name="submissions")
    op.drop_column("submissions", "last_heartbeat_at")
    op.drop_column("submissions", "deadline_at")
