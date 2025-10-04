from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import date
from models import AttendanceLogResponse, AttendanceSummaryResponse, UserResponse
from auth import get_current_user
from services.attendance_service import AttendanceService

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.post("/in", response_model=AttendanceLogResponse)
async def mark_in(current_user: UserResponse = Depends(get_current_user)):
    try:
        log = AttendanceService.mark_attendance(current_user.id, "IN", "web")
        return AttendanceLogResponse(**log)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/out", response_model=AttendanceLogResponse)
async def mark_out(current_user: UserResponse = Depends(get_current_user)):
    try:
        log = AttendanceService.mark_attendance(current_user.id, "OUT", "web")
        return AttendanceLogResponse(**log)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/logs/me", response_model=List[AttendanceLogResponse])
async def get_my_logs(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: UserResponse = Depends(get_current_user)
):
    logs = AttendanceService.get_logs(current_user.id, start_date, end_date)
    return [AttendanceLogResponse(**log) for log in logs]


@router.get("/summary/me", response_model=List[AttendanceSummaryResponse])
async def get_my_summary(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: UserResponse = Depends(get_current_user)
):
    summaries = AttendanceService.get_summary(current_user.id, start_date, end_date)
    return [AttendanceSummaryResponse(**summary) for summary in summaries]
