from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..models import Engine
from ..schemas import EngineCreate, EngineRead, EngineUpdate
from ..repository import BaseRepository
from ..core.dependencies import get_db

router = APIRouter(prefix="/engines", tags=["engines"])
engine_repository = BaseRepository(Engine)

# Получение всех двигателей
@router.get("/", response_model=List[EngineRead])
async def get_engines(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await engine_repository.get_all(db, skip, limit)

# Получение двигателя по ID
@router.get("/{engine_id}", response_model=EngineRead)
async def get_engine(engine_id: int, db: AsyncSession = Depends(get_db)):
    engine = await engine_repository.get_by_id(db, engine_id)
    if engine is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Engine not found")
    return engine

# Создание нового двигателя
@router.post("/", response_model=EngineRead, status_code=status.HTTP_201_CREATED)
async def create_engine(engine_data: EngineCreate, db: AsyncSession = Depends(get_db)):
    engine_dict = engine_data.model_dump()
    return await engine_repository.create(db, engine_dict)

# Обновление двигателя
@router.put("/{engine_id}", response_model=EngineRead)
async def update_engine(engine_id: int, engine_data: EngineUpdate, db: AsyncSession = Depends(get_db)):
    engine = await engine_repository.get_by_id(db, engine_id)
    if engine is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Engine not found")
    
    engine_dict = engine_data.model_dump(exclude_unset=True)
    return await engine_repository.update(db, engine_id, engine_dict)

# Удаление двигателя
@router.delete("/{engine_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_engine(engine_id: int, db: AsyncSession = Depends(get_db)):
    success = await engine_repository.delete(db, engine_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Engine not found")
    return None 