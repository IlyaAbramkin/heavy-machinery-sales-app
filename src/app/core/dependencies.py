from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from jose import jwt, JWTError
from typing import Optional
from datetime import datetime

from .database import SessionLocal
from ..models import User
from .auth_utils import ALGORITHM, is_token_revoked
from .config import settings
from sqlalchemy.future import select


async def get_db():
    """Получение сессии базы данных"""
    db = SessionLocal()
    try:
        yield db
    finally:
        await db.close()


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    access_token: Optional[str] = Cookie(None),
    token: Optional[str] = Depends(oauth2_scheme)
) -> Optional[User]:
    """
    Получение текущего пользователя из токена.
    Проверяет токен как из cookie, так и из header Authorization.
    """
    token_to_use = access_token or token
    
    if not token_to_use:
        return None

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token_to_use, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        jti = payload.get("jti")
        
        if user_id is None or jti is None:
            raise credentials_exception
        
        if await is_token_revoked(db, jti):
            raise credentials_exception
            
        stmt = select(User).where(User.user_id == int(user_id))
        result = await db.execute(stmt)
        user = result.scalars().first()
        
        if user is None or not user.is_active:
            raise credentials_exception
            
        return user
    except JWTError:
        raise credentials_exception


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Проверка, что текущий пользователь активен"""
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Inactive user"
        )
    
    return current_user


async def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """Проверка, что текущий пользователь является администратором"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not enough permissions"
        )
    
    return current_user 