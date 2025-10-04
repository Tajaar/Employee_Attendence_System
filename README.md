# Employee_Attendence_System
How to run:
NOTE: First do the frontend then do the backend.
## Backend (Flask + MySQL)

1. **Clone the repository**  
  ```bash
  git clone <repo-url>
  cd Employee_Attendence_System
  ```
2. ```bash
    cd backend
   ```
3. **Set up a Python virtual environment**  
  ```bash
  python -m venv venv
  source venv/bin/activate  # On Windows: venv\Scripts\activate
  ```
4. **Install backend dependencies**  
  ```bash
  pip install -r requirements.txt
  ```
5. Update envvironment file:
      provided to you
      Put Mysql details

6. create database in Mysql

7. put sample data in it for each table i will also provide it.

8. **Run the backend server**  
  ```bash
  python main.py
  ```

---

## Frontend (React)
1. Go to project folder

2. open terminal

3. put this
  ```bash
      npm create vite@latest eas-app -- --template react-ts 
  ```

4. ```bash
      npm install -D postcss lucide-react axios react-router-dom @supabase/supabase-js lucide-react react react-dom @eslint/js @types/react @types/react-dom @vitejs/plugin-react autoprefixer eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals postcss tailwindcss typescript typescript-eslint vite tailwindcss@3.4.14 autoprefixer
  ```

5. ```bash
      npx tailwindcss init -p  
  ```


6. **Start the frontend server**  
  ```bash
  npm run dev
  ```

Make sure both servers are running simultaneously.


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
