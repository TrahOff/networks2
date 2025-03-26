from pydantic import BaseModel, constr, Field


class Group(BaseModel):
    __tablename__ = 'groups'

    group_name: constr(min_length=1, max_length=100) = Field(..., description="Название группы")
    course: int = Field(..., description="Курс")
    admission_year: int = Field(..., description="Год поступления")
    university: constr(min_length=1, max_length=100) = Field(..., description="Университет")
    curator_name: constr(min_length=1, max_length=100) = Field(..., description="Имя куратора")
    curator_photo: constr(min_length=1, max_length=100) = Field(..., description="Фото куратора")

    @staticmethod
    def unic_elements():
        return ['group_name']

    @staticmethod
    def dependencies():
        return None