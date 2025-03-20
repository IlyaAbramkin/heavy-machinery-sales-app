import asyncio
from database import SessionLocal
from models import Engine

async def add_engines():
    async with SessionLocal() as session:
        engines = [
            Engine(
                name = "Дизельный"
            ),
            Engine(
                name = "Бензиновый"
            )
        ]

        session.add_all(engines)
        await session.commit()

if __name__ == "__main__":
    asyncio.run(add_engines())