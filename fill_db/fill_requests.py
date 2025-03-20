import asyncio
from sqlalchemy import text
from database import SessionLocal
from models import Requests
from faker import Faker
import random
from datetime import datetime

fake = Faker('ru_RU')

async def add_requests():
    async with SessionLocal() as session:
        users = await session.execute(text("SELECT user_id FROM users"))
        user_ids = [u[0] for u in users] or [None]

        requests = []
        for _ in range(25):
            request = Requests(
                session_id=random.randint(1000, 9999),
                company_name=fake.company() if random.choice([True, False]) else None,
                full_name=fake.name(),
                email=fake.email(),
                phone=fake.phone_number(),
                city=fake.city(),
                request_date=fake.date_time_between(start_date="-1y", end_date="now"),
                message=fake.text() if random.choice([True, False]) else None,
                payment_method=random.choice(list(Requests.PaymentMethodEnum)),
                delivery_type=random.choice(list(Requests.DeliveryTypeEnum)),
                status=random.choice(list(Requests.RequestStatusEnum)),
                user_id=random.choice(user_ids) if random.choice([True, False]) else None
            )
            requests.append(request)
        
        session.add_all(requests)
        await session.commit()

if __name__ == "__main__":
    asyncio.run(add_requests())