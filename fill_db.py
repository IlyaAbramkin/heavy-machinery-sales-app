from fill_db import *
import asyncio

async def fill_all():
    await add_categories()
    await add_chassis()
    await add_engines()
    await add_factories()    
    await add_wheel_formulas()
    await add_users()        
    await add_vehicles()
    await add_price_list()
    await add_news()         
    await add_requests()
    await add_requisitioned_goods()

if __name__ == "__main__":
    asyncio.run(fill_all())