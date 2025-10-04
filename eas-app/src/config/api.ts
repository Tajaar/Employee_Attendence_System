export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  attendance: {
    markIn: '/attendance/in',
    markOut: '/attendance/out',
    getMyLogs: '/attendance/logs/me',
    getMySummary: '/attendance/summary/me',
  },
  admin: {
    getAllEmployees: '/admin/employees',
    getEmployeeAttendance: (employeeId: number) => `/admin/attendance/${employeeId}`,
    getAllAttendanceSummary: '/admin/attendance/summary',
    getAttendanceLogs: '/admin/attendance/logs',
  },
};
