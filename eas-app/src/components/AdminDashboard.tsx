//eas-app/src/components/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Users, LogOut, Calendar, TrendingUp, Clock, Search } from 'lucide-react';
import type { User, AttendanceSummary } from '../types';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const [attendanceSummaries, setAttendanceSummaries] = useState<AttendanceSummary[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadAttendanceSummaries();
    }
  }, [selectedDate]);

  const loadEmployees = async () => {
    const response = await apiService.getAllEmployees();
    if (response.success && response.data) {
      setEmployees(response.data);
    }
  };

  const loadAttendanceSummaries = async () => {
    setIsLoading(true);
    const response = await apiService.getAllAttendanceSummary(selectedDate);

    if (response.success && response.data) {
      const summariesWithNames = response.data.map((summary) => {
        const employee = employees.find((emp) => emp.id === summary.employee_id);
        return {
          ...summary,
          employee_name: employee?.full_name || 'Unknown',
          employee_code: employee?.employee_code || '-',
        };
      });

      setAttendanceSummaries(summariesWithNames);

      const presentCount = summariesWithNames.filter((s) => s.first_in !== null).length;
      setStats({
        total: employees.length,
        present: presentCount,
        absent: employees.length - presentCount,
      });
    }

    setIsLoading(false);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (datetime: string | null) => {
    if (!datetime) return '-';
    return new Date(datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredSummaries = attendanceSummaries.filter((summary) =>
    summary.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    summary.employee_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const absentEmployees = employees.filter(
    (emp) => !attendanceSummaries.some((att) => att.employee_id === emp.id)
  ).filter((emp) =>
    emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employee_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Admin Portal</h1>
                <p className="text-sm text-slate-600">Welcome, {user?.full_name}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-700">Total Employees</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-700">Present Today</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.present}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-slate-700">Absent Today</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Employee Attendance</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none w-full sm:w-64"
                />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-slate-600">Loading...</div>
          ) : (
            <>
              {filteredSummaries.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold text-slate-700 mb-4">Present Employees</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Employee Code</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Check In</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Check Out</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Duration</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSummaries.map((summary) => (
                          <tr key={summary.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 text-slate-800 font-medium">{summary.employee_code}</td>
                            <td className="py-3 px-4 text-slate-800">{summary.employee_name}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2 text-slate-700">
                                <Clock className="w-4 h-4 text-green-600" />
                                {formatTime(summary.first_in)}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2 text-slate-700">
                                <Clock className="w-4 h-4 text-orange-600" />
                                {formatTime(summary.last_out)}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-800">
                              {formatDuration(summary.total_duration_seconds)}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                summary.last_out ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {summary.last_out ? 'Checked Out' : 'Checked In'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {absentEmployees.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-700 mb-4">Absent Employees</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Employee Code</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {absentEmployees.map((employee) => (
                          <tr key={employee.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 text-slate-800 font-medium">{employee.employee_code}</td>
                            <td className="py-3 px-4 text-slate-800">{employee.full_name}</td>
                            <td className="py-3 px-4 text-slate-600">{employee.email}</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Absent
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {filteredSummaries.length === 0 && absentEmployees.length === 0 && (
                <div className="text-center py-8 text-slate-600">No employees found</div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
