from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..models import Factory
from ..schemas import FactoryCreate, FactoryRead, FactoryUpdate
from ..repository import BaseRepository
from ..core.dependencies import get_db

router = APIRouter(prefix="/factories", tags=["factories"])
factory_repository = BaseRepository(Factory)

# Получение всех заводов
@router.get("/", response_model=List[FactoryRead])
async def get_factories(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await factory_repository.get_all(db, skip, limit)

# Получение завода по ID
@router.get("/{factory_id}", response_model=FactoryRead)
async def get_factory(factory_id: int, db: AsyncSession = Depends(get_db)):
    factory = await factory_repository.get_by_id(db, factory_id)
    if factory is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Factory not found")
    return factory

# Создание нового завода
@router.post("/", response_model=FactoryRead, status_code=status.HTTP_201_CREATED)
async def create_factory(factory_data: FactoryCreate, db: AsyncSession = Depends(get_db)):
    factory_dict = factory_data.model_dump()
    return await factory_repository.create(db, factory_dict)

# Обновление завода
@router.put("/{factory_id}", response_model=FactoryRead)
async def update_factory(factory_id: int, factory_data: FactoryUpdate, db: AsyncSession = Depends(get_db)):
    factory = await factory_repository.get_by_id(db, factory_id)
    if factory is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Factory not found")
    
    factory_dict = factory_data.model_dump(exclude_unset=True)
    return await factory_repository.update(db, factory_id, factory_dict)

# Удаление завода
@router.delete("/{factory_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_factory(factory_id: int, db: AsyncSession = Depends(get_db)):
    success = await factory_repository.delete(db, factory_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Factory not found")
    return None 