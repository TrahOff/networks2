from pydantic import BaseModel, constr, condecimal, Field
from .students import Student
from .base_scholarship import Scholarship

class ScholarshipHistory(BaseModel):
    __tablename__ = 'scholarship_history'

    semester_number: int = Field(..., description="Номер семестра, в котором начисляется стипендия студенту")
    scholarship_id: int = Field(..., description="тип начисляемой стипендии")
    scholarship_amount: condecimal(gt=0) = Field(..., description="размер стипендии, с учётом коэффициента вуза")
    student_id: int = Field(..., description="Идентификатор студента")

    @staticmethod
    def unic_elements():
        return None

    @staticmethod
    def dependencies():
        return [Student, Scholarship]