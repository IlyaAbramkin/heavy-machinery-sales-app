import asyncio
from database import SessionLocal
from models import Factory

async def add_factories():
    async with SessionLocal() as session:
        factories = [
            Factory(
                name = "Завод A"
            ),
            Factory(
                name = "Завод B"
            ),
            Factory(
                name = "Завод C"
            )
        ]

        session.add_all(factories)
        await session.commit()

if __name__ == "__main__":
    asyncio.run(add_factories())