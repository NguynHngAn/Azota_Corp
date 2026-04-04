"""add exam security and shuffle fields

Revision ID: b7f9c2d1e4a6
Revises: 98ec1665cc40
Create Date: 2026-04-01 17:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "b7f9c2d1e4a6"
down_revision: Union[str, None] = "98ec1665cc40"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("exams", sa.Column("shuffle_questions", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    op.add_column("exams", sa.Column("shuffle_options", sa.Boolean(), nullable=False, server_default=sa.text("false")))

    op.add_column("assignments", sa.Column("shuffle_questions", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    op.add_column("assignments", sa.Column("shuffle_options", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    op.add_column("assignments", sa.Column("max_violations", sa.Integer(), nullable=False, server_default="3"))

    op.add_column("submissions", sa.Column("auto_submitted", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    op.add_column("submissions", sa.Column("submit_reason", sa.String(length=64), nullable=True))
    op.add_column("submissions", sa.Column("violation_count", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("submissions", sa.Column("question_snapshot", postgresql.JSONB(astext_type=sa.Text()), nullable=True))


def downgrade() -> None:
    op.drop_column("submissions", "question_snapshot")
    op.drop_column("submissions", "violation_count")
    op.drop_column("submissions", "submit_reason")
    op.drop_column("submissions", "auto_submitted")

    op.drop_column("assignments", "max_violations")
    op.drop_column("assignments", "shuffle_options")
    op.drop_column("assignments", "shuffle_questions")

    op.drop_column("exams", "shuffle_options")
    op.drop_column("exams", "shuffle_questions")
