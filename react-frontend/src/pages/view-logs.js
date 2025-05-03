import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/styles.css";

const ViewLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Unauthorized: Please log in.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:8000/api/logs", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch logs");
        return res.json();
      })
      .then((data) => {
        // ✅ Filter logs based on role
        const filteredLogs = role === "admin"
          ? data // show all logs for household
          : data.filter((log) => log.username === username); // show only personal logs

        setLogs(filteredLogs);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [role, username]);

  const handleBack = () => {
    if (role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/user-dashboard");
    }
  };

  return (
    <div className="view-logs-container">
      <h2>{role === "admin" ? "Household Logs" : "Your Logs"}</h2>

      {loading && <p className="loading">Loading logs...</p>}
      {error && <p className="error">Error: {error}</p>}
      {!loading && !error && logs.length === 0 && (
        <p className="no-logs">No logs available.</p>
      )}

      <div className="logs-grid">
        {logs.map((log, index) => (
          <div key={index} className="log-card">
            <div className="log-timestamp">🕒 {new Date(log.timestamp).toLocaleString()}</div>
            <div className="log-user">👤 {log.username || "Unknown"}</div>
            <div className="log-event">📍 {log.status || log.event}</div>
          </div>
        ))}
      </div>

      <button onClick={handleBack} style={{ marginTop: "20px" }}>
        Back to Dashboard
      </button>
    </div>
  );
};

export default ViewLogs;
