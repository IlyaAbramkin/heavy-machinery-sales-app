from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..models import WheelFormula
from ..schemas import WheelFormulaCreate, WheelFormulaRead, WheelFormulaUpdate
from ..repository import BaseRepository
from ..core.dependencies import get_db

router = APIRouter(prefix="/wheel-formulas", tags=["wheel-formulas"])
wheel_formula_repository = BaseRepository(WheelFormula)

# Получение всех колесных формул
@router.get("/", response_model=List[WheelFormulaRead])
async def get_wheel_formulas(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await wheel_formula_repository.get_all(db, skip, limit)

# Получение колесной формулы по ID
@router.get("/{wheel_formula_id}", response_model=WheelFormulaRead)
async def get_wheel_formula(wheel_formula_id: int, db: AsyncSession = Depends(get_db)):
    wheel_formula = await wheel_formula_repository.get_by_id(db, wheel_formula_id)
    if wheel_formula is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wheel formula not found")
    return wheel_formula

# Создание новой колесной формулы
@router.post("/", response_model=WheelFormulaRead, status_code=status.HTTP_201_CREATED)
async def create_wheel_formula(wheel_formula_data: WheelFormulaCreate, db: AsyncSession = Depends(get_db)):
    wheel_formula_dict = wheel_formula_data.model_dump()
    return await wheel_formula_repository.create(db, wheel_formula_dict)

# Обновление колесной формулы
@router.put("/{wheel_formula_id}", response_model=WheelFormulaRead)
async def update_wheel_formula(wheel_formula_id: int, wheel_formula_data: WheelFormulaUpdate, db: AsyncSession = Depends(get_db)):
    wheel_formula = await wheel_formula_repository.get_by_id(db, wheel_formula_id)
    if wheel_formula is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wheel formula not found")
    
    wheel_formula_dict = wheel_formula_data.model_dump(exclude_unset=True)
    return await wheel_formula_repository.update(db, wheel_formula_id, wheel_formula_dict)

# Удаление колесной формулы
@router.delete("/{wheel_formula_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_wheel_formula(wheel_formula_id: int, db: AsyncSession = Depends(get_db)):
    success = await wheel_formula_repository.delete(db, wheel_formula_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wheel formula not found")
    return None 