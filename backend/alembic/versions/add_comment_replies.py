"""Add comment reply support

Revision ID: add_comment_replies
Revises: add_newsletter_table
Create Date: 2025-12-10 13:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_comment_replies'
down_revision: Union[str, None] = 'add_newsletter_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add reply_to_id column to comments table
    op.add_column('comments', sa.Column('reply_to_id', sa.Integer(), nullable=True))
    op.create_index('ix_comments_reply_to_id', 'comments', ['reply_to_id'])
    op.create_foreign_key('fk_comments_reply_to_id', 'comments', 'comments', ['reply_to_id'], ['id'], ondelete='CASCADE')
    
    # Add index to user_email for filtering
    op.create_index('ix_comments_user_email', 'comments', ['user_email'])


def downgrade() -> None:
    op.drop_constraint('fk_comments_reply_to_id', 'comments', type_='foreignkey')
    op.drop_index('ix_comments_user_email', table_name='comments')
    op.drop_index('ix_comments_reply_to_id', table_name='comments')
    op.drop_column('comments', 'reply_to_id')
