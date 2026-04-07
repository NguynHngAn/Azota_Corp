"""assignment_safety_indexes

Revision ID: 97951d7c6273
Revises: e8f1a2b3c4d5
Create Date: 2026-04-07 15:20:58.698288

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '97951d7c6273'
down_revision: Union[str, None] = 'e8f1a2b3c4d5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_check_constraint(
        "ck_assignments_time_window",
        "assignments",
        "start_time < end_time",
    )
    op.create_check_constraint(
        "ck_submissions_score_range",
        "submissions",
        "score IS NULL OR (score >= 0 AND score <= 100)",
    )
    op.create_check_constraint(
        "ck_submissions_violation_nonneg",
        "submissions",
        "violation_count >= 0",
    )
    op.create_index(
        "ix_submissions_assignment_submitted",
        "submissions",
        ["assignment_id", "submitted_at"],
        unique=False,
    )
    op.create_index(
        "ix_submissions_user_assignment_submitted",
        "submissions",
        ["user_id", "assignment_id", "submitted_at"],
        unique=False,
    )
    op.create_index(
        "ix_anti_cheat_submission_created",
        "anti_cheat_events",
        ["submission_id", "created_at"],
        unique=False,
    )
    op.create_index(
        "ix_anti_cheat_assignment_user_created",
        "anti_cheat_events",
        ["assignment_id", "user_id", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_anti_cheat_assignment_user_created", table_name="anti_cheat_events")
    op.drop_index("ix_anti_cheat_submission_created", table_name="anti_cheat_events")
    op.drop_index("ix_submissions_user_assignment_submitted", table_name="submissions")
    op.drop_index("ix_submissions_assignment_submitted", table_name="submissions")
    op.drop_constraint("ck_submissions_violation_nonneg", "submissions", type_="check")
    op.drop_constraint("ck_submissions_score_range", "submissions", type_="check")
    op.drop_constraint("ck_assignments_time_window", "assignments", type_="check")
