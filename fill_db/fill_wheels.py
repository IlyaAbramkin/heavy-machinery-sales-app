import asyncio
from database import SessionLocal
from models import WheelFormula

async def add_wheel_formulas():
    async with SessionLocal() as session:
        wheel_formulas = [
            WheelFormula(
                name = "4x4"
            ),
            WheelFormula(
                name = "4x2"
            ),
            WheelFormula(
                name = "8x4"
            )
        ]

        session.add_all(wheel_formulas)
        await session.commit()

if __name__ == "__main__":
    asyncio.run(add_wheel_formulas())