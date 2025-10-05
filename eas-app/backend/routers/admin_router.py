#eas-app/backend/routers/admin_router.py
from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from datetime import date
from models import UserResponse, AttendanceSummaryResponse, AttendanceLogResponse
from auth import get_current_admin_user
from services.attendance_service import AttendanceService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/employees", response_model=List[UserResponse])
async def get_all_employees(current_user: UserResponse = Depends(get_current_admin_user)):
    employees = AttendanceService.get_all_employees()
    return [UserResponse(**emp) for emp in employees]


@router.get("/attendance/{employee_id}", response_model=List[AttendanceSummaryResponse])
async def get_employee_attendance(
    employee_id: int,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: UserResponse = Depends(get_current_admin_user)
):
    summaries = AttendanceService.get_summary(employee_id, start_date, end_date)
    return [AttendanceSummaryResponse(**summary) for summary in summaries]


@router.get("/attendance/summary", response_model=List[AttendanceSummaryResponse])
async def get_all_attendance_summary(
    date: Optional[date] = Query(None),
    current_user: UserResponse = Depends(get_current_admin_user)
):
    summaries = AttendanceService.get_summary(specific_date=date)
    return [AttendanceSummaryResponse(**summary) for summary in summaries]


@router.get("/attendance/logs", response_model=List[AttendanceLogResponse])
async def get_attendance_logs(
    employee_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: UserResponse = Depends(get_current_admin_user)
):
    logs = AttendanceService.get_logs(employee_id, start_date, end_date)
    return [AttendanceLogResponse(**log) for log in logs]
