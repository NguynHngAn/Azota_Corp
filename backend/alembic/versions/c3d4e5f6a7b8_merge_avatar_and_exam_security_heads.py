"""merge avatar and exam security heads

Revision ID: c3d4e5f6a7b8
Revises: 768d93d93554, b7f9c2d1e4a6
Create Date: 2026-04-01 18:00:00.000000

"""
from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, tuple[str, str], None] = ("768d93d93554", "b7f9c2d1e4a6")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
