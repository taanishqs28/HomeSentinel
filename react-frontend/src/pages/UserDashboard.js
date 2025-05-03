import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";  // ✅ make sure you have this import for API calls
import "../styles/styles.css";
import "../styles/Dashboard.css";

const UserDashboard = () => {
  const [firstName, setFirstName] = useState("");
  const [household, setHousehold] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (!token || !storedUsername || role !== "user") {
      navigate("/login");
    } else {
      // ✅ Fetch user profile
      api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const fullName = res.data.name || "";
        const first = fullName.split(" ")[0];  // get the first part
        setFirstName(first);
      })
      .catch(() => {
        setFirstName("User");
      });

      // ✅ Fetch household info
      api.get("/household/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setHousehold(res.data.name);
      })
      .catch(() => {
        setHousehold("Not Assigned");
      });
    }
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <h2>User Dashboard</h2>
      <p>Welcome to HomeSentinel, {firstName}</p>
      <p>Household: {household}</p>
      <button onClick={() => navigate("/view-logs")}>View My Logs</button>
      <button onClick={() => navigate("/create-face-recognition")}>Create Face Recognition</button>
      <button
        onClick={() => {
          localStorage.clear();
          navigate("/login");
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default UserDashboard;
