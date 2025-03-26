from fastapi import APIRouter, Depends, Query

from ..models import Group, Users
from ..utilities import get_current_user
from ..utilities import get_element_request, create_element_request, update_element_request, delete_element_request

router = APIRouter()

@router.get("/group")
async def get_group_route(
        group_id: int = Query(None, description="ID группы"),
        group_name: str = Query(None, description="Название группы"),
        course: int = Query(None, description="Курс группы"),
        admission_year: int = Query(None, description="Год поступления группы"),
        university: str = Query(None, description="Название университета"),
        curator_name: str = Query(None, description="Имя куратора группы"),
        curator_photo: str = Query(None, description="Фото куратора группы (URL)"),
        min_course: int = Query(None, description="Минимальный курс для фильтрации"),
        max_course: int = Query(None, description="Максимальный курс для фильтрации"),
        min_admission_year: int = Query(None, description="Минимальный год поступления для фильтрации"),
        max_admission_year: int = Query(None, description="Максимальный год поступления для фильтрации"),
        sort_by: str = Query(None, description="Поле для сортировки (например, 'group_id', 'group_name', 'course')"),
        sort_order: str = Query("asc", description="Порядок сортировки: 'asc' для по возрастанию, 'desc' для по убыванию"),
        limit: int = Query(10, description="Количество групп, которые нужно вернуть"),
        offset: int = Query(0, description="Количество групп, которые нужно пропустить")
):
    filters = [
        ["id = $", group_id],
        ["LOWER(group_name) LIKE ", group_name],
        ["course = $", course],
        ["admission_year = $", admission_year],
        ["LOWER(university) LIKE ", university],
        ["LOWER(curator_name) LIKE ", curator_name],
        ["LOWER(curator_photo) LIKE ", curator_photo],
        ["course >= $", min_course],
        ["course <= $", max_course],
        ["admission_year >= $", min_admission_year],
        ["admission_year <= $", max_admission_year]
    ]
    print(filters)
    result, total = await get_element_request(Group, filters, limit, offset, sort_by, sort_order)
    return {"Groups": result, "total": total}


@router.post("/group/add")
async def add_group_route(
        group: Group,
        _current_user: Users = Depends(get_current_user)
):
    result = await create_element_request(group, None)
    return result


@router.put("/group/update")
async def update_group_route(
        group: Group,
        _current_user: Users = Depends(get_current_user),
        element_id: int = Query(..., description="уникальный идентификатор записи в бд")
):
    result = await update_element_request(group, element_id, None)
    return result


@router.delete("/group/delete")
async def delete_group_route(
        _current_user: Users = Depends(get_current_user),
        element_id: int = Query(..., description="уникальный идентификатор записи в бд")
):
    result = await delete_element_request(Group, element_id)
    return result