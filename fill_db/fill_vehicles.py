import asyncio
from database import SessionLocal
from models import Vehicle
from faker import Faker
import random

fake = Faker('ru_RU')

async def add_vehicles():
    async with SessionLocal() as session:
        vehicles = []
        for _ in range(15):
            vehicle = Vehicle(
                title=fake.word().capitalize() + " " + fake.word().capitalize(),
                description=fake.text(),
                year=random.randint(2000, 2023),
                color=fake.color_name(),
                category_id=random.randint(1, 4),
                factory_id=random.randint(1, 3),
                chassis_id=random.randint(1, 3),
                wheel_formula_id=random.randint(1, 3),
                engine_id=random.randint(1, 2),
                user_id=random.randint(1, 5)
            )
            vehicles.append(vehicle)
        
        session.add_all(vehicles)
        await session.commit()

if __name__ == "__main__":
    asyncio.run(add_vehicles())