// eas-app/src/services/api.ts
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import type {
  ApiResponse,
  AttendanceLog,
  AttendanceSummary,
  LoginCredentials,
  User,
} from '../types';

class ApiService {
  private getAuthToken(): string | null {
    // Always read token from localStorage automatically
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Request failed',
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

  // ---------------- AUTH ----------------
  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<{ user: User; access_token: string }>> {
    return this.request(API_ENDPOINTS.auth.login, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request(API_ENDPOINTS.auth.logout, { method: 'POST' });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request(API_ENDPOINTS.auth.me);
  }

  // ---------------- ATTENDANCE ----------------
  async markAttendanceIn(): Promise<ApiResponse<AttendanceLog>> {
    return this.request(API_ENDPOINTS.attendance.markIn, { method: 'POST' });
  }

  async markAttendanceOut(): Promise<ApiResponse<AttendanceLog>> {
    return this.request(API_ENDPOINTS.attendance.markOut, { method: 'POST' });
  }

  async getMyAttendanceLogs(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<AttendanceLog[]>> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`${API_ENDPOINTS.attendance.getMyLogs}${query}`);
  }

  async getMyAttendanceSummary(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<AttendanceSummary[]>> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`${API_ENDPOINTS.attendance.getMySummary}${query}`);
  }

  // ---------------- ADMIN ----------------
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
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`${API_ENDPOINTS.admin.getEmployeeAttendance(employeeId)}${query}`);
  }

  async getAllAttendanceSummary(date?: string): Promise<ApiResponse<AttendanceSummary[]>> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`${API_ENDPOINTS.admin.getAllAttendanceSummary}${query}`);
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
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`${API_ENDPOINTS.admin.getAttendanceLogs}${query}`);
  }
}

export const apiService = new ApiService();
