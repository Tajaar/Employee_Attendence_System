from datetime import datetime, date, timedelta
from typing import List, Optional
from database import get_db


class AttendanceService:

    @staticmethod
    def mark_attendance(employee_id: int, event_type: str, source: str = "web") -> dict:
        timestamp = datetime.now()
        current_date = timestamp.date()

        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT event_type, timestamp
                    FROM attendance_logs
                    WHERE employee_id = %s
                    AND DATE(timestamp) = %s
                    ORDER BY timestamp DESC
                    LIMIT 1
                    """,
                    (employee_id, current_date)
                )
                last_log = cursor.fetchone()

                if last_log and last_log["event_type"] == event_type:
                    raise ValueError(f"Already checked {event_type.lower()}")

                cursor.execute(
                    """
                    INSERT INTO attendance_logs (employee_id, event_type, timestamp, source)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (employee_id, event_type, timestamp, source)
                )
                log_id = cursor.lastrowid

                AttendanceService._update_summary(cursor, employee_id, current_date)

                return {
                    "id": log_id,
                    "employee_id": employee_id,
                    "event_type": event_type,
                    "timestamp": timestamp,
                    "source": source
                }

    @staticmethod
    def _update_summary(cursor, employee_id: int, date_val: date):
        cursor.execute(
            """
            SELECT
                MIN(CASE WHEN event_type = 'IN' THEN timestamp END) as first_in,
                MAX(CASE WHEN event_type = 'OUT' THEN timestamp END) as last_out
            FROM attendance_logs
            WHERE employee_id = %s AND DATE(timestamp) = %s
            """,
            (employee_id, date_val)
        )
        result = cursor.fetchone()

        first_in = result["first_in"]
        last_out = result["last_out"]

        total_duration = 0
        if first_in and last_out:
            total_duration = int((last_out - first_in).total_seconds())
        elif first_in:
            total_duration = int((datetime.now() - first_in).total_seconds())

        cursor.execute(
            """
            INSERT INTO attendance_summary
            (employee_id, date, first_in, last_out, total_duration_seconds)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                first_in = VALUES(first_in),
                last_out = VALUES(last_out),
                total_duration_seconds = VALUES(total_duration_seconds)
            """,
            (employee_id, date_val, first_in, last_out, total_duration)
        )

    @staticmethod
    def get_logs(employee_id: Optional[int] = None, start_date: Optional[date] = None,
                 end_date: Optional[date] = None) -> List[dict]:
        with get_db() as conn:
            with conn.cursor() as cursor:
                query = "SELECT * FROM attendance_logs WHERE 1=1"
                params = []

                if employee_id:
                    query += " AND employee_id = %s"
                    params.append(employee_id)

                if start_date:
                    query += " AND DATE(timestamp) >= %s"
                    params.append(start_date)

                if end_date:
                    query += " AND DATE(timestamp) <= %s"
                    params.append(end_date)

                query += " ORDER BY timestamp DESC"

                cursor.execute(query, params)
                return cursor.fetchall()

    @staticmethod
    def get_summary(employee_id: Optional[int] = None, start_date: Optional[date] = None,
                   end_date: Optional[date] = None, specific_date: Optional[date] = None) -> List[dict]:
        with get_db() as conn:
            with conn.cursor() as cursor:
                query = """
                    SELECT
                        s.*,
                        e.full_name as employee_name,
                        e.employee_code
                    FROM attendance_summary s
                    LEFT JOIN employees e ON s.employee_id = e.id
                    WHERE 1=1
                """
                params = []

                if employee_id:
                    query += " AND s.employee_id = %s"
                    params.append(employee_id)

                if specific_date:
                    query += " AND s.date = %s"
                    params.append(specific_date)
                else:
                    if start_date:
                        query += " AND s.date >= %s"
                        params.append(start_date)

                    if end_date:
                        query += " AND s.date <= %s"
                        params.append(end_date)

                query += " ORDER BY s.date DESC"

                cursor.execute(query, params)
                return cursor.fetchall()

    @staticmethod
    def get_all_employees() -> List[dict]:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT id, employee_code, full_name, email, role, is_active FROM employees WHERE is_active = 1"
                )
                return cursor.fetchall()
