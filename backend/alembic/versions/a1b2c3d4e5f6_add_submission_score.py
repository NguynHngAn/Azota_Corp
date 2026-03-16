"""add submission score

Revision ID: a1b2c3d4e5f6
Revises: 4d1ddb43cd25
Create Date: 2026-03-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "4d1ddb43cd25"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("submissions", sa.Column("score", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("submissions", "score")
