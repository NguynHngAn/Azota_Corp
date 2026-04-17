"""add account_request status

Revision ID: e7d6c5b4a321
Revises: f8a9b0c1d2e3
Create Date: 2026-04-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "e7d6c5b4a321"
down_revision: Union[str, None] = "f8a9b0c1d2e3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    st = postgresql.ENUM("pending", "approved", "rejected", name="accountrequeststatus", create_type=True)
    st.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "account_requests",
        sa.Column("status", st, nullable=False, server_default="pending"),
    )
    op.alter_column("account_requests", "status", server_default=None)


def downgrade() -> None:
    op.drop_column("account_requests", "status")
    op.execute(sa.text("DROP TYPE IF EXISTS accountrequeststatus"))
