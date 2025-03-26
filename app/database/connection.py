import os

import asyncpg
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker

from .base_models import Base

load_dotenv()

PG_USER = os.getenv("PG_USER")
PG_PASSWORD = os.getenv("PG_PASSWORD")
DATABASE = os.getenv("DATABASE")
HOST = os.getenv("HOST")
PORT = os.getenv("PORT")

SQLALCHEMY_DATABASE_URL = f"postgresql://{PG_USER}:{PG_PASSWORD}@{HOST}:{PORT}/{DATABASE}"

engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True, pool_size=10, max_overflow=10)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def check_and_create_tables():
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    all_tables = Base.metadata.tables.keys()
    print(all_tables)

    missing_tables = [table for table in all_tables if table not in existing_tables]

    if missing_tables:
        print(f"Missing tables: {missing_tables}. Creating them...")
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully!")
    else:
        print("All tables already exist.")


async def get_db_connection() -> asyncpg.Connection:
    try:
        connection = await asyncpg.connect(SQLALCHEMY_DATABASE_URL)
        return connection
    except Exception as e:
        print(f"Error connecting to database: {str(e)}")
        raise