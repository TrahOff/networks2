import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.database import get_db_connection, check_and_create_tables
from app.routes import (users_router,
                        scholarship_router,
                        coefficient_router,
                        groups_router,
                        student_router,
                        history_router)


app = FastAPI()

app.include_router(users_router, tags=["user"])
app.include_router(scholarship_router, tags=["scholarships"])
app.include_router(coefficient_router, tags=["coefficients"])
app.include_router(groups_router, tags=["groups"])
app.include_router(student_router, tags=["students"])
app.include_router(history_router, tags=["history"])

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    return {"message": "Это приложение связано с FastAPI и PostgreSQL!"}


@app.get("/version")
async def get_db_version():
    conn = await get_db_connection()
    try:
        version = await conn.fetchval("SELECT version();")
        return {"database_version": version}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()


@app.get("/tables")
async def get_tables():
    conn = await get_db_connection()
    try:
        tables = await conn.fetch("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';  
        """)
        return {"tables": [table['table_name'] for table in tables]}
    except Exception as e:
        print(f"Error while fetching tables: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        await conn.close()


if __name__ == "__main__":
    check_and_create_tables()
    uvicorn.run("main:app", reload=True)