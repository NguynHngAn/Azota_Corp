"""add question bank

Revision ID: 98ec1665cc40
Revises: 4c77138255ff
Create Date: 2026-03-19 13:44:43.752103

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '98ec1665cc40'
down_revision: Union[str, None] = '4c77138255ff'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'bank_questions',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('owner_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        # Reuse existing enum type created by exams/questions tables.
        sa.Column(
            'question_type',
            postgresql.ENUM('single_choice', 'multiple_choice', name='questiontype', create_type=False),
            nullable=False,
        ),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('explanation', sa.Text(), nullable=True),
        sa.Column('difficulty', sa.Enum('easy', 'medium', 'hard', name='questiondifficulty'), nullable=False, server_default='medium'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_bank_questions_owner_id', 'bank_questions', ['owner_id'])
    op.create_index('ix_bank_questions_question_type', 'bank_questions', ['question_type'])

    op.create_table(
        'bank_answer_options',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('question_id', sa.Integer(), sa.ForeignKey('bank_questions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('order_index', sa.Integer(), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('is_correct', sa.Boolean(), nullable=False, server_default=sa.text('false')),
    )
    op.create_index('ix_bank_answer_options_question_id', 'bank_answer_options', ['question_id'])

    op.create_table(
        'bank_tags',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('owner_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(length=64), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.UniqueConstraint('owner_id', 'name', name='uq_bank_tag_owner_name'),
    )
    op.create_index('ix_bank_tags_owner_id', 'bank_tags', ['owner_id'])

    op.create_table(
        'bank_question_tags',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('question_id', sa.Integer(), sa.ForeignKey('bank_questions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('tag_id', sa.Integer(), sa.ForeignKey('bank_tags.id', ondelete='CASCADE'), nullable=False),
        sa.UniqueConstraint('question_id', 'tag_id', name='uq_bank_question_tag'),
    )
    op.create_index('ix_bank_question_tags_question_id', 'bank_question_tags', ['question_id'])
    op.create_index('ix_bank_question_tags_tag_id', 'bank_question_tags', ['tag_id'])


def downgrade() -> None:
    op.drop_index('ix_bank_question_tags_tag_id', table_name='bank_question_tags')
    op.drop_index('ix_bank_question_tags_question_id', table_name='bank_question_tags')
    op.drop_table('bank_question_tags')

    op.drop_index('ix_bank_tags_owner_id', table_name='bank_tags')
    op.drop_table('bank_tags')

    op.drop_index('ix_bank_answer_options_question_id', table_name='bank_answer_options')
    op.drop_table('bank_answer_options')

    op.drop_index('ix_bank_questions_question_type', table_name='bank_questions')
    op.drop_index('ix_bank_questions_owner_id', table_name='bank_questions')
    op.drop_table('bank_questions')

    op.execute('DROP TYPE IF EXISTS questiondifficulty')
