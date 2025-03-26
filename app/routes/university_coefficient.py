from fastapi import APIRouter, Depends, Query

from ..models import UniversityCoefficient, Users, Scholarship
from ..utilities import get_current_user
from ..utilities import get_element_request, create_element_request, update_element_request, delete_element_request

router = APIRouter()

@router.get("/university_coefficient")
async def get_base_coefficient_route(
        coefficient_id: int = Query(None, description="ID коэффициента университета"),
        university_name: str = Query(None, description="Название университета"),
        coefficient: float = Query(None, description="Коэффициент университета"),
        scholarship_id: int = Query(None, description="ID стипендии, к которой относится коэффициент"),
        min_coefficient: float = Query(None, description="Минимальное значение коэффициента для фильтрации"),
        max_coefficient: float = Query(None, description="Максимальное значение коэффициента для фильтрации"),
        sort_by: str = Query(None, description="Поле для сортировки (например, 'coefficient_id', 'university_name', 'coefficient')"),
        sort_order: str = Query("asc", description="Порядок сортировки: 'asc' для по возрастанию, 'desc' для по убыванию"),
        limit: int = Query(10, description="Количество коэффициентов, которые нужно вернуть"),
        offset: int = Query(0, description="Количество коэффициентов, которые нужно пропустить")
):
    filters = [
        ["id = $", coefficient_id],
        ["LOWER(university_name) LIKE ", university_name],
        ["coefficient = $", coefficient],
        ["scholarship_id = $", scholarship_id],
        ["coefficient >= $", min_coefficient],
        ["coefficient <= $", max_coefficient]
    ]
    result, total = await get_element_request(UniversityCoefficient, filters, limit, offset, sort_by, sort_order)
    return {"university_coefficient": result, "total": total}


@router.post("/university_coefficient/add")
async def add_coefficient_route(
        coefficient: UniversityCoefficient,
        _current_user: Users = Depends(get_current_user)
):
    dependencies = [
        [Scholarship, coefficient.scholarship_id]
    ]
    result = await create_element_request(coefficient, dependencies)
    return result


@router.put("/university_coefficient/update")
async def update_coefficient_route(
        coefficient: UniversityCoefficient,
        _current_user: Users = Depends(get_current_user),
        element_id: int = Query(..., description="уникальный идентификатор записи в бд")
):
    dependencies = [
        [Scholarship, coefficient.scholarship_id]
    ]
    result = await update_element_request(coefficient, element_id, dependencies)
    return result


@router.delete("/university_coefficient/delete")
async def delete_coefficient_route(
        _current_user: Users = Depends(get_current_user),
        element_id: int = Query(..., description="уникальный идентификатор записи в бд")
):
    result = await delete_element_request(UniversityCoefficient, element_id)
    return result