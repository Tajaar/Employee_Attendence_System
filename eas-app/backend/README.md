# Employee Attendance System - Backend API

FastAPI backend for the Employee Attendance System with MySQL database.

## Features

- JWT-based authentication
- Employee attendance marking (Check In/Out)
- Admin dashboard with all employee attendance
- Attendance history and summaries
- Role-based access control (Employee, HR, Admin)

## Prerequisites

- Python 3.8+
- MySQL Server
- pip (Python package manager)

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Database Setup

1. Create the MySQL database and tables using the schema provided in the main project.

2. Insert a test admin user:
```sql
INSERT INTO employees (employee_code, full_name, email, password_hash, role, is_active)
VALUES (
    'ADMIN001',
    'Admin User',
    'admin@company.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS1qVN5KS',  -- password: admin123
    'admin',
    1
);

INSERT INTO employees (employee_code, full_name, email, password_hash, role, is_active)
VALUES (
    'EMP001',
    'John Doe',
    'john@company.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS1qVN5KS',  -- password: admin123
    'employee',
    1
);
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=emp_attendance

JWT_SECRET_KEY=your-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

## Running the Server

Start the development server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user info

### Attendance (Employee)
- `POST /api/attendance/in` - Mark check in
- `POST /api/attendance/out` - Mark check out
- `GET /api/attendance/logs/me` - Get my attendance logs
- `GET /api/attendance/summary/me` - Get my attendance summary

### Admin
- `GET /api/admin/employees` - Get all employees
- `GET /api/admin/attendance/{employee_id}` - Get employee attendance
- `GET /api/admin/attendance/summary` - Get all attendance summary
- `GET /api/admin/attendance/logs` - Get attendance logs

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── config.py              # Configuration settings
├── database.py            # Database connection
├── models.py              # Pydantic models
├── auth.py                # Authentication utilities
├── routers/
│   ├── auth_router.py     # Auth endpoints
│   ├── attendance_router.py  # Employee attendance endpoints
│   └── admin_router.py    # Admin endpoints
├── services/
│   └── attendance_service.py  # Business logic
├── requirements.txt       # Python dependencies
└── .env                   # Environment variables
```

## Default Test Credentials

After running the database setup SQL:
- Admin: admin@company.com / admin123
- Employee: john@company.com / admin123

## Security Notes

- Change the JWT_SECRET_KEY in production
- Use strong passwords
- Enable HTTPS in production
- Restrict CORS origins in production
