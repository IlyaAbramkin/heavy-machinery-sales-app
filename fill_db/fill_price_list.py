import asyncio
from database import SessionLocal
from models import PriceList
import random
from datetime import datetime, timedelta
from sqlalchemy import text

async def add_price_list():
    async with SessionLocal() as session:
        vehicles = await session.execute(text("SELECT vehicle_id FROM vehicles"))
        vehicle_ids = [v[0] for v in vehicles]
        
        user_ids = list(range(1, 6))
        price_lists = []
        for vehicle_id in vehicle_ids:
            price_list = PriceList(
                price=random.randint(500000, 5000000),
                delivery_time=datetime.now() + timedelta(days=random.randint(1, 30)),
                user_id=random.choice(user_ids),
                vehicle_id=vehicle_id
            )
            price_lists.append(price_list)
        
        session.add_all(price_lists)
        await session.commit()

if __name__ == "__main__":
    asyncio.run(add_price_list())