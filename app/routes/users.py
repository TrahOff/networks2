from fastapi import HTTPException, APIRouter, Depends, Response, Query

from ..database import get_db_connection
from ..models import Users, LoginUser
from ..utilities import hash_password, verify_password, create_access_token, get_current_user
from ..utilities import get_element_request, create_element_request, update_element_request, delete_element_request

router = APIRouter()


@router.get("/users")
async def get_users(
        user_id: int = Query(None, description="Уникальный идентификатор записи"),
        username: str = Query(None, description="Имя пользователя, для возможной фильтрации (поиска)"),
        full_name: str = Query(None, description="ФИО пользователя, для возможной фильтрации (поиска)"),
        sort_by: str = Query(None, description="Поле для сортировки"),
        sort_order: str = Query("asc", description="Порядок сортировки: 'asc' для возрастающей, 'desc' для убывающей"),
        limit: int = Query(10, description="Максимальное количество записей для возврата"),
        offset: int = Query(0, description="Количество записей, которые следует пропустить")
):
    filters = [
        ["id = $", user_id],
        ["LOWER(username) LIKE ", username],
        ["LOWER(full_name) LIKE ", full_name]
    ]
    result, total = await get_element_request(Users, filters, limit, offset, sort_by, sort_order)
    return {"users": result, "total": total}


@router.post("/users/register")
async def register(user: Users):
    user.password = hash_password(user.password)
    result = await create_element_request(user, None)
    return result


@router.post("/users/login")
async def login(user: LoginUser , response: Response):
    conn = await get_db_connection()
    try:
        existing_user = await conn.fetchrow(
            "SELECT * FROM users WHERE username = $1 AND email = $2;", user.username, user.email
        )

        if not existing_user or not verify_password(user.password, existing_user['password']):
           raise HTTPException(status_code=404, detail="пользователь не найден")

        access_token = create_access_token(data={"sub": user.username})

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite='None',
            max_age=3600
        )

        return {"token_type": "bearer", "access_token": access_token}

    except Exception as e:
        print(f"Ошибка входа: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    finally:
        await conn.close()


@router.put("/users/me")
async def update_current_user(user: Users, _current_user: Users = Depends(get_current_user)):
    user.password = hash_password(user.password) if user.password else _current_user['password']
    result = await update_element_request(user, _current_user['id'], None)
    return result


@router.delete("/users/delete")
async def delete_current_user(_current_user: Users = Depends(get_current_user)):
    if _current_user:
        result = await delete_element_request(Users, _current_user['id'])
        return result
    else:
        pass


@router.get("/protected-route")
async def protected_route(_current_user: Users = Depends(get_current_user)):
    return {
        "current_user": _current_user
    }
