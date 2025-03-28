from fastapi import APIRouter, Depends, Query

from ..models import Student, Users, Group
from ..utilities import get_current_user
from ..utilities import get_element_request, create_element_request, update_element_request, delete_element_request

router = APIRouter()

@router.get("/students")
async def get_student_route(
        student_id: int = Query(None, description="ID студента для поиска"),
        full_name: str = Query(None, description="Полное имя студента для поиска"),
        group_id: int = Query(None, description="ID группы, к которой принадлежит студент"),
        address: str = Query(None, description="Адрес студента"),
        sort_by: str = Query(None, description="Поле для сортировки (например, 'id', 'full_name', 'group_id')"),
        sort_order: str = Query("asc", description="Порядок сортировки: 'asc' для по возрастанию, 'desc' для по убыванию"),
        limit: int = Query(None, description="Количество студентов для возврата"),
        offset: int = Query(0, description="Количество студентов, которые необходимо пропустить")
):
    filters = [
        ["id = $", student_id],
        ["LOWER(full_name) LIKE ", full_name],
        ["group_id = $", group_id],
        ["LOWER(address) LIKE ", address]
    ]
    print(sort_by)
    result, total = await get_element_request(Student, filters, limit, offset, sort_by, sort_order)
    print(result, total)
    return {"Students": result, "total": total }


@router.post("/students/add")
async def add_student_route(
        student: Student,
        _current_user: Users = Depends(get_current_user)
):
    dependencies = [
        [Group, student.group_id]
    ]
    result = await create_element_request(student, dependencies)
    return result


@router.put("/students/update")
async def update_student_route(
        student: Student,
        _current_user: Users = Depends(get_current_user),
        element_id: int = Query(..., description="уникальный идентификатор записи в бд")
):
    dependencies = [
        [Group, student.group_id]
    ]
    result = await update_element_request(student, element_id, dependencies)
    return result


@router.delete("/students/delete")
async def delete_student_route(
        _current_user: Users = Depends(get_current_user),
        element_id: int = Query(..., description="уникальный идентификатор записи в бд")
):
    print(f'current user = {_current_user}')
    print(f'element_id = {element_id}')
    result = await delete_element_request(Student, element_id)
    return result