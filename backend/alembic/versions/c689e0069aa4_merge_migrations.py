"""merge migrations

Revision ID: c689e0069aa4
Revises: 97951d7c6273, f1a2b3c4d5e6
Create Date: 2026-04-09 11:01:52.850159

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c689e0069aa4'
down_revision: Union[str, Sequence[str], None] = (
    '97951d7c6273', 
    'f1a2b3c4d5e6',
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
