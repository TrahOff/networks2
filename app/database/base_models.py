from sqlalchemy import Column, Integer, String, ForeignKey, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class Users(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(15), nullable=False, unique=True)
    full_name = Column(String(100), nullable=False)
    password = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True)

    def __str__(self):
        return f"<User (username={self.username}, email={self.email})>"


class BaseScholarship(Base):
    __tablename__ = 'base_scholarship'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    scholarship_type = Column(String(100), nullable=False, unique=True)
    base_amount = Column(Numeric(10, 2), nullable=False)

    def __str__(self):
        return f"<BaseScholarship (scholarship_type={self.scholarship_type})>"


class UniversityCoefficient(Base):
    __tablename__ = 'university_coefficient'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    university_name = Column(String(100), nullable=False)
    coefficient = Column(Numeric(10, 2), nullable=False)
    scholarship_id = Column(Integer, ForeignKey('base_scholarship.id'), nullable=False)

    scholarship = relationship("BaseScholarship", backref="university_coefficients")

    def __str__(self):
        return f"<BaseScholarship (university_name={self.university_name}, coefficient={self.coefficient})>"


class Group(Base):
    __tablename__ = 'groups'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    group_name = Column(String(100), nullable=False, unique=True)
    course = Column(Integer, nullable=False)
    admission_year = Column(Integer, nullable=False)
    university = Column(String(100), nullable=False)
    curator_name = Column(String(100), nullable=False)
    curator_photo = Column(String, nullable=True)

    def __str__(self):
        return f"<BaseScholarship (group_name={self.group_name}, course={self.course})>"


class Student(Base):
    __tablename__ = 'students'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    group_id = Column(Integer, ForeignKey('groups.id'), nullable=False)
    address = Column(String(255), nullable=True)

    group = relationship("Group", back_populates="students")
    scholarships = relationship("ScholarshipHistory", back_populates="student")

    def __str__(self):
        return f"<BaseScholarship (full_name={self.full_name}, group={self.group.group_name})>"


class ScholarshipHistory(Base):
    __tablename__ = 'scholarship_history'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    semester_number = Column(Integer, nullable=False)
    scholarship_id = Column(Integer, nullable=False)
    scholarship_amount = Column(Numeric(10, 2), nullable=False)
    student_id = Column(Integer, ForeignKey('students.id'), nullable=False)

    student = relationship("Student", back_populates="scholarships")

    def __str__(self):
        return f"<BaseScholarship (semester_number={self.semester_number}, student={self.student.full_name})>"
