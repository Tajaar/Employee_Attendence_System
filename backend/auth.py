# auth.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_connection
from utils import token_required, admin_required
import jwt, os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

auth = Blueprint("auth", __name__)
JWT_SECRET = os.getenv("JWT_SECRET", "mysecretkey")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# ---------------- REGISTER ----------------
@auth.route("/register", methods=["POST"])
@token_required
@admin_required
def register(payload):
    """
    Admin registers a new employee.
    Required: full_name, employee_code, email, password
    Optional: role (default='employee')
    """
    data = request.get_json()
    name = data.get("full_name")
    employee_code = data.get("employee_code")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "employee")

    if not all([name, employee_code, password]):
        return jsonify({"message": "Missing required fields"}), 400

    hashed_password = generate_password_hash(password)

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Check if email or code already exists
        cursor.execute(
            "SELECT id FROM employees WHERE email=%s OR employee_code=%s",
            (email, employee_code)
        )
        if cursor.fetchone():
            return jsonify({"message": "User with this email or code already exists"}), 400

        cursor.execute(
            "INSERT INTO employees (employee_code, full_name, email, password_hash, role) "
            "VALUES (%s, %s, %s, %s, %s)",
            (employee_code, name, email, hashed_password, role)
        )
        conn.commit()
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500
    finally:
        conn.close()

    return jsonify({"message": "Employee registered successfully"}), 201


# ---------------- LOGIN ----------------
@auth.route("/login", methods=["POST"])
def login():
    """
    Login with employee_code or email + password
    Returns JWT token
    """
    data = request.get_json()
    username = data.get("employee_code") or data.get("email")
    password = data.get("password")
    
    if not username or not password:
        return jsonify({"message": "Missing username/email or password"}), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM employees WHERE employee_code=%s OR email=%s",
        (username, username)
    )
    employee = cursor.fetchone()
    conn.close()

    if not employee:
        return jsonify({"message": "Invalid credentials"}), 401

    # Verify password using check_password_hash
    if not check_password_hash(employee["password_hash"], password):
        return jsonify({"message": "Invalid credentials"}), 401

    payload = {
        "employee_id": employee["id"],
        "role": employee["role"],
        "exp": datetime.utcnow() + timedelta(hours=8)
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return jsonify({
        "token": token,
        "role": employee["role"],
        "full_name": employee["full_name"]
    }), 200
