from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from datetime import datetime
from fastapi.responses import JSONResponse, Response, FileResponse
from fastapi import Request

from app.routers import main_router
from app.core.auth_utils import cleanup_expired_tokens
from app.core.dependencies import get_db

# Создание экземпляра FastAPI
app = FastAPI(
    title="Vehicle Service API", 
    description="API for managing and selling vehicles", 
    version="1.0.0" 
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Обработка запросов favicon.ico
@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("src/static/favicon.ico")

# Подключение всех роутеров
app.include_router(main_router)

# Монтируем статические файлы
app.mount("/static", StaticFiles(directory="src/static"), name="static")

# Middleware для автоматической очистки устаревших токенов
@app.middleware("http")
async def token_cleanup_middleware(request: Request, call_next):
    try:
        async for db in get_db():
            if hash(datetime.now().minute) % 100 == 0:
                try:
                    await cleanup_expired_tokens(db)
                except Exception as e:
                    print(f"Token cleanup error: {e}")
                    
            response = await call_next(request)
            return response
    except Exception as e:
        import traceback
        print(f"Middleware error: {e}")
        print(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error"}
        )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)  # Запуск сервера