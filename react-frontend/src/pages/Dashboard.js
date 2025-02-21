import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirect if not logged in
    }
  }, [navigate]);

  return (
    <div style={styles.container}>
      <h2>Dashboard</h2>
      <p>Welcome</p>
      <button onClick={() => {
        localStorage.removeItem("token");
        navigate("/login");
      }}>
        Logout
      </button>
    </div>
  );
};

const styles = { container: { textAlign: "center", marginTop: "50px" } };

export default Dashboard;