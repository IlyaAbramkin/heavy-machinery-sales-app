import asyncio
from core.database import recreate_tables
import fill_db_models

async def main():
    await recreate_tables()

if __name__ == "__main__":
    asyncio.run(main())
