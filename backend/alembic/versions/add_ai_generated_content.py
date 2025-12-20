"""Add AI-generated content fields to writeups

Revision ID: add_ai_generated_content
Revises: add_thumbnail_url
Create Date: 2024-12-20 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_ai_generated_content'
down_revision = 'add_markdown_support'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add AI-generated content columns to writeups table
    op.add_column('writeups', sa.Column('methodology', sa.Text(), nullable=True))
    op.add_column('writeups', sa.Column('tools_used', sa.Text(), nullable=True))
    op.add_column('writeups', sa.Column('key_findings', sa.Text(), nullable=True))
    op.add_column('writeups', sa.Column('lessons_learned', sa.Text(), nullable=True))


def downgrade() -> None:
    # Remove AI-generated content columns
    op.drop_column('writeups', 'lessons_learned')
    op.drop_column('writeups', 'key_findings')
    op.drop_column('writeups', 'tools_used')
    op.drop_column('writeups', 'methodology')
