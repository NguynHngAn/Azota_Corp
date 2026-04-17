"""add unique heartbeat missed index

Revision ID: d4e5f6a7b8c9
Revises: c1d2e3f4a5b6
Create Date: 2026-04-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, None] = "c1d2e3f4a5b6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index(
        "uq_heartbeat_missed_once",
        "anti_cheat_events",
        ["submission_id"],
        unique=True,
        postgresql_where=sa.text("event_type = 'HEARTBEAT_MISSED'"),
    )


def downgrade() -> None:
    op.drop_index("uq_heartbeat_missed_once", table_name="anti_cheat_events")
