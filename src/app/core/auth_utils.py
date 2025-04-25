from datetime import datetime, timedelta
import uuid
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.future import select
from fastapi import HTTPException, status
from typing import Optional

from ..models import User, TokenBlacklist
from .config import settings

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

def create_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Создание JWT токена"""
    to_encode = data.copy()
    
    # Генерируем уникальный идентификатор для токена
    jti = str(uuid.uuid4())
    to_encode.update({"jti": jti})
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM), jti, expire

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Получение пользователя по email"""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    """Аутентификация пользователя по email и паролю"""
    user = await get_user_by_email(db, email)
    if not user or not user.verify_password(password):
        return None
    return user

async def is_token_revoked(db: AsyncSession, jti: str) -> bool:
    """Проверка, отозван ли токен"""
    stmt = select(TokenBlacklist).where(TokenBlacklist.token_jti == jti)
    result = await db.execute(stmt)
    return result.scalars().first() is not None

async def revoke_token(db: AsyncSession, jti: str, expires_at: datetime) -> None:
    """Добавление токена в черный список"""
    token_blacklist = TokenBlacklist(token_jti=jti, expires_at=expires_at)
    db.add(token_blacklist)
    await db.commit()

async def cleanup_expired_tokens(db: AsyncSession) -> None:
    """Очистка устаревших записей из черного списка токенов"""
    stmt = delete(TokenBlacklist).where(TokenBlacklist.expires_at < datetime.utcnow())
    await db.execute(stmt)
    await db.commit() 