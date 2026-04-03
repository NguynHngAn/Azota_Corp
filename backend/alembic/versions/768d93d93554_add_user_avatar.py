"""add user avatar

Revision ID: 768d93d93554
Revises: 98ec1665cc40
Create Date: 2026-03-19 14:18:00.632542

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '768d93d93554'
down_revision: Union[str, None] = '98ec1665cc40'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('avatar_url', sa.String(length=512), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'avatar_url')
