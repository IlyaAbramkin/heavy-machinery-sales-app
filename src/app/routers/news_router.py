from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..models import News
from ..schemas import NewsCreate, NewsRead, NewsUpdate
from ..repository import BaseRepository
from ..core.dependencies import get_db

router = APIRouter(prefix="/news", tags=["news"])
news_repository = BaseRepository(News)

# Получение всех новостей
@router.get("/", response_model=List[NewsRead])
async def get_news(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await news_repository.get_all(db, skip, limit)

# Получение новости по ID
@router.get("/{news_id}", response_model=NewsRead)
async def get_news_item(news_id: int, db: AsyncSession = Depends(get_db)):
    news = await news_repository.get_by_id(db, news_id)
    if news is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News item not found")
    return news

# Создание новой новости
@router.post("/", response_model=NewsRead, status_code=status.HTTP_201_CREATED)
async def create_news(news_data: NewsCreate, db: AsyncSession = Depends(get_db)):
    news_dict = news_data.model_dump()
    return await news_repository.create(db, news_dict)

# Обновление новости
@router.put("/{news_id}", response_model=NewsRead)
async def update_news(news_id: int, news_data: NewsUpdate, db: AsyncSession = Depends(get_db)):
    news = await news_repository.get_by_id(db, news_id)
    if news is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News item not found")
    
    news_dict = news_data.model_dump(exclude_unset=True)
    return await news_repository.update(db, news_id, news_dict)

# Удаление новости
@router.delete("/{news_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_news(news_id: int, db: AsyncSession = Depends(get_db)):
    success = await news_repository.delete(db, news_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News item not found")
    return None

# Получение новостей по ID пользователя
@router.get("/user/{user_id}", response_model=List[NewsRead])
async def get_news_by_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(News.__table__.select().where(News.user_id == user_id))
    news_items = result.fetchall()
    if not news_items:
        return []
    
    return [News(**dict(news._mapping)) for news in news_items] 