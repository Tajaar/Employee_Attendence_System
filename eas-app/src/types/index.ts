export type UserRole = 'employee' | 'hr' | 'admin';

export interface User {
  id: number;
  employee_code: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

export interface AttendanceLog {
  id: number;
  employee_id: number;
  event_type: 'IN' | 'OUT';
  timestamp: string;
  source: string;
}

export interface AttendanceSummary {
  id: number;
  employee_id: number;
  date: string;
  first_in: string | null;
  last_out: string | null;
  total_duration_seconds: number;
  notes: string | null;
  employee_name?: string;
  employee_code?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
