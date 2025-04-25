from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..models import Chassis
from ..schemas import ChassisCreate, ChassisRead, ChassisUpdate
from ..repository import BaseRepository
from ..core.dependencies import get_db

router = APIRouter(prefix="/chassis", tags=["chassis"])
chassis_repository = BaseRepository(Chassis)

# Получение всех шасси
@router.get("/", response_model=List[ChassisRead])
async def get_chassis_list(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await chassis_repository.get_all(db, skip, limit)

# Получение шасси по ID
@router.get("/{chassis_id}", response_model=ChassisRead)
async def get_chassis(chassis_id: int, db: AsyncSession = Depends(get_db)):
    chassis = await chassis_repository.get_by_id(db, chassis_id)
    if chassis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chassis not found")
    return chassis

# Создание нового шасси
@router.post("/", response_model=ChassisRead, status_code=status.HTTP_201_CREATED)
async def create_chassis(chassis_data: ChassisCreate, db: AsyncSession = Depends(get_db)):
    chassis_dict = chassis_data.model_dump()
    return await chassis_repository.create(db, chassis_dict)

# Обновление шасси
@router.put("/{chassis_id}", response_model=ChassisRead)
async def update_chassis(chassis_id: int, chassis_data: ChassisUpdate, db: AsyncSession = Depends(get_db)):
    chassis = await chassis_repository.get_by_id(db, chassis_id)
    if chassis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chassis not found")
    
    chassis_dict = chassis_data.model_dump(exclude_unset=True)
    return await chassis_repository.update(db, chassis_id, chassis_dict)

# Удаление шасси
@router.delete("/{chassis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chassis(chassis_id: int, db: AsyncSession = Depends(get_db)):
    success = await chassis_repository.delete(db, chassis_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chassis not found")
    return None 