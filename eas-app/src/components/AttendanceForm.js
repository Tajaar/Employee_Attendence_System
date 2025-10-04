import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AttendanceForm({ token }) {
  const [status, setStatus] = useState("OUT"); // Default state

  // Fetch latest status when page loads
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5000/attendance/status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.status) {
          setStatus(res.data.status);
        }
      } catch (err) {
        console.error("Failed to fetch status:", err);
      }
    };
    fetchStatus();
  }, [token]);

  const toggleAttendance = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/attendance/toggle",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus(res.data.status); // Update status in UI
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("Failed to toggle attendance");
    }
  };

  return (
    <div>
      <h2>Mark Attendance</h2>
      <p>
        Current Status: <strong>{status}</strong>
      </p>
      <button onClick={toggleAttendance}>
        {status === "OUT" ? "Check IN" : "Check OUT"}
      </button>
    </div>
  );
}
