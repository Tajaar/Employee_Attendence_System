#eas-app/backend/routers/auth_router.py
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from models import UserResponse
from auth import authenticate_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


class SimpleLoginRequest(BaseModel):
    email: EmailStr


class LoginResponse(BaseModel):
    user: UserResponse


@router.post("/login", response_model=LoginResponse)
async def login(login_request: SimpleLoginRequest):
    user = authenticate_user(login_request.email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    user_response = UserResponse(
        id=user["id"],
        employee_code=user["employee_code"],
        full_name=user["full_name"],
        email=user["email"],
        role=user["role"],
        is_active=user["is_active"]
    )

    return LoginResponse(user=user_response)


@router.post("/logout")
async def logout():
    return {"success": True, "message": "Logged out successfully"}
