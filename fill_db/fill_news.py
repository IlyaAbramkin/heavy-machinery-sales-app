import asyncio
from database import SessionLocal
from models import News
from faker import Faker
import random
from datetime import datetime
from sqlalchemy import text

fake = Faker('ru_RU')

async def add_news():
    async with SessionLocal() as session:
        users = await session.execute(text("SELECT user_id FROM users"))
        user_ids = [u[0] for u in users]

        news_list = []
        for _ in range(10):
            news = News(
                title=fake.sentence(),
                publication_date=fake.date_time_between(start_date="-1y", end_date="now"),
                content=fake.text(),
                user_id=random.choice(user_ids)
            )
            news_list.append(news)
        
        session.add_all(news_list)
        await session.commit()

if __name__ == "__main__":
    asyncio.run(add_news())