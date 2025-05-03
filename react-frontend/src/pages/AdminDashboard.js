import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/styles.css";
import "../styles/Dashboard.css";

const AdminDashboard = () => {
  const [firstName, setFirstName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (!token || !storedUsername) {
      navigate("/login");
    } else if (role !== "admin") {
      navigate("/login");
    } else {
      api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const fullName = res.data.name || "";
        const first = fullName.split(" ")[0];
        setFirstName(first);
      })
      .catch(() => {
        setFirstName("Admin");
      });
    }
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <h2>Admin Dashboard</h2>
      <p>Welcome to HomeSentinel, {firstName}</p>
      <button onClick={() => navigate("/create-face-recognition")}>Create Face Recognition</button>
      <button onClick={() => navigate("/view-logs")}>View Logs</button>
      <button onClick={() => navigate("/create-household")}>Create Household</button>
      <button onClick={() => navigate("/manage-household")}>Manage Household</button>
      <button onClick={() => {
        localStorage.clear();
        navigate("/login");
      }}>
        Logout
      </button>
    </div>
  );
};

export default AdminDashboard;
