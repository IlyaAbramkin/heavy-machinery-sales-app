from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..models import PriceList
from ..schemas import PriceListCreate, PriceListRead, PriceListUpdate
from ..repository import BaseRepository
from ..core.dependencies import get_db

router = APIRouter(prefix="/price-list", tags=["price-list"])
price_list_repository = BaseRepository(PriceList)

# Получение всех прайс-листов
@router.get("/", response_model=List[PriceListRead])
async def get_price_list(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await price_list_repository.get_all(db, skip, limit)

# Получение прайс-листа по ID
@router.get("/{price_id}", response_model=PriceListRead)
async def get_price(price_id: int, db: AsyncSession = Depends(get_db)):
    price = await price_list_repository.get_by_id(db, price_id)
    if price is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Price not found")
    return price

# Создание нового прайс-листа
@router.post("/", response_model=PriceListRead, status_code=status.HTTP_201_CREATED)
async def create_price(price_data: PriceListCreate, db: AsyncSession = Depends(get_db)):
    price_dict = price_data.model_dump()
    return await price_list_repository.create(db, price_dict)

# Обновление прайс-листа
@router.put("/{price_id}", response_model=PriceListRead)
async def update_price(price_id: int, price_data: PriceListUpdate, db: AsyncSession = Depends(get_db)):
    price = await price_list_repository.get_by_id(db, price_id)
    if price is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Price not found")
    
    price_dict = price_data.model_dump(exclude_unset=True)
    return await price_list_repository.update(db, price_id, price_dict)

# Удаление прайс-листа
@router.delete("/{price_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_price(price_id: int, db: AsyncSession = Depends(get_db)):
    success = await price_list_repository.delete(db, price_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Price not found")
    return None

# Получение прайс-листов по ID транспортного средства
@router.get("/vehicle/{vehicle_id}", response_model=List[PriceListRead])
async def get_prices_by_vehicle(vehicle_id: int, db: AsyncSession = Depends(get_db)):
    """Get all prices for a specific vehicle"""
    result = await db.execute(PriceList.__table__.select().where(PriceList.vehicle_id == vehicle_id))
    prices = result.fetchall()
    if not prices:
        return []
    
    return [PriceList(**dict(price._mapping)) for price in prices]

# Получение прайс-листов по ID пользователя
@router.get("/user/{user_id}", response_model=List[PriceListRead])
async def get_prices_by_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Get all prices created by a specific user"""
    result = await db.execute(PriceList.__table__.select().where(PriceList.user_id == user_id))
    prices = result.fetchall()
    if not prices:
        return []
    
    return [PriceList(**dict(price._mapping)) for price in prices] 