import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import EmployeeList from "./components/EmployeeList";
import AttendanceForm from "./components/AttendanceForm";
import AddEmployee from "./components/AddEmployee";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");

    if (role) localStorage.setItem("role", role);
    else localStorage.removeItem("role");
  }, [token, role]);

  // Private route for logged-in users
  const PrivateRoute = ({ children }) => token ? children : <Navigate to="/login" />;

  // Admin or HR route
  const AdminHrRoute = ({ children }) =>
    ["admin", "hr"].includes(role?.toLowerCase()) ? children : <Navigate to="/" />;

  // Admin-only route
  const AdminRoute = ({ children }) =>
    role?.toLowerCase() === "admin" ? children : <Navigate to="/" />;

  return (
    <Router>
      <Navbar token={token} role={role} setToken={setToken} setRole={setRole} />
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} setRole={setRole} />} />
        {/* View Employee - admin/hr */}
        <Route
          path="/view-employee"
          element={
            <PrivateRoute>
              <AdminHrRoute>
                <EmployeeList token={token} role={role} />
              </AdminHrRoute>
            </PrivateRoute>
          }
        />

        {/* Mark Attendance - all logged-in users */}
        <Route
          path="/attendance"
          element={
            <PrivateRoute>
              <AttendanceForm token={token} />
            </PrivateRoute>
          }
        />

        {/* Add Employee - admin only */}
        <Route
          path="/add-employee"
          element={
            <PrivateRoute>
              <AdminRoute>
                <AddEmployee token={token} />
              </AdminRoute>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
