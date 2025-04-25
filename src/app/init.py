import asyncio
from core.database import recreate_tables
import models

async def main():
    await recreate_tables()

if __name__ == "__main__":
    asyncio.run(main())