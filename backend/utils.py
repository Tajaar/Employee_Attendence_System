import jwt
import os
from functools import wraps
from flask import request, jsonify
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")

# Decorator to check JWT token
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = None
        if auth_header:
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ", 1)[1]
            else:
                token = auth_header
        if not token:
            return jsonify({"message": "Token missing"}), 401
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except jwt.InvalidTokenError as e:
            return jsonify({"message": "Invalid token", "error": str(e)}), 401
        return f(payload, *args, **kwargs)
    return decorated

# Check if user is admin
def admin_required(f):
    @wraps(f)
    def decorated(payload, *args, **kwargs):
        if payload.get("role") != "admin":
            return jsonify({"message": "Admin access required"}), 403
        return f(payload, *args, **kwargs)
    return decorated
