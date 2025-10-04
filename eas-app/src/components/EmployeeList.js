// src/components/ViewEmployee.js
import React, { useState } from "react";
import axios from "axios";

export default function ViewEmployee({ token, role }) {
  const [query, setQuery] = useState(""); 
  const [employee, setEmployee] = useState(null);
  const [summary, setSummary] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Restrict access
  if (!["admin", "hr"].includes(role)) {
    return <p style={{ color: "red" }}>Access denied — admin or hr only.</p>;
  }

const handleSearch = async (e) => {
  e.preventDefault();
  setError("");
  setEmployee(null);
  setSummary([]);
  setLogs([]);

  const trimmed = query.trim();
  if (!trimmed) {
    setError("Enter employee code (e.g. EMP001) or numeric id.");
    return;
  }

  setLoading(true);
  try {
    // Ensure params object has exactly code or id
    const params = {};
    if (/^\d+$/.test(trimmed)) {
      params.id = trimmed;  // numeric id
    } else {
      params.code = trimmed;  // employee code
    }

    const res = await axios.get(
      "http://127.0.0.1:5000/employee/attendance",
      {
        params,
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const data = res.data;
    setEmployee(data.employee || null);
    setSummary(data.summary || []);
    setLogs(data.logs || []);
  } catch (err) {
    console.error(err);
    setError(err?.response?.data?.msg || "Failed to fetch attendance."); // backend uses 'msg'
  } finally {
    setLoading(false);
  }
};
  // Helper: format duration into hh:mm:ss
  const formatDuration = (seconds) => {
    if (!seconds) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>View Employee Attendance</h2>

      <form onSubmit={handleSearch} style={{ marginBottom: 12 }}>
        <input
          placeholder="Enter employee code (EMP001) or numeric id"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: 8, width: 320 }}
        />
        <button type="submit" style={{ marginLeft: 8, padding: "8px 12px" }}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

      {employee && (
        <div style={{ marginBottom: 16 }}>
          <strong>Employee:</strong> {employee.full_name} ({employee.employee_code}) — role:{" "}
          {employee.role}
        </div>
      )}

      {/* Attendance Summary Table */}
      {employee && summary.length > 0 ? (
        <div style={{ marginBottom: 24 }}>
          <h3>Attendance Summary</h3>
          <table border="1" cellPadding="6">
            <thead>
              <tr>
                <th>Date</th>
                <th>First IN</th>
                <th>Last OUT</th>
                <th>Total Duration</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s) => (
                <tr key={s.id}>
                  <td>{s.date}</td>
                  <td>{s.first_in || "-"}</td>
                  <td>{s.last_out || "-"}</td>
                  <td>{formatDuration(s.total_duration_seconds)}</td>
                  <td>{s.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        employee && <p>No attendance summary found.</p>
      )}

      {/* Attendance Logs Table */}
      {employee && logs.length > 0 ? (
        <div>
          <h3>Attendance Logs</h3>
          <table border="1" cellPadding="6">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Event Type</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{l.timestamp}</td>
                  <td>{l.event_type}</td>
                  <td>{l.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        employee && <p>No logs found.</p>
      )}
    </div>
  );
}
