from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..models import Category
from ..schemas import CategoryCreate, CategoryRead, CategoryUpdate
from ..repository import BaseRepository
from ..core.dependencies import get_db

router = APIRouter(prefix="/categories", tags=["categories"])
category_repository = BaseRepository(Category)

# Получение всех категорий
@router.get("/", response_model=List[CategoryRead])
async def get_categories(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await category_repository.get_all(db, skip, limit)

# Получение категории по ID
@router.get("/{category_id}", response_model=CategoryRead)
async def get_category(category_id: int, db: AsyncSession = Depends(get_db)):
    category = await category_repository.get_by_id(db, category_id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category

# Создание новой категории
@router.post("/", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(category_data: CategoryCreate, db: AsyncSession = Depends(get_db)):
    category_dict = category_data.model_dump()
    return await category_repository.create(db, category_dict)

# Обновление категории
@router.put("/{category_id}", response_model=CategoryRead)
async def update_category(category_id: int, category_data: CategoryUpdate, db: AsyncSession = Depends(get_db)):
    category = await category_repository.get_by_id(db, category_id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    category_dict = category_data.model_dump(exclude_unset=True)
    return await category_repository.update(db, category_id, category_dict)

# Удаление категории
@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: int, db: AsyncSession = Depends(get_db)):
    success = await category_repository.delete(db, category_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return None 