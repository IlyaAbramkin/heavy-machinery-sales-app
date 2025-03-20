import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from database import SessionLocal
from models import User
from faker import Faker


fake = Faker()

async def add_users():
    async with SessionLocal() as session:
        users = []
        for _ in range(5):
            name = fake.name() 
            user = User(
                name=name, 
                email=name.lower().replace(" ", "_")+'@gmail.com',
                password_hash = fake.password(),
            )
            users.append(user)

        session.add_all(users)
        await session.commit()

if __name__ == "__main__":
    asyncio.run(add_users())