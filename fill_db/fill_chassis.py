import asyncio
from database import SessionLocal
from models import Chassis

async def add_chassis():
    async with SessionLocal() as session:
        chassis = [
            Chassis(
                name = "Шасси Type 1"
            ),
            Chassis(
                name = "Шасси Type 2"
            ),
            Chassis(
                name = "Шасси Type 3"
            )
        ]

        session.add_all(chassis)
        await session.commit()

if __name__ == "__main__":
    asyncio.run(add_chassis())