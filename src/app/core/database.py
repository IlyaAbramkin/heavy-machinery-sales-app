from sqlalchemy.orm import declarative_base
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from .config import settings

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL_asyncpg

engine = create_async_engine(url=SQLALCHEMY_DATABASE_URL, echo=True)
SessionLocal = async_sessionmaker(bind=engine, autoflush=True, expire_on_commit=False)

Base = declarative_base()

async def recreate_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)