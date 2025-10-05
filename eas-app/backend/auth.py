from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from werkzeug.security import generate_password_hash, check_password_hash
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import settings
from database import execute_query
from models import UserResponse

security = HTTPBearer()

# ---------------- PASSWORD ----------------
def get_password_hash(password: str) -> str:
    return generate_password_hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return check_password_hash(hashed_password, plain_password)

# ---------------- JWT ----------------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ---------------- DATABASE ----------------
def get_user_by_email(email: str) -> Optional[dict]:
    query = "SELECT * FROM employees WHERE email = %s AND is_active = 1"
    return execute_query(query, (email,), fetch_one=True)

def get_user_by_id(user_id: int) -> Optional[dict]:
    query = "SELECT * FROM employees WHERE id = %s AND is_active = 1"
    return execute_query(query, (user_id,), fetch_one=True)

# ---------------- FASTAPI DEPENDENCIES ----------------
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserResponse:
    token = credentials.credentials
    print("Token received:", token)
    payload = decode_token(token)
    user_id: int = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return UserResponse(**user)

async def get_current_admin_user(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return current_user

# ---------------- AUTHENTICATION ----------------
def authenticate_user(email: str, password: str) -> Optional[dict]:
    user = get_user_by_email(email)
    if not user or not verify_password(password, user["password_hash"]):
        return None
    return user

# ---------------- TEST ----------------
if __name__ == "__main__":
    password = "Rohit123"
    hashed = get_password_hash(password)
    print("Hashed:", hashed)
    print("Verify:", verify_password(password, hashed))
