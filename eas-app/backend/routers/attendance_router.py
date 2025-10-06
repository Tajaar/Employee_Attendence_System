#eas-app/backend/routers/attendance_router.py
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date
from models import AttendanceLogResponse, AttendanceSummaryResponse
from services.attendance_service import AttendanceService

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.post("/in/{employee_id}", response_model=AttendanceLogResponse)
async def mark_in(employee_id: int):
    try:
        log = AttendanceService.mark_attendance(employee_id, "IN", "web")
        return AttendanceLogResponse(**log)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/out/{employee_id}", response_model=AttendanceLogResponse)
async def mark_out(employee_id: int):
    try:
        log = AttendanceService.mark_attendance(employee_id, "OUT", "web")
        return AttendanceLogResponse(**log)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/logs/{employee_id}", response_model=List[AttendanceLogResponse])
async def get_my_logs(
    employee_id: int,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None)
):
    logs = AttendanceService.get_logs(employee_id, start_date, end_date)
    return [AttendanceLogResponse(**log) for log in logs]


@router.get("/summary/{employee_id}", response_model=List[AttendanceSummaryResponse])
async def get_my_summary(
    employee_id: int,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None)
):
    summaries = AttendanceService.get_summary(employee_id, start_date, end_date)
    return [AttendanceSummaryResponse(**summary) for summary in summaries]
