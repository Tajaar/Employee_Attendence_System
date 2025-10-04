# db.py
import mysql.connector
from mysql.connector import pooling
import os
from dotenv import load_dotenv

load_dotenv()

# Connection pool configuration
dbconfig = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "emp_attendance"),
    "charset": "utf8mb4"
}

# Create a connection pool with 5 connections
connection_pool = pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=5,
    **dbconfig
)

def get_connection():
    """
    Get a connection from the pool.
    Remember to close() the connection after use to release it back to the pool.
    """
    return connection_pool.get_connection()
