# Employee_Attendence_System
BASIC


Schema:
CREATE DATABASE emp_attendance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE emp_attendance;

-- Employees
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_code VARCHAR(50) NOT NULL UNIQUE, -- card id or staff id
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('employee','hr','admin') DEFAULT 'employee',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance summary per day (one row per employee per day)
CREATE TABLE attendance_summary (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  date DATE NOT NULL,
  first_in DATETIME NULL,
  last_out DATETIME NULL,
  total_duration_seconds INT DEFAULT 0, -- computed as seconds present
  notes TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_emp_date (employee_id, date),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Detailed logs, every tap recorded (multiple IN/OUTs)
CREATE TABLE attendance_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  event_type ENUM('IN','OUT') NOT NULL,
  timestamp DATETIME NOT NULL,
  source VARCHAR(100) DEFAULT 'web', -- e.g. card_reader, mobile, simulator
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX (employee_id, timestamp)
);
