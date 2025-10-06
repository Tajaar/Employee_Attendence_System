// eas-app/src/services/api.ts
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import type {
  ApiResponse,
  AttendanceLog,
  AttendanceSummary,
  User,
} from '../types';

class ApiService {
  private getCurrentUser(): User | null {
    const storedUser = localStorage.getItem('user_data');
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.message || data.error || 'Request failed',
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async login(
    credentials: { email: string }
  ): Promise<ApiResponse<{ user: User }>> {
    return this.request(API_ENDPOINTS.auth.login, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request(API_ENDPOINTS.auth.logout, { method: 'POST' });
  }

  async markAttendanceIn(): Promise<ApiResponse<AttendanceLog>> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not logged in');
    return this.request(API_ENDPOINTS.attendance.markIn(user.id), { method: 'POST' });
  }

  async markAttendanceOut(): Promise<ApiResponse<AttendanceLog>> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not logged in');
    return this.request(API_ENDPOINTS.attendance.markOut(user.id), { method: 'POST' });
  }

  async getMyAttendanceLogs(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<AttendanceLog[]>> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not logged in');
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const queryStr = params.toString();
    const query = queryStr ? '?' + queryStr : '';
    return this.request(API_ENDPOINTS.attendance.getMyLogs(user.id) + query);
  }

  async getMyAttendanceSummary(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<AttendanceSummary[]>> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not logged in');
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const queryStr = params.toString();
    const query = queryStr ? '?' + queryStr : '';
    return this.request(API_ENDPOINTS.attendance.getMySummary(user.id) + query);
  }

  async getAllEmployees(): Promise<ApiResponse<User[]>> {
    return this.request(API_ENDPOINTS.admin.getAllEmployees);
  }

  async getEmployeeAttendance(
    employeeId: number,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<AttendanceSummary[]>> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const queryStr = params.toString();
    const query = queryStr ? '?' + queryStr : '';
    return this.request(API_ENDPOINTS.admin.getEmployeeAttendance(employeeId) + query);
  }

  async getAllAttendanceSummary(date?: string): Promise<ApiResponse<AttendanceSummary[]>> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    const queryStr = params.toString();
    const query = queryStr ? '?' + queryStr : '';
    return this.request(API_ENDPOINTS.admin.getAllAttendanceSummary + query);
  }

  async getAttendanceLogs(
    employeeId?: number,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<AttendanceLog[]>> {
    const params = new URLSearchParams();
    if (employeeId) params.append('employee_id', employeeId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const queryStr = params.toString();
    const query = queryStr ? '?' + queryStr : '';
    return this.request(API_ENDPOINTS.admin.getAttendanceLogs + query);
  }
}

export const apiService = new ApiService();
