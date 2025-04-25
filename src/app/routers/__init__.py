from fastapi import APIRouter

from .user_router import router as user_router
from .vehicle_router import router as vehicle_router
from .category_router import router as category_router
from .chassis_router import router as chassis_router
from .factory_router import router as factory_router
from .wheel_formula_router import router as wheel_formula_router
from .engine_router import router as engine_router
from .price_list_router import router as price_list_router
from .request_router import router as request_router
from .news_router import router as news_router
from .tovary_router import router as tovary_router
from .auth_router import router as auth_router
from .image_router import router as image_router


main_router = APIRouter()

main_router.include_router(auth_router)
main_router.include_router(user_router)
main_router.include_router(vehicle_router)
main_router.include_router(category_router)
main_router.include_router(chassis_router)
main_router.include_router(factory_router)
main_router.include_router(wheel_formula_router)
main_router.include_router(engine_router)
main_router.include_router(price_list_router)
main_router.include_router(request_router)
main_router.include_router(news_router)
main_router.include_router(tovary_router)
main_router.include_router(image_router)