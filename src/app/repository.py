from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import List, Optional, Type, TypeVar, Generic, Any, Dict

from .models import Base

T = TypeVar('T', bound=Base)

class BaseRepository(Generic[T]):
    def __init__(self, model: Type[T]):
        self.model = model

    # Получение всех записей
    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[T]:
        result = await db.execute(select(self.model).offset(skip).limit(limit))
        return result.scalars().all()

    # Получение записи по идентификатору
    async def get_by_id(self, db: AsyncSession, id_value: int) -> Optional[T]:
        pk_columns = [c for c in self.model.__table__.columns if c.primary_key]
        if not pk_columns:
            raise ValueError(f"No primary key found for model {self.model.__name__}")
        
        id_field = pk_columns[0]
        result = await db.execute(select(self.model).where(id_field == id_value))
        return result.scalars().first()

    # Создание новой записи
    async def create(self, db: AsyncSession, obj_data: Dict[str, Any]) -> T:
        db_obj = self.model(**obj_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    # Обновление существующей записи
    async def update(self, db: AsyncSession, id_value: int, obj_data: Dict[str, Any]) -> Optional[T]:
        pk_columns = [c.name for c in self.model.__table__.columns if c.primary_key]
        if not pk_columns:
            raise ValueError(f"No primary key found for model {self.model.__name__}")
        
        id_field = pk_columns[0]
        
        update_data = {k: v for k, v in obj_data.items() if v is not None}
        if not update_data:
            return await self.get_by_id(db, id_value)

        await db.execute(
            update(self.model)
            .where(getattr(self.model, id_field) == id_value)
            .values(**update_data)
        )
        await db.commit()
        return await self.get_by_id(db, id_value)

    # Удаление записи по идентификатору
    async def delete(self, db: AsyncSession, id_value: int) -> bool:
        pk_columns = [c.name for c in self.model.__table__.columns if c.primary_key]
        if not pk_columns:
            raise ValueError(f"No primary key found for model {self.model.__name__}")
        
        id_field = pk_columns[0]
        
        db_obj = await self.get_by_id(db, id_value)
        if not db_obj:
            return False
        
        await db.execute(
            delete(self.model)
            .where(getattr(self.model, id_field) == id_value)
        )
        await db.commit()
        return True
        
    # Проверка существования записи с указанным идентификатором
    async def exists(self, db: AsyncSession, id_value: int) -> bool:
        pk_columns = [c.name for c in self.model.__table__.columns if c.primary_key]
        if not pk_columns:
            raise ValueError(f"No primary key found for model {self.model.__name__}")
        
        id_field = pk_columns[0]
        
        result = await db.execute(
            select(self.model)
            .where(getattr(self.model, id_field) == id_value)
            .exists()
            .select()
        )
        return result.scalar()


# Специальный класс для TovaryVZayavke (с составным первичным ключом)
class TovaryVZayavkeRepository:
    def __init__(self, model):
        self.model = model

    # Получение всех записей с возможностью разбивки на страницы
    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100):
        result = await db.execute(select(self.model).offset(skip).limit(limit))
        return result.scalars().all()
    
    # Получение всех товаров для конкретной заявки
    async def get_by_request_id(self, db: AsyncSession, request_id: int):
        result = await db.execute(
            select(self.model)
            .where(self.model.request_id == request_id)
        )
        return result.scalars().all()
    
    # Получение записи по составному ключу
    async def get_by_ids(self, db: AsyncSession, request_id: int, vehicle_id: int):
        result = await db.execute(
            select(self.model)
            .where(
                (self.model.request_id == request_id) & 
                (self.model.vehicle_id == vehicle_id)
            )
        )
        return result.scalars().first()
    
    # Создание новой записи товара в заявке
    async def create(self, db: AsyncSession, obj_data: Dict[str, Any]):
        db_obj = self.model(**obj_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    # Обновление существующей записи по составному ключу
    async def update(self, db: AsyncSession, request_id: int, vehicle_id: int, obj_data: Dict[str, Any]):
        update_data = {k: v for k, v in obj_data.items() if v is not None}
        if not update_data:
            return await self.get_by_ids(db, request_id, vehicle_id)
        
        await db.execute(
            update(self.model)
            .where(
                (self.model.request_id == request_id) & 
                (self.model.vehicle_id == vehicle_id)
            )
            .values(**update_data)
        )
        await db.commit()
        return await self.get_by_ids(db, request_id, vehicle_id)
    
    # Удаление записи по составному ключу
    async def delete(self, db: AsyncSession, request_id: int, vehicle_id: int):
        db_obj = await self.get_by_ids(db, request_id, vehicle_id)
        if not db_obj:
            return False
        
        await db.execute(
            delete(self.model)
            .where(
                (self.model.request_id == request_id) & 
                (self.model.vehicle_id == vehicle_id)
            )
        )
        await db.commit()
        return True 