from pydantic import BaseModel, EmailStr, Field


class LoginUser(BaseModel):
    __tablename__ = 'users'

    username: str = Field(..., min_length=3, max_length=15)
    email: EmailStr
    password: str = Field(..., max_length=100)

    @staticmethod
    def unic_elements():
        return ['username', 'email']

    @staticmethod
    def dependencies():
        return None


class Users(LoginUser):
    full_name: str = Field(..., min_length=3, max_length=100)
