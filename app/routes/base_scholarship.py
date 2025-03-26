from fastapi import APIRouter, Depends, Query

from ..models import Scholarship, Users
from ..utilities import get_current_user
from ..utilities import get_element_request, create_element_request, update_element_request, delete_element_request

router = APIRouter()

@router.get("/base_scholarship")
async def get_base_scholarship_route(
        scholarship_id: int = Query(None, description="ID стипендии"),
        scholarship_type: str = Query(None, description="Тип стипендии"),
        base_amount: float = Query(None, description="Базовая сумма стипендии"),
        min_base_amount: float = Query(None, description="Минимальная базовая сумма для фильтрации"),
        max_base_amount: float = Query(None, description="Максимальная базовая сумма для фильтрации"),
        sort_by: str = Query(None, description="Поле для сортировки (например, 'scholarship_id', 'scholarship_type', 'base_amount')"),
        sort_order: str = Query("asc", description="Порядок сортировки: 'asc' для по возрастанию, 'desc' для по убыванию"),
        limit: int = Query(None, description="Количество стипендий, которые нужно вернуть"),
        offset: int = Query(0, description="Количество стипендий, которые нужно пропустить")
):
    filters = [
        ["id = $", scholarship_id],
        ["LOWER(scholarship_type) LIKE ", scholarship_type],
        ["base_amount = $", base_amount],
        ["base_amount >= $", min_base_amount],
        ["base_amount <= $", max_base_amount]
    ]
    result, total = await get_element_request(Scholarship, filters, limit, offset, sort_by, sort_order)
    print("look at this", result, total)
    return {"scholarships": result, "total": total}


@router.post("/base_scholarship/add")
async def add_scholarship_route(
        scholarship: Scholarship,
        _current_user: Users = Depends(get_current_user)
):
    result = await create_element_request(scholarship, None)
    return result


@router.put("/base_scholarship/update")
async def update_scholarship_route(
        scholarship: Scholarship,
        _current_user: Users = Depends(get_current_user),
        element_id: int = Query(..., description="уникальный идентификатор записи в бд")
):
    result = await update_element_request(scholarship, element_id, None)
    return result


@router.delete("/base_scholarship/delete")
async def delete_scholarship_route(
        _current_user: Users = Depends(get_current_user),
        element_id: int = Query(..., description="уникальный идентификатор записи в бд")
):
    result = await delete_element_request(Scholarship, element_id)
    return result