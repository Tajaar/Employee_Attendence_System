import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ token, role, setToken, setRole }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken("");
    setRole("");
    navigate("/login");
  };

  // Role-based links
  const links = [];

  if (token && ["admin", "hr"].includes(role?.toLowerCase())) {
    links.push(<Link key="view-employee" to="/view-employee">View Employee</Link>);
  }

  if (token) {
    links.push(<Link key="attendance" to="/attendance">Mark Attendance</Link>);
  }

  if (token && role?.toLowerCase() === "admin") {
    links.push(<Link key="add-employee" to="/add-employee">Add Employee</Link>);
  }

  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
      {links.map((link, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && " | "}
          {link}
        </React.Fragment>
      ))}

      {token && (
        <>
          {" | "}
          <button onClick={handleLogout} style={{ cursor: "pointer" }}>Logout</button>
        </>
      )}

      {!token && <Link to="/login">Login</Link>}
    </nav>
  );
}
