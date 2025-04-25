from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..models import TovaryVZayavke
from ..schemas import TovaryVZayavkeCreate, TovaryVZayavkeRead, TovaryVZayavkeUpdate
from ..repository import TovaryVZayavkeRepository
from ..core.dependencies import get_db

router = APIRouter(prefix="/requisitioned-goods", tags=["requisitioned-goods"])
tovary_repository = TovaryVZayavkeRepository(TovaryVZayavke)

# Получение всех товаров в заявках
@router.get("/", response_model=List[TovaryVZayavkeRead])
async def get_all_requisitioned_goods(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await tovary_repository.get_all(db, skip, limit)

# Получение товаров по ID заявки
@router.get("/request/{request_id}", response_model=List[TovaryVZayavkeRead])
async def get_requisitioned_goods_by_request(request_id: int, db: AsyncSession = Depends(get_db)):
    return await tovary_repository.get_by_request_id(db, request_id)

# Получение товара по ID заявки и ID транспортного средства
@router.get("/{request_id}/{vehicle_id}", response_model=TovaryVZayavkeRead)
async def get_requisitioned_good(request_id: int, vehicle_id: int, db: AsyncSession = Depends(get_db)):
    item = await tovary_repository.get_by_ids(db, request_id, vehicle_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requisitioned good not found")
    return item

# Создание нового товара в заявке
@router.post("/", response_model=TovaryVZayavkeRead, status_code=status.HTTP_201_CREATED)
async def create_requisitioned_good(item_data: TovaryVZayavkeCreate, db: AsyncSession = Depends(get_db)):
    item_dict = item_data.model_dump()
    return await tovary_repository.create(db, item_dict)

# Обновление товара в заявке
@router.put("/{request_id}/{vehicle_id}", response_model=TovaryVZayavkeRead)
async def update_requisitioned_good(
    request_id: int, 
    vehicle_id: int, 
    item_data: TovaryVZayavkeUpdate, 
    db: AsyncSession = Depends(get_db)
):
    item = await tovary_repository.get_by_ids(db, request_id, vehicle_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requisitioned good not found")
    
    item_dict = item_data.model_dump(exclude_unset=True)
    return await tovary_repository.update(db, request_id, vehicle_id, item_dict)

# Удаление товара из заявки
@router.delete("/{request_id}/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_requisitioned_good(request_id: int, vehicle_id: int, db: AsyncSession = Depends(get_db)):
    success = await tovary_repository.delete(db, request_id, vehicle_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requisitioned good not found")
    return None 