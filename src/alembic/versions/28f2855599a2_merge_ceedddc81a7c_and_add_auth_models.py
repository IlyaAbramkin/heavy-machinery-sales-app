"""Merge ceedddc81a7c and add_auth_models

Revision ID: 28f2855599a2
Revises: add_auth_models, ceedddc81a7c
Create Date: 2025-04-25 00:34:10.559514

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '28f2855599a2'
down_revision: Union[str, None] = ('add_auth_models', 'ceedddc81a7c')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
