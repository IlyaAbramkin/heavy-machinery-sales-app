import asyncio
from sqlalchemy import text
from database import SessionLocal
from models import TovaryVZayavke
import random

async def add_requisitioned_goods():
    async with SessionLocal() as session:
        requests = await session.execute(text("SELECT request_id FROM requests"))
        request_ids = [r[0] for r in requests]
        
        vehicles = await session.execute(text("SELECT vehicle_id FROM vehicles"))
        vehicle_ids = [v[0] for v in vehicles]

        requisitioned_goods = []
        for request_id in request_ids:
            num_items = random.randint(1, 3)
            selected_vehicles = random.sample(vehicle_ids, k=num_items)
            for vehicle_id in selected_vehicles:
                requisitioned_goods.append(
                    TovaryVZayavke(
                        request_id=request_id,
                        vehicle_id=vehicle_id,
                        quantity=random.randint(1, 5)
                    )
                )
        
        session.add_all(requisitioned_goods)
        await session.commit()

if __name__ == "__main__":
    asyncio.run(add_requisitioned_goods())