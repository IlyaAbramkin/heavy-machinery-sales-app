from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Response
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import os
import shutil
from typing import Optional
from pathlib import Path

from ..models import Vehicle, News, User
from ..core.dependencies import get_db, get_current_active_user
from ..repository import BaseRepository

VEHICLE_IMAGES_DIR = Path("src/static/images/products")
VEHICLE_IMAGES_DIR.mkdir(parents=True, exist_ok=True)

NEWS_IMAGES_DIR = Path("src/static/images/news")
NEWS_IMAGES_DIR.mkdir(parents=True, exist_ok=True)

router = APIRouter(prefix="/images", tags=["images"])
vehicle_repository = BaseRepository(Vehicle)
news_repository = BaseRepository(News)

# Загрузка изображения для транспортного средства
@router.post("/vehicles/{vehicle_id}")
async def upload_vehicle_image(
    vehicle_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    stmt = select(Vehicle).where(Vehicle.vehicle_id == vehicle_id)
    result = await db.execute(stmt)
    vehicle = result.scalars().first()
    
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Транспортное средство не найдено"
        )
    
    if vehicle.user_id != current_user.user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для загрузки изображения"
        )
    
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in ['.jpg', '.jpeg', '.png', '.svg']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неподдерживаемый формат файла. Разрешены только .jpg, .jpeg, .png и .svg"
        )
    
    filename = f"vehicle_{vehicle_id}{file_extension}"
    file_path = VEHICLE_IMAGES_DIR / filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    image_path = f"/static/images/products/{filename}"
    
    vehicle.image_path = image_path
    await db.commit()
    
    return {"filename": filename, "image_path": image_path}

# Получение изображения транспортного средства
@router.get("/vehicles/{vehicle_id}")
async def get_vehicle_image(
    vehicle_id: int,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Vehicle).where(Vehicle.vehicle_id == vehicle_id)
    result = await db.execute(stmt)
    vehicle = result.scalars().first()
    
    if not vehicle or not vehicle.image_path:
        return FileResponse(
            "client/public/images/placeholders/vehicle.svg",
            media_type="image/svg+xml"
        )
    
    filename = os.path.basename(vehicle.image_path)
    file_path = VEHICLE_IMAGES_DIR / filename
    
    if not file_path.exists():
        return FileResponse(
            "client/public/images/placeholders/vehicle.svg",
            media_type="image/svg+xml"
        )
    
    media_type = None
    if filename.endswith('.jpg') or filename.endswith('.jpeg'):
        media_type = "image/jpeg"
    elif filename.endswith('.png'):
        media_type = "image/png"
    elif filename.endswith('.svg'):
        media_type = "image/svg+xml"
    
    return FileResponse(str(file_path), media_type=media_type)

# Удаление изображения транспортного средства
@router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle_image(
    vehicle_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    stmt = select(Vehicle).where(Vehicle.vehicle_id == vehicle_id)
    result = await db.execute(stmt)
    vehicle = result.scalars().first()
    
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Транспортное средство не найдено"
        )
    
    if vehicle.user_id != current_user.user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для удаления изображения"
        )
    
    if not vehicle.image_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Изображение не найдено"
        )
    
    filename = os.path.basename(vehicle.image_path)
    file_path = VEHICLE_IMAGES_DIR / filename
    
    if file_path.exists():
        os.remove(file_path)
    
    vehicle.image_path = None
    await db.commit()
    
    return {"detail": "Изображение успешно удалено"}

# Загрузка изображения для новости
@router.post("/news/{news_id}")
async def upload_news_image(
    news_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    stmt = select(News).where(News.news_id == news_id)
    result = await db.execute(stmt)
    news = result.scalars().first()
    
    if not news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Новость не найдена"
        )
    
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для загрузки изображения"
        )
    
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in ['.jpg', '.jpeg', '.png', '.svg']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неподдерживаемый формат файла. Разрешены только .jpg, .jpeg, .png и .svg"
        )
    
    filename = f"news_{news_id}{file_extension}"
    file_path = NEWS_IMAGES_DIR / filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    image_path = f"/static/images/news/{filename}"
    
    news.image_url = None
    news.image_path = image_path
    await db.commit()
    
    return {"filename": filename, "image_path": image_path}

# Получение изображения новости
@router.get("/news/{news_id}")
async def get_news_image(
    news_id: int,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(News).where(News.news_id == news_id)
    result = await db.execute(stmt)
    news = result.scalars().first()
    
    if not news or not news.image_path:
        return FileResponse(
            "client/public/images/placeholders/news.svg",
            media_type="image/svg+xml"
        )
    
    filename = os.path.basename(news.image_path)
    file_path = NEWS_IMAGES_DIR / filename
    
    if not file_path.exists():
        return FileResponse(
            "client/public/images/placeholders/news.svg",
            media_type="image/svg+xml"
        )
    
    media_type = None
    if filename.endswith('.jpg') or filename.endswith('.jpeg'):
        media_type = "image/jpeg"
    elif filename.endswith('.png'):
        media_type = "image/png"
    elif filename.endswith('.svg'):
        media_type = "image/svg+xml"
    
    return FileResponse(str(file_path), media_type=media_type)

# Удаление изображения новости
@router.delete("/news/{news_id}")
async def delete_news_image(
    news_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    stmt = select(News).where(News.news_id == news_id)
    result = await db.execute(stmt)
    news = result.scalars().first()
    
    if not news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Новость не найдена"
        )
    
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для удаления изображения"
        )
    
    if not news.image_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Изображение не найдено"
        )
    
    filename = os.path.basename(news.image_path)
    file_path = NEWS_IMAGES_DIR / filename
    
    if file_path.exists():
        os.remove(file_path)
    
    news.image_path = None
    await db.commit()
    
    return {"detail": "Изображение успешно удалено"}