from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime
from sqlalchemy import select

from ..models import Vehicle, User, PriceList
from ..schemas import VehicleCreate, VehicleRead, VehicleUpdate
from ..repository import BaseRepository
from ..core.dependencies import get_db, get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/vehicles", tags=["vehicles"])
vehicle_repository = BaseRepository(Vehicle)
price_list_repository = BaseRepository(PriceList)

# Получение всех транспортных средств
@router.get("/", response_model=List[VehicleRead])
async def get_vehicles(
    category_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db)
):
    if category_id is not None:
        result = await db.execute(
            Vehicle.__table__.select()
            .where(Vehicle.category_id == category_id)
            .offset(skip)
            .limit(limit)
        )
        vehicles = result.fetchall()
        if not vehicles:
            return []
        return [Vehicle(**dict(vehicle._mapping)) for vehicle in vehicles]
    else:
        return await vehicle_repository.get_all(db, skip, limit)

# Получение транспортного средства по ID
@router.get("/{vehicle_id}", response_model=VehicleRead)
async def get_vehicle(vehicle_id: int, db: AsyncSession = Depends(get_db)):
    vehicle = await vehicle_repository.get_by_id(db, vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return vehicle

# Создание нового транспортного средства (только для авторизованных пользователей)
@router.post("/", response_model=VehicleRead, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    vehicle_data: VehicleCreate, 
    price: Optional[int] = Query(None, description="Цена транспортного средства"),
    delivery_time: Optional[datetime] = Query(None, description="Срок поставки"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    vehicle_dict = vehicle_data.model_dump()
    vehicle_dict["user_id"] = current_user.user_id
    vehicle_dict["publication_date"] = datetime.now()
    
    vehicle = await vehicle_repository.create(db, vehicle_dict)
    
    if price is not None and delivery_time is not None:
        if delivery_time.tzinfo is not None:
            delivery_time = delivery_time.replace(tzinfo=None)
            
        price_data = {
            "price": price,
            "delivery_time": delivery_time,
            "vehicle_id": vehicle.vehicle_id,
            "user_id": current_user.user_id
        }
        await price_list_repository.create(db, price_data)
    
    return vehicle

# Обновление транспортного средства (только для владельца или админа)
@router.put("/{vehicle_id}", response_model=VehicleRead)
async def update_vehicle(
    vehicle_id: int, 
    vehicle_data: VehicleUpdate, 
    price: Optional[int] = Query(None, description="Цена транспортного средства"),
    delivery_time: Optional[datetime] = Query(None, description="Срок поставки"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    vehicle = await vehicle_repository.get_by_id(db, vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    
    if vehicle.user_id != current_user.user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to edit this vehicle"
        )
    
    vehicle_dict = vehicle_data.model_dump(exclude_unset=True)
    updated_vehicle = await vehicle_repository.update(db, vehicle_id, vehicle_dict)
    
    if price is not None and delivery_time is not None:
        if delivery_time.tzinfo is not None:
            delivery_time = delivery_time.replace(tzinfo=None)
            
        result = await db.execute(
            select(PriceList).where(PriceList.vehicle_id == vehicle_id)
        )
        existing_price = result.scalars().first()
        
        if existing_price:
            price_data = {
                "price": price,
                "delivery_time": delivery_time
            }
            await price_list_repository.update(db, existing_price.price_id, price_data)
        else:
            price_data = {
                "price": price,
                "delivery_time": delivery_time,
                "vehicle_id": vehicle_id,
                "user_id": current_user.user_id
            }
            await price_list_repository.create(db, price_data)
    
    return updated_vehicle

# Удаление транспортного средства (только для владельца или админа)
@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vehicle(
    vehicle_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    vehicle = await vehicle_repository.get_by_id(db, vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    
    if vehicle.user_id != current_user.user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this vehicle"
        )
    
    success = await vehicle_repository.delete(db, vehicle_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return None

# Получение транспортных средств по ID пользователя
@router.get("/user/{user_id}", response_model=List[VehicleRead])
async def get_vehicles_by_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(Vehicle.__table__.select().where(Vehicle.user_id == user_id))
    vehicles = result.fetchall()
    if not vehicles:
        return []
    
    return [Vehicle(**dict(vehicle._mapping)) for vehicle in vehicles]

# Получение транспортных средств текущего пользователя
@router.get("/my/", response_model=List[VehicleRead])
async def get_my_vehicles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(Vehicle.__table__.select().where(Vehicle.user_id == current_user.user_id))
    vehicles = result.fetchall()
    if not vehicles:
        return []
    
    return [Vehicle(**dict(vehicle._mapping)) for vehicle in vehicles]

# Обновление даты публикации для одного транспортного средства (только для админа)
@router.put("/{vehicle_id}/update-publication-date", response_model=VehicleRead)
async def update_vehicle_publication_date(
    vehicle_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    vehicle = await vehicle_repository.get_by_id(db, vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    
    # Обновляем дату публикации на текущую
    updated_data = {"publication_date": datetime.now()}
    updated_vehicle = await vehicle_repository.update(db, vehicle_id, updated_data)
    
    return updated_vehicle 
