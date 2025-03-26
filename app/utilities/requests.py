from fastapi import HTTPException

from app.database import get_db_connection
from .check import check_everything


async def get_element_request(model, filters: list, limit, offset, sort_by, sort_order):
    print("----------------------")
    print(model.__tablename__)
    print(filters)
    print(limit)
    print(offset)
    print(sort_by)
    print(sort_order)
    print("----------------------")
    conn = await get_db_connection()
    query = f"SELECT * FROM {model.__tablename__}"
    parameters, index = [], 1

    for condition in filters:
        if condition[1] is not None:  # Изменено на проверку на None
            if " = $" in condition[0] or " <= $" in condition[0] or " >= $" in condition[0]:
                query += (" WHERE " + condition[0] + f"{index}") if index == 1 else (" AND " + condition[0] + f"{index}")
                parameters.append(condition[1])
                index += 1

            if " LIKE " in condition[0]:
                query += (" WHERE " if index == 1 else " AND ") + condition[0] + f"${index}"
                parameters.append(f"%{condition[1].lower()}%")
                index += 1

    total_query = query.replace('*', 'COUNT(*)')
    if sort_by:
        if sort_order not in ["asc", "desc"]:
            raise HTTPException(status_code=400, detail="Неверно указан порядок сортировки")
        query += f" ORDER BY {sort_by} {sort_order.upper()}"

    query += f" LIMIT {limit}" if limit else ""
    query += f" OFFSET {offset}" if offset else ""
    print(query)
    try:
        results = await conn.fetch(query, *parameters)
        if not results:
            raise HTTPException(status_code=404, detail="не удалось найти записей в таблице")
        total = await conn.fetch(total_query, *parameters)
        return [element for element in results], total
    except Exception as e:
        print(f"Ошибка при попытке получить данные: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    finally:
        await conn.close()



async def create_element_request(model, dependencies):
    conn = await get_db_connection()

    try:
        check = await check_everything(conn, model, dependencies, None)
        if check != 0:
            return check

        total_fields = len(model.__fields__)
        query = f"INSERT INTO {model.__tablename__} ("
        end_of_query = " VALUES ("
        parameters = []
        for index, field_name in enumerate(model.__fields__, start=1):
            query += f"{field_name}, " if index < total_fields else f"{field_name})"
            end_of_query += f"${index}, " if index < total_fields else f"${index})"
            parameters.append(getattr(model, field_name))

        query += end_of_query
        print(query)

        await conn.execute(query, *parameters)
        return {"message": "Запись была успешно зарегистрирована в базе данных"}
    except Exception as e:
        print(f"Ошибка при создании записи: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    finally:
        await conn.close()


async def update_element_request(model, element_id, dependencies):
    print(model)
    print(element_id)
    print(dependencies)
    conn = await get_db_connection()

    try:
        check = await check_everything(conn, model, dependencies, element_id)
        if check != 0:
            return check

        query = f"UPDATE {model.__tablename__} SET"
        parameters = []

        for index, field_name in enumerate(model.__fields__, start=1):
            query += (" " if index == 1 else ", ") + f"{field_name} = ${index}"
            parameters.append(getattr(model, field_name))

        total_fields = len(model.__fields__)
        query += f" WHERE id = ${total_fields + 1}"
        parameters.append(element_id)
        print(query, parameters)
        await conn.execute(query, *parameters)
        return {"message": "Запись была успешно обновлена"}

    except Exception as e:
        print(f"Ошибка при обновлении записи: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)

    finally:
        await conn.close()


async def delete_element_request(model, element_id):
    conn = await get_db_connection()
    try:
        await conn.execute(
            f"DELETE FROM {model.__tablename__} WHERE id = $1;",
            element_id
        )
        return {"message": "Данные успешно удалены"}
    except Exception as e:
        print(f"Ошибка при попытке удалить данные: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    finally:
        await conn.close()
