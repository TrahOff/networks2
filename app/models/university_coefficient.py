from pydantic import BaseModel, constr, condecimal, Field
from .base_scholarship import Scholarship


class UniversityCoefficient(BaseModel):
    __tablename__ = "university_coefficient"

    university_name: constr(min_length=1, max_length=100) = Field(..., description="Название университета")
    coefficient: condecimal(gt=0) = Field(..., description="Коэффициент")
    scholarship_id: int = Field(..., description="ID стипендии")

    @staticmethod
    def unic_elements():
        return None

    @staticmethod
    def dependencies():
        return [Scholarship]
