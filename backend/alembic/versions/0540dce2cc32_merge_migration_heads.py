"""Merge migration heads

Revision ID: 0540dce2cc32
Revises: add_ai_generated_content
Create Date: 2025-12-20 23:37:01.011341

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0540dce2cc32'
down_revision: Union[str, tuple, None] = ('add_thumbnail_url', 'add_ai_generated_content')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
