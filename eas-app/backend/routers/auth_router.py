from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta
from models import UserLogin, TokenResponse, UserResponse
from auth import authenticate_user, create_access_token, get_current_user
from config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(user_login: UserLogin):
    user = authenticate_user(user_login.email, user_login.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]},
        expires_delta=access_token_expires
    )

    user_response = UserResponse(
        id=user["id"],
        employee_code=user["employee_code"],
        full_name=user["full_name"],
        email=user["email"],
        role=user["role"],
        is_active=user["is_active"]
    )

    return TokenResponse(
        access_token=access_token,
        user=user_response
    )


@router.post("/logout")
async def logout(current_user: UserResponse = Depends(get_current_user)):
    return {"success": True, "message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user
