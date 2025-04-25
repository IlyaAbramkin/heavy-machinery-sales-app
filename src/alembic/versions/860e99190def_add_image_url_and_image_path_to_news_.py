"""Add image_url and image_path to News table

Revision ID: 860e99190def
Revises: 28f2855599a2
Create Date: 2025-04-25 00:34:23.919542

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '860e99190def'
down_revision: Union[str, None] = '28f2855599a2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add image_url and image_path columns to news table
    op.add_column('news', sa.Column('image_url', sa.Text(), nullable=True))
    op.add_column('news', sa.Column('image_path', sa.String(), nullable=True))


def downgrade() -> None:
    # Remove the added columns if downgrading
    op.drop_column('news', 'image_path')
    op.drop_column('news', 'image_url')
