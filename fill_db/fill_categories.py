import asyncio
from database import SessionLocal
from models import Category

async def add_categories():
    async with SessionLocal() as session:
        categories = [
            Category(
                name = "Легковые автомобили"
            ),
            Category(
                name = "Грузовики"
            ),
            Category(
                name = "Подъемные краны"
            ),
            Category(
                name = "Автобусы"
            )
        ]

        session.add_all(categories)
        await session.commit()

if __name__ == "__main__":
    asyncio.run(add_categories())