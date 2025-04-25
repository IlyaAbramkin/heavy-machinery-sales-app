from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from ..models import Requests, TovaryVZayavke, User, Vehicle, PriceList
from ..schemas import RequestCreate, RequestRead, RequestUpdate, TovaryVZayavkeCreate, TovaryVZayavkeRead
from ..repository import BaseRepository
from ..core.dependencies import get_db, get_current_active_user

router = APIRouter(prefix="/requests", tags=["requests"])
request_repository = BaseRepository(Requests)

# Получение всех заявок
@router.get("/", response_model=List[RequestRead])
async def get_requests(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await request_repository.get_all(db, skip, limit)

# Получение заявки по ID
@router.get("/{request_id}", response_model=RequestRead)
async def get_request(request_id: int, db: AsyncSession = Depends(get_db)):
    request = await request_repository.get_by_id(db, request_id)
    if request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    return request

# Создание новой заявки
@router.post("/", response_model=RequestRead, status_code=status.HTTP_201_CREATED)
async def create_request(request_data: RequestCreate, db: AsyncSession = Depends(get_db)):
    request_dict = request_data.model_dump()
    return await request_repository.create(db, request_dict)

# Обновление заявки
@router.put("/{request_id}", response_model=RequestRead)
async def update_request(request_id: int, request_data: RequestUpdate, db: AsyncSession = Depends(get_db)):
    request = await request_repository.get_by_id(db, request_id)
    if request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    
    request_dict = request_data.model_dump(exclude_unset=True)
    return await request_repository.update(db, request_id, request_dict)

# Удаление заявки
@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(request_id: int, db: AsyncSession = Depends(get_db)):
    success = await request_repository.delete(db, request_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    return None

# Получение заявок по ID пользователя
@router.get("/user/{user_id}", response_model=List[RequestRead])
async def get_requests_by_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(Requests.__table__.select().where(Requests.user_id == user_id))
    requests = result.fetchall()
    if not requests:
        return []
    
    return [Requests(**dict(request._mapping)) for request in requests]

# Получение заявок по статусу
@router.get("/status/{status}", response_model=List[RequestRead])
async def get_requests_by_status(status: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(Requests.__table__.select().where(Requests.status == status))
    requests = result.fetchall()
    if not requests:
        return []
    
    return [Requests(**dict(request._mapping)) for request in requests]

# Создание заказа (заявка + товары)
class OrderItem(TovaryVZayavkeCreate):
    name: str
    price: int

class OrderCreate(RequestCreate):
    tovary_v_zayavke: List[OrderItem]

@router.post("/create-order", response_model=RequestRead, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_active_user)
):
    try:
        request_dict = order_data.model_dump(exclude={'tovary_v_zayavke'})
        if current_user:
            request_dict["user_id"] = current_user.user_id
        
        request = await request_repository.create(db, request_dict)
        
        for item in order_data.tovary_v_zayavke:
            tovary_dict = {
                "request_id": request.request_id,
                "vehicle_id": item.vehicle_id,
                "quantity": item.quantity
            }
            
            stmt = TovaryVZayavke.__table__.insert().values(**tovary_dict)
            await db.execute(stmt)
        
        await db.commit()
        
        return request
    except Exception as e:
        await db.rollback()
        raise e

# Получение заявок текущего пользователя
@router.get("/my/", response_model=List[RequestRead])
async def get_my_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(Requests.__table__.select().where(Requests.user_id == current_user.user_id))
    requests = result.fetchall()
    if not requests:
        return []
    
    return [Requests(**dict(request._mapping)) for request in requests]

# Схема для товара в заказе с дополнительной информацией
class OrderItemDetail(TovaryVZayavkeRead):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None

# Схема для детального вида заказа
class OrderDetail(RequestRead):
    items: List[OrderItemDetail] = []

# Получение детальной информации о заказе, включая товары
@router.get("/details/{request_id}", response_model=OrderDetail)
async def get_order_details(
    request_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_active_user)
):
    request = await request_repository.get_by_id(db, request_id)
    if request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    if current_user and (request.user_id != current_user.user_id and not current_user.is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this order"
        )
    
    result = await db.execute(
        select(TovaryVZayavke)
        .where(TovaryVZayavke.request_id == request_id)
    )
    order_items = result.scalars().all()
    
    items_with_details = []
    for item in order_items:
        vehicle_result = await db.execute(
            select(Vehicle)
            .where(Vehicle.vehicle_id == item.vehicle_id)
        )
        vehicle = vehicle_result.scalars().first()
        
        price_result = await db.execute(
            select(PriceList)
            .where(PriceList.vehicle_id == item.vehicle_id)
            .order_by(PriceList.price_id.desc())  # Берем последнюю цену
            .limit(1)
        )
        price_item = price_result.scalars().first()
        price = price_item.price if price_item else 0
        
        item_dict = {
            "request_id": item.request_id,
            "vehicle_id": item.vehicle_id,
            "quantity": item.quantity,
            "title": vehicle.title if vehicle else None,
            "description": vehicle.description if vehicle else None,
            "price": price
        }
        items_with_details.append(item_dict)
    
    request_dict = {
        "request_id": request.request_id,
        "session_id": request.session_id,
        "company_name": request.company_name,
        "full_name": request.full_name,
        "email": request.email,
        "phone": request.phone,
        "city": request.city,
        "request_date": request.request_date,
        "message": request.message,
        "payment_method": request.payment_method,
        "delivery_type": request.delivery_type,
        "status": request.status,
        "user_id": request.user_id,
        "items": items_with_details
    }
    
    return request_dict 