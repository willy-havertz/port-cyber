"""Add markdown support to writeups

Revision ID: add_markdown_support
Revises: add_contact_tables
Create Date: 2024-12-11 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_markdown_support'
down_revision = 'add_contact_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to writeups table
    op.add_column('writeups', sa.Column('writeup_content', sa.Text(), nullable=True))
    op.add_column('writeups', sa.Column('content_type', sa.String(), nullable=True, server_default='pdf'))
    
    # Make writeup_url nullable (since markdown content doesn't need it)
    op.alter_column('writeups', 'writeup_url', existing_type=sa.String(), nullable=True)


def downgrade() -> None:
    # Remove columns
    op.drop_column('writeups', 'content_type')
    op.drop_column('writeups', 'writeup_content')
    
    # Revert writeup_url to not nullable
    op.alter_column('writeups', 'writeup_url', existing_type=sa.String(), nullable=False)
