import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Clock, LogOut, LogIn as LogInIcon, Calendar, TrendingUp } from 'lucide-react';
import type { AttendanceLog, AttendanceSummary } from '../types';
import AttendanceHistory from './AttendanceHistory';

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const [todayStatus, setTodayStatus] = useState<'not_marked' | 'checked_in' | 'checked_out'>('not_marked');
  const [lastLog, setLastLog] = useState<AttendanceLog | null>(null);
  const [todaySummary, setTodaySummary] = useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTodayAttendance();
  }, []);

  const loadTodayAttendance = async () => {
    const today = new Date().toISOString().split('T')[0];
    const logsResponse = await apiService.getMyAttendanceLogs(today, today);
    const summaryResponse = await apiService.getMyAttendanceSummary(today, today);

    if (logsResponse.success && logsResponse.data) {
      const logs = logsResponse.data;
      if (logs.length > 0) {
        const latest = logs[logs.length - 1];
        setLastLog(latest);
        setTodayStatus(latest.event_type === 'IN' ? 'checked_in' : 'checked_out');
      }
    }

    if (summaryResponse.success && summaryResponse.data && summaryResponse.data.length > 0) {
      setTodaySummary(summaryResponse.data[0]);
    }
  };

  const handleMarkIn = async () => {
    setIsLoading(true);
    setMessage('');

    const response = await apiService.markAttendanceIn();

    if (response.success) {
      setMessage('Checked in successfully!');
      await loadTodayAttendance();
    } else {
      setMessage(response.error || 'Failed to check in');
    }

    setIsLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleMarkOut = async () => {
    setIsLoading(true);
    setMessage('');

    const response = await apiService.markAttendanceOut();

    if (response.success) {
      setMessage('Checked out successfully!');
      await loadTodayAttendance();
    } else {
      setMessage(response.error || 'Failed to check out');
    }

    setIsLoading(false);
    setTimeout(() => setMessage(''), 3000);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Employee Portal</h1>
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
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Today's Status</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Status:</span>
                <span className={`font-medium ${todayStatus === 'checked_in' ? 'text-green-600' : todayStatus === 'checked_out' ? 'text-orange-600' : 'text-slate-600'}`}>
                  {todayStatus === 'checked_in' ? 'Checked In' : todayStatus === 'checked_out' ? 'Checked Out' : 'Not Marked'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Last Action:</span>
                <span className="font-medium text-slate-800">
                  {lastLog ? formatTime(lastLog.timestamp) : '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <LogInIcon className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Check In Time</h3>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {formatTime(todaySummary?.first_in || null)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Total Duration</h3>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {todaySummary ? formatDuration(todaySummary.total_duration_seconds) : '0h 0m'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 text-center">Mark Attendance</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleMarkIn}
              disabled={isLoading || todayStatus === 'checked_in'}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <LogInIcon className="w-5 h-5" />
              <span>Check In</span>
            </button>
            <button
              onClick={handleMarkOut}
              disabled={isLoading || todayStatus !== 'checked_in'}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <LogOut className="w-5 h-5" />
              <span>Check Out</span>
            </button>
          </div>
        </div>

        <AttendanceHistory />
      </main>
    </div>
  );
}
