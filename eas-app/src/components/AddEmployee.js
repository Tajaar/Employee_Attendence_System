import React, { useState } from "react";
import axios from "axios";

export default function AddEmployee({ token }) {
  const [full_name, setFullName] = useState("");
  const [employee_code, setEmployeeCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://127.0.0.1:5000/register",
        { full_name, employee_code, email, password, role },
        { headers: { Authorization: token } }
      );
      alert("Employee added successfully");
      setFullName("");
      setEmployeeCode("");
      setEmail("");
      setPassword("");
      setRole("employee");
    } catch (err) {
      console.error(err);
      alert("Failed to add employee");
    }
  };

  return (
    <div>
      <h2>Add Employee (Admin Only)</h2>
      <form onSubmit={handleAdd}>
        <input placeholder="Full Name" value={full_name} onChange={(e) => setFullName(e.target.value)} required />
        <input placeholder="Employee Code" value={employee_code} onChange={(e) => setEmployeeCode(e.target.value)} required />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="employee">Employee</option>
          <option value="hr">HR</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Add Employee</button>
      </form>
    </div>
  );
}
