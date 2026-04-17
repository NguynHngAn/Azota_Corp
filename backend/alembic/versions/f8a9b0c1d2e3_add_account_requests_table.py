"""add account_requests table

Revision ID: f8a9b0c1d2e3
Revises: c689e0069aa4
Create Date: 2026-04-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f8a9b0c1d2e3"
down_revision: Union[str, None] = "c689e0069aa4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "account_requests",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("organization", sa.String(length=255), nullable=True),
        sa.Column(
            "role",
            sa.Enum("student", "teacher", name="accountrequestrole"),
            nullable=False,
        ),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_account_requests_email", "account_requests", ["email"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_account_requests_email", table_name="account_requests")
    op.drop_table("account_requests")
    op.execute(sa.text("DROP TYPE IF EXISTS accountrequestrole"))
