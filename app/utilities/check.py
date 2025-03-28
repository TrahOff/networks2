from fastapi import HTTPException


async def check_existing_element(conn, model):
    check_query = f"SELECT * FROM {model.__tablename__}"
    parameters, index = [], 1

    for field_name in model.__fields__:
        if field_name in model.unic_elements():
            check_query += (f" WHERE " if index == 1 else " OR ") + f"{field_name} = ${index}"
            parameters.append(getattr(model, field_name))
            index += 1
    print(check_query, parameters)
    return await conn.fetchrow(check_query, *parameters)


async def check_exact_duplicate(conn, model):
    check_query = f"SELECT * FROM {model.__tablename__}"
    parameters = []
    for index, field_name in enumerate(model.__fields__, start=1):
        check_query += (f" WHERE " if index == 1 else " AND ") + f"{field_name} = ${index}"
        parameters.append(getattr(model, field_name))
    print(check_query, parameters)
    return await conn.fetchrow(check_query, *parameters)


async def check_dependencies(conn, dependencies):
    check_query = f"SELECT * FROM {dependencies[0].__tablename__} WHERE id = $1"
    return await conn.fetchrow(check_query, dependencies[1])


async def check_element_id(conn, model, element_id):
    check_query = f"SELECT * FROM {model.__tablename__} WHERE id = $1"
    return await conn.fetchrow(check_query, element_id)


async def check_everything(conn, model, dependencies, element_id):
    if element_id:
        check_id = await check_element_id(conn, model, element_id)
        if not check_id:
            raise HTTPException(status_code=412,
                                detail=f"записи не существует")

    if dependencies:
        for dependence in dependencies:
            check_dependencies_element = await check_dependencies(conn, dependence)
            if not check_dependencies_element:
                raise HTTPException(status_code=412,
                                    detail=f"в таблице {dependence[0].__tablename__} нет указанной записи")

    if model.unic_elements():
        existing_element = await check_existing_element(conn, model)
        if existing_element:
            if existing_element['id'] != element_id:
                detail = ""
                for key, value in existing_element.items():
                    if key in model.unic_elements() and value == getattr(model, key):
                        detail = f"поле {key} со значением {value} уже занято (оно должно быть уникально)"
                raise HTTPException(status_code=412, detail=detail)

    existing_element = await check_exact_duplicate(conn, model)
    if existing_element:
        raise HTTPException(status_code=412, detail="Такая запись уже существует")

    return 0
