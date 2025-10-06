from typing import Optional
from fastapi import HTTPException, status
from database import execute_query
from models import UserResponse

# ---------------- DATABASE ----------------
def get_user_by_email(email: str) -> Optional[dict]:
    query = "SELECT * FROM employees WHERE email = %s AND is_active = 1"
    return execute_query(query, (email,), fetch_one=True)

def get_user_by_id(user_id: int) -> Optional[dict]:
    query = "SELECT * FROM employees WHERE id = %s AND is_active = 1"
    return execute_query(query, (user_id,), fetch_one=True)

# ---------------- AUTHENTICATION ----------------
def authenticate_user(email: str) -> Optional[dict]:
    user = get_user_by_email(email)
    if not user:
        return None
    return user

def check_admin_role(role: str) -> bool:
    return role in ["admin", "hr"]
