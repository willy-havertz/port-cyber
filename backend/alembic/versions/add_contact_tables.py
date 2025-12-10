"""Add contact_messages and spam_logs tables

Revision ID: add_contact_tables
Revises: add_thumbnail_url
Create Date: 2025-12-10 12:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_contact_tables'
down_revision: Union[str, None] = 'add_thumbnail_url'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create contact_messages table
    op.create_table(
        'contact_messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('subject', sa.String(200), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_contact_messages_email', 'contact_messages', ['email'])
    op.create_index('ix_contact_messages_ip_address', 'contact_messages', ['ip_address'])
    op.create_index('ix_contact_messages_created_at', 'contact_messages', ['created_at'])
    
    # Create spam_logs table
    op.create_table(
        'spam_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('name', sa.String(100), nullable=True),
        sa.Column('reason', sa.String(255), nullable=False),
        sa.Column('contact_data', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_spam_logs_ip_address', 'spam_logs', ['ip_address'])
    op.create_index('ix_spam_logs_email', 'spam_logs', ['email'])
    op.create_index('ix_spam_logs_reason', 'spam_logs', ['reason'])
    op.create_index('ix_spam_logs_created_at', 'spam_logs', ['created_at'])


def downgrade() -> None:
    op.drop_index('ix_spam_logs_created_at', 'spam_logs')
    op.drop_index('ix_spam_logs_reason', 'spam_logs')
    op.drop_index('ix_spam_logs_email', 'spam_logs')
    op.drop_index('ix_spam_logs_ip_address', 'spam_logs')
    op.drop_table('spam_logs')
    
    op.drop_index('ix_contact_messages_created_at', 'contact_messages')
    op.drop_index('ix_contact_messages_ip_address', 'contact_messages')
    op.drop_index('ix_contact_messages_email', 'contact_messages')
    op.drop_table('contact_messages')
