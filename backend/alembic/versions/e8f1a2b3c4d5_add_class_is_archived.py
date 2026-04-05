"""add is_archived to classes

Revision ID: e8f1a2b3c4d5
Revises: c3d4e5f6a7b8
Create Date: 2026-04-04

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "e8f1a2b3c4d5"
down_revision: Union[str, None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "classes",
        sa.Column("is_archived", sa.Boolean(), nullable=False, server_default=sa.false()),
    )


def downgrade() -> None:
    op.drop_column("classes", "is_archived")
