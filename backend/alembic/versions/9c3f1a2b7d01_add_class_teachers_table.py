"""add class_teachers table

Revision ID: 9c3f1a2b7d01
Revises: a1b2c3d4e5f6
Create Date: 2026-03-17

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9c3f1a2b7d01"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "class_teachers",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("class_id", sa.Integer(), nullable=False),
        sa.Column("teacher_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["class_id"], ["classes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["teacher_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("class_id", "teacher_id", name="uq_class_teacher"),
    )

    # Backfill: add the current primary teacher (classes.created_by) as a class teacher
    op.execute(
        sa.text(
            """
            INSERT INTO class_teachers (class_id, teacher_id)
            SELECT c.id, c.created_by
            FROM classes c
            WHERE NOT EXISTS (
                SELECT 1 FROM class_teachers ct
                WHERE ct.class_id = c.id AND ct.teacher_id = c.created_by
            )
            """
        )
    )


def downgrade() -> None:
    op.drop_table("class_teachers")

