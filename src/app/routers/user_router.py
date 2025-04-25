from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from typing import List

from ..models import User
from ..schemas import UserCreate, UserRead, UserUpdate
from ..repository import BaseRepository
from ..core.dependencies import get_db

router = APIRouter(prefix="/users", tags=["users"])
user_repository = BaseRepository(User)

# Получение всех пользователей
@router.get("/", response_model=List[UserRead])
async def get_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await user_repository.get_all(db, skip, limit)

# Получение пользователя по ID
@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await user_repository.get_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

# Создание нового пользователя
@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    user_dict = user_data.model_dump()
    user = User(**user_dict)
    user.password = user_dict.get("password")
    user_dict = {k: v for k, v in user_dict.items() if k != "password"}
    user_dict["password_hash"] = user.password_hash
    
    try:
        return await user_repository.create(db, user_dict)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Пользователь с таким email уже существует"
        )

# Обновление пользователя
@router.put("/{user_id}", response_model=UserRead)
async def update_user(user_id: int, user_data: UserUpdate, db: AsyncSession = Depends(get_db)):
    user = await user_repository.get_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user_dict = user_data.model_dump(exclude_unset=True)
    
    if "password" in user_dict and user_dict["password"]:
        temp_user = User()
        temp_user.password = user_dict["password"]
        user_dict["password_hash"] = temp_user.password_hash
        del user_dict["password"]
    
    try:
        return await user_repository.update(db, user_id, user_dict)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Пользователь с таким email уже существует"
        )

# Удаление пользователя
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    success = await user_repository.delete(db, user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return None 