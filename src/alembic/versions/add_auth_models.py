"""Add authorization models

Revision ID: add_auth_models
Revises: 
Create Date: 2024-10-20

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_auth_models'
down_revision = None  # Заменить на ID последней миграции, если она существует
branch_labels = None
depends_on = None


def upgrade():
    # Добавляем новые поля в таблицу users
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default='false'))
    
    # Создаем таблицу для отозванных токенов
    op.create_table(
        'token_blacklist',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('token_jti', sa.String(), nullable=False),
        sa.Column('revoked_at', sa.DateTime(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token_jti')
    )


def downgrade():
    # Удаляем таблицу token_blacklist
    op.drop_table('token_blacklist')
    
    # Удаляем добавленные поля из таблицы users
    op.drop_column('users', 'is_admin')
    op.drop_column('users', 'is_active') 