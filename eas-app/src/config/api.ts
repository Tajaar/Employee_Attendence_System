// eas-app/src/config/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
  },
  attendance: {
    markIn: (employeeId: number) => `/attendance/in/${employeeId}`,
    markOut: (employeeId: number) => `/attendance/out/${employeeId}`,
    getMyLogs: (employeeId: number) => `/attendance/logs/${employeeId}`,
    getMySummary: (employeeId: number) => `/attendance/summary/${employeeId}`,
  },
  admin: {
    getAllEmployees: '/admin/employees',
    getEmployeeAttendance: (employeeId: number) => `/admin/attendance/${employeeId}`,
    getAllAttendanceSummary: '/admin/attendance/summary',
    getAttendanceLogs: '/admin/attendance/logs',
  },
};
