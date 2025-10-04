from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, date
from db import get_connection

routes = Blueprint("routes", __name__)

# ---------------- AUTH ----------------
@routes.route("/register", methods=["POST"])
@jwt_required()
def register():
    """Only admin can register new users"""
    conn = get_connection()
    try:
        current_user_id = get_jwt_identity()
        cursor = conn.cursor(dictionary=True)

        # Get current user role
        cursor.execute("SELECT role FROM employees WHERE id=%s", (current_user_id,))
        user = cursor.fetchone()
        if not user or user["role"] != "admin":
            return jsonify({"msg": "Only admin can create users"}), 403

        data = request.json
        email = data.get("email")
        password = data.get("password")
        employee_code = data.get("employee_code")
        full_name = data.get("full_name")
        role = data.get("role", "employee")

        if not email or not password:
            return jsonify({"msg": "Email and password required"}), 400

        cursor.execute("SELECT id FROM employees WHERE email=%s", (email,))
        if cursor.fetchone():
            return jsonify({"msg": "User already exists"}), 400

        password_hash = generate_password_hash(password)
        cursor.execute(
            "INSERT INTO employees (employee_code, full_name, email, password_hash, role) VALUES (%s,%s,%s,%s,%s)",
            (employee_code, full_name, email, password_hash, role)
        )
        conn.commit()
        return jsonify({"msg": "User created successfully"}), 201
    finally:
        conn.close()

@routes.route("/login", methods=["POST"])
def login():
    """Login with JWT token using employee_code or email"""
    data = request.json
    username = (data.get("employee_code") or data.get("email") or "").strip()
    password = (data.get("password") or "").strip()


    if not username or not password:
        return jsonify({"msg": "Username/email and password required"}), 400

    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM employees WHERE email=%s OR employee_code=%s",
            (username, username)
        )
        user = cursor.fetchone()

        if not user:
            return jsonify({"msg": "Invalid username or password"}), 401

        # Ensure password check works
        password_hash = user.get("password_hash") or ""
        if not check_password_hash(password_hash, password):
            return jsonify({"msg": "Invalid username or password"}), 401

        # Create JWT token
        access_token = create_access_token(identity=str(user["employee_code"]))
        return jsonify({
            "token": access_token,
            "role": user["role"],
            "full_name": user["full_name"],
            "employee_code":user["employee_code"]
        }), 200
    finally:
        conn.close()




# ---------------- ATTENDANCE ----------------
# ----------------------------
# TOGGLE ATTENDANCE
# ----------------------------
@routes.route("/attendance/toggle", methods=["POST"])
@jwt_required()
def toggle_attendance():
    employee_code = get_jwt_identity()  # Get employee from JWT

    conn = mysql.connector.connect(
        host="localhost", user="root", password="root", database="attendance_db"
    )
    cursor = conn.cursor(dictionary=True)

    # Get last attendance entry for the employee
    cursor.execute("""
        SELECT * FROM attendance
        WHERE employee_code = %s
        ORDER BY id DESC LIMIT 1
    """, (employee_code,))
    last_record = cursor.fetchone()

    if last_record and last_record["status"] == "IN":
        # If last record was IN → mark as OUT
        cursor.execute("""
            INSERT INTO attendance (employee_code, status, timestamp)
            VALUES (%s, %s, %s)
        """, (employee_code, "OUT", datetime.now()))
        conn.commit()
        response = {"message": "Checked OUT successfully", "status": "OUT"}
    else:
        # If no record or last record was OUT → mark as IN
        cursor.execute("""
            INSERT INTO attendance (employee_code, status, timestamp)
            VALUES (%s, %s, %s)
        """, (employee_code, "IN", datetime.now()))
        conn.commit()
        response = {"message": "Checked IN successfully", "status": "IN"}

    cursor.close()
    conn.close()
    return jsonify(response), 200


# ----------------------------
# GET CURRENT ATTENDANCE STATUS
# ----------------------------
@routes.route("/attendance/status", methods=["GET"])
@jwt_required()
def attendance_status():
    employee_code = get_jwt_identity()  # From JWT

    conn = mysql.connector.connect(
        host="localhost", user="root", password="root", database="attendance_db"
    )
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT status FROM attendance
        WHERE employee_code = %s
        ORDER BY id DESC LIMIT 1
    """, (employee_code,))
    last_record = cursor.fetchone()

    cursor.close()
    conn.close()

    if last_record:
        return jsonify({"status": last_record["status"]}), 200
    else:
        return jsonify({"status": "OUT"}), 200  # default if no record


# ---------------- ADMIN/HR VIEWS ----------------
@routes.route("/employee/attendance", methods=["GET"])
@jwt_required()
def employee_attendance():
    """
    Admin/HR fetch employee’s attendance + logs by id or code
    Example: /employee/attendance?code=EMP001 OR ?id=3
    """
    conn = get_connection()
    try:
        current_user_id = get_jwt_identity()
        cursor = conn.cursor(dictionary=True)
        print("Current JWT identity:", current_user_id, type(current_user_id))

        # Verify role
        cursor.execute("SELECT role FROM employees WHERE id=%s", (current_user_id,))
        user = cursor.fetchone()
        if not user or user["role"] not in ("admin", "hr"):
            return jsonify({"msg": "Access denied"}), 403

        code = request.args.get("code")
        emp_id = request.args.get("id")
        if not code and not emp_id:
            return jsonify({"msg": "Provide employee code or id"}), 400

        # Find employee
        if code:
            cursor.execute(
                "SELECT id, employee_code, full_name, role FROM employees WHERE employee_code=%s", (code,))
        else:
            cursor.execute(
                "SELECT id, employee_code, full_name, role FROM employees WHERE id=%s", (emp_id,))
        employee = cursor.fetchone()
        if not employee:
            return jsonify({"msg": "Employee not found"}), 404

        emp_id = employee["id"]

        # Attendance summary
        cursor.execute(
            "SELECT id, date, first_in, last_out, total_duration_seconds, notes "
            "FROM attendance_summary WHERE employee_id=%s ORDER BY date DESC", (emp_id,))
        summary = cursor.fetchall()

        # Attendance logs
        cursor.execute(
            "SELECT id, event_type, timestamp, source "
            "FROM attendance_logs WHERE employee_id=%s ORDER BY timestamp DESC", (emp_id,))
        logs = cursor.fetchall()

        # Serialize summary
        summary_serialized = [
            {
                "id": r["id"],
                "date": r["date"].strftime("%Y-%m-%d"),
                "first_in": r["first_in"].strftime("%Y-%m-%d %H:%M:%S") if r["first_in"] else None,
                "last_out": r["last_out"].strftime("%Y-%m-%d %H:%M:%S") if r["last_out"] else None,
                "total_duration_seconds": r.get("total_duration_seconds") or 0,
                "notes": r.get("notes") or ""
            } for r in summary
        ]

        # Serialize logs
        logs_serialized = [
            {
                "id": l["id"],
                "event_type": l["event_type"],
                "timestamp": l["timestamp"].strftime("%Y-%m-%d %H:%M:%S") if l["timestamp"] else None,
                "source": l.get("source") or ""
            } for l in logs
        ]

        return jsonify({
            "employee": employee,
            "summary": summary_serialized,
            "logs": logs_serialized
        })
    finally:
        conn.close()
