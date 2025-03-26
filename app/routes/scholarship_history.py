from fastapi import APIRouter, Depends, Query

from ..models import ScholarshipHistory, Users, Scholarship, Student
from ..utilities import get_current_user
from ..utilities import get_element_request, create_element_request, update_element_request, delete_element_request

router = APIRouter()

@router.get("/history")
async def get_history_route(
        history_id: int = Query(None, description="ID записи истории для поиска"),
        semester_number: int = Query(None, description="Номер семестра для фильтрации по истории"),
        scholarship_id: int = Query(None, description="идентификатор назначенной стипендии"),
        scholarship_amount: float = Query(None, description="Минимальная сумма стипендии для фильтрации"),
        student_id: int = Query(None, description="ID студента, чью историю необходимо получить"),
        min_scholarship_amount: float = Query(None, description="Минимальная сумма стипендии для фильтрации"),
        max_scholarship_amount: float = Query(None, description="Максимальная сумма стипендии для фильтрации"),
        sort_by: str = Query(None, description="Поле для сортировки (например, 'id', 'scholarship_type', 'scholarship_amount')"),
        sort_order: str = Query("asc", description="Порядок сортировки: 'asc' для по возрастанию, 'desc' для по убыванию"),
        limit: int = Query(10, description="Количество записей истории для возврата"),
        offset: int = Query(0, description="Количество записей, которые необходимо пропустить")
):
    filters = [
        ["id = $", history_id],
        ["semester_number = $", semester_number],
        ["scholarship_id = $", scholarship_id],
        ["scholarship_amount = $", scholarship_amount],
        ["student_id = $", student_id],
        ["scholarship_amount >= $", min_scholarship_amount],
        ["scholarship_amount <= $", max_scholarship_amount]
    ]
    result, total = await get_element_request(ScholarshipHistory, filters, limit, offset, sort_by, sort_order)
    return {"history": result, "total": total}


@router.post("/history/add")
async def add_history_route(
        history: ScholarshipHistory,
        _current_user: Users = Depends(get_current_user)
):
    dependencies = [
        [Student, history.student_id],
        [Scholarship, history.scholarship_id]
    ]
    result = await create_element_request(history, dependencies)
    return result


@router.put("/history/update")
async def update_history_route(
        history: ScholarshipHistory,
        _current_user: Users = Depends(get_current_user),
        element_id: int = Query(..., description="уникальный идентификатор записи в бд")
):
    dependencies = [
        [Student, history.student_id],
        [Scholarship, history.scholarship_id]
    ]
    result = await update_element_request(history, element_id, dependencies)
    return result


@router.delete("/history/delete")
async def delete_history_route(
        _current_user: Users = Depends(get_current_user),
        element_id: int = Query(..., description="уникальный идентификатор записи в бд")
):
    result = await delete_element_request(ScholarshipHistory, element_id)
    return result
