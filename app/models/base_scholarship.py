from pydantic import BaseModel, constr, condecimal, Field


class Scholarship(BaseModel):
    __tablename__ = 'base_scholarship'
    
    scholarship_type: constr(min_length=1, max_length=100) = Field(..., description="Тип стипендии")
    base_amount: condecimal(gt=0) = Field(..., description="Базовая сумма")

    @staticmethod
    def unic_elements():
        return ['scholarship_type']

    @staticmethod
    def dependencies():
        return None
