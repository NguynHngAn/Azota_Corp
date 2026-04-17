"""add assignment max_attempts and submission attempt_no

Revision ID: a9b8c7d6e5f4
Revises: d4e5f6a7b8c9
Create Date: 2026-04-16 17:35:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "a9b8c7d6e5f4"
down_revision = "d4e5f6a7b8c9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "assignments",
        sa.Column("max_attempts", sa.Integer(), nullable=False, server_default="1"),
    )
    op.alter_column("assignments", "max_attempts", server_default=None)

    op.add_column(
        "submissions",
        sa.Column("attempt_no", sa.Integer(), nullable=False, server_default="1"),
    )
    op.alter_column("submissions", "attempt_no", server_default=None)

    op.drop_constraint("uq_submission_assignment_user", "submissions", type_="unique")
    op.create_unique_constraint(
        "uq_submission_assignment_user_attempt",
        "submissions",
        ["assignment_id", "user_id", "attempt_no"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_submission_assignment_user_attempt", "submissions", type_="unique")
    op.create_unique_constraint(
        "uq_submission_assignment_user",
        "submissions",
        ["assignment_id", "user_id"],
    )
    op.drop_column("submissions", "attempt_no")
    op.drop_column("assignments", "max_attempts")

