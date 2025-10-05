#eas-app/backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth_router, attendance_router, admin_router
from auth import get_password_hash

app = FastAPI(
    title="Employee Attendance System API",
    description="Backend API for employee attendance tracking",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="/api")
app.include_router(attendance_router.router, prefix="/api")
app.include_router(admin_router.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "Employee Attendance System API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
