import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/styles.css";
import "../styles/Dashboard.css";


const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    if (!token || !storedUsername) {
      navigate("/login");
    } else if (role !== "admin") {
      navigate("/login"); // or navigate("/user-dashboard")
    }
  }, [navigate]);
  

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <p>Welcome to HomeSentinel</p>
      <button onClick={() => navigate("/create-face-recognition")}>Create Face Recognition</button>
      <button onClick={() => navigate("/view-logs")}>View Logs</button>
      <button onClick={() => navigate("/create-household")}>Create Household</button>
      <button onClick={() => navigate("/manage-household")}>Manage Household</button>

      <button onClick={() => {
        localStorage.removeItem("token");
        navigate("/login");
      }}>
        Logout
      </button>
    </div>
  );
};

export default AdminDashboard;
