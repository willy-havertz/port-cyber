"""Add newsletter subscription table

Revision ID: add_newsletter_table
Revises: 0540dce2cc32
Create Date: 2025-12-10 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'add_newsletter_table'
down_revision: Union[str, None] = '0540dce2cc32'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create newsletter table
    op.create_table(
        'newsletters',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('subscribed_at', sa.DateTime(), nullable=False),
        sa.Column('unsubscribed_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email', name='uq_newsletters_email')
    )
    op.create_index('ix_newsletters_email', 'newsletters', ['email'])
    op.create_index('ix_newsletters_is_active', 'newsletters', ['is_active'])


def downgrade() -> None:
    op.drop_index('ix_newsletters_is_active', table_name='newsletters')
    op.drop_index('ix_newsletters_email', table_name='newsletters')
    op.drop_table('newsletters')
