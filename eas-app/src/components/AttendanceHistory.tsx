import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Calendar, Clock } from 'lucide-react';
import type { AttendanceSummary } from '../types';

export default function AttendanceHistory() {
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(lastMonth.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      loadHistory();
    }
  }, [startDate, endDate]);

  const loadHistory = async () => {
    setIsLoading(true);
    const response = await apiService.getMyAttendanceSummary(startDate, endDate);
    if (response.success && response.data) {
      setSummaries(response.data);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Calendar className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800">Attendance History</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-slate-600">Loading...</div>
      ) : summaries.length === 0 ? (
        <div className="text-center py-8 text-slate-600">No attendance records found for this period</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Check In</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Check Out</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Duration</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((summary) => (
                <tr key={summary.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-slate-800">{formatDate(summary.date)}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
