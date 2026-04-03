"""add anti cheat events

Revision ID: 4c77138255ff
Revises: 9c3f1a2b7d01
Create Date: 2026-03-19 11:22:50.349160

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '4c77138255ff'
down_revision: Union[str, None] = '9c3f1a2b7d01'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'anti_cheat_events',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('assignment_id', sa.Integer(), sa.ForeignKey('assignments.id', ondelete='CASCADE'), nullable=False),
        sa.Column('submission_id', sa.Integer(), sa.ForeignKey('submissions.id', ondelete='CASCADE'), nullable=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('event_type', sa.String(length=64), nullable=False),
        sa.Column('meta', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_anti_cheat_events_assignment_id', 'anti_cheat_events', ['assignment_id'])
    op.create_index('ix_anti_cheat_events_submission_id', 'anti_cheat_events', ['submission_id'])
    op.create_index('ix_anti_cheat_events_user_id', 'anti_cheat_events', ['user_id'])
    op.create_index('ix_anti_cheat_events_event_type', 'anti_cheat_events', ['event_type'])
    op.create_index('ix_anti_cheat_events_created_at', 'anti_cheat_events', ['created_at'])


def downgrade() -> None:
    op.drop_index('ix_anti_cheat_events_created_at', table_name='anti_cheat_events')
    op.drop_index('ix_anti_cheat_events_event_type', table_name='anti_cheat_events')
    op.drop_index('ix_anti_cheat_events_user_id', table_name='anti_cheat_events')
    op.drop_index('ix_anti_cheat_events_submission_id', table_name='anti_cheat_events')
    op.drop_index('ix_anti_cheat_events_assignment_id', table_name='anti_cheat_events')
    op.drop_table('anti_cheat_events')
