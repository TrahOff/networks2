from pydantic import BaseModel, constr, Field
from .groups import Group


class Student(BaseModel):
    __tablename__ = 'students'

    full_name: constr(min_length=1, max_length=100) = Field(..., description="Полное имя студента")
    group_id: int = Field(..., description="идентификатор группы, в которой числится студент")
    address: constr(min_length=1, max_length=100) = Field(..., description="Адрес проживания студента")

    @staticmethod
    def unic_elements():
        return None

    @staticmethod
    def dependencies():
        return [Group]