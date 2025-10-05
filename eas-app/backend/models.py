## eas-app/backend/models.py
from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime, date


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    employee_code: str
    role: Literal["employee", "hr", "admin"] = "employee"


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    employee_code: str
    full_name: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class AttendanceLogCreate(BaseModel):
    event_type: Literal["IN", "OUT"]
    source: str = "web"


class AttendanceLogResponse(BaseModel):
    id: int
    employee_id: int
    event_type: str
    timestamp: datetime
    source: str

    class Config:
        from_attributes = True


class AttendanceSummaryResponse(BaseModel):
    id: int
    employee_id: int
    date: date
    first_in: Optional[datetime] = None
    last_out: Optional[datetime] = None
    total_duration_seconds: int
    notes: Optional[str] = None
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None

    class Config:
        from_attributes = True


class ApiResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[dict | list] = None
    error: Optional[str] = None
