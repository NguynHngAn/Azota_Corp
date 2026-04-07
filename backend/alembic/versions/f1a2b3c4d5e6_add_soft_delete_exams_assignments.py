"""add soft delete for exams and assignments

Revision ID: f1a2b3c4d5e6
Revises: c3d4e5f6a7b8
Create Date: 2026-04-07 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f1a2b3c4d5e6"
down_revision: Union[str, tuple[str, str], None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("exams", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))
    op.create_index(op.f("ix_exams_deleted_at"), "exams", ["deleted_at"], unique=False)

    op.add_column("assignments", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))
    op.create_index(op.f("ix_assignments_deleted_at"), "assignments", ["deleted_at"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_assignments_deleted_at"), table_name="assignments")
    op.drop_column("assignments", "deleted_at")

    op.drop_index(op.f("ix_exams_deleted_at"), table_name="exams")
    op.drop_column("exams", "deleted_at")

