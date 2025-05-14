// src/pages/ViewLogs.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/styles.css";

export default function ViewLogs() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const navigate              = useNavigate();
  const role                  = localStorage.getItem("role");
  const API_BASE              = "http://localhost:8000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Unauthorized — please log in.");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/logs`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch logs");
        return res.json();
      })
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleBack = () => {
    navigate(role === "admin" ? "/admin-dashboard" : "/user-dashboard");
  };

  return (
    <div className="view-logs-container">
      <h2>{role === "admin" ? "Household Logs" : "Your Logs"}</h2>

      {loading && <p>Loading…</p>}
      {error   && <p style={{ color: "red" }}>Error: {error}</p>}
      {!loading && !error && logs.length === 0 && <p>No logs available.</p>}

      <div className="logs-grid">
        {logs.map((log, idx) => {
          const pacific = new Date(log.timestamp).toLocaleString("en-US", {
            timeZone: "America/Los_Angeles",
            year:     "numeric",
            month:    "numeric",
            day:      "numeric",
            hour:     "numeric",
            minute:   "numeric",
            hour12:   true,
          });

          return (
            <div key={idx} className="log-card">
              <div className="log-timestamp">🕒 {pacific}</div>
              <div className="log-user">👤 {log.username || "Unknown"}</div>
              <div className="log-event">📍 {log.event}</div>
            </div>
          );
        })}
      </div>

      <button onClick={handleBack} style={{ marginTop: 20 }}>
        Back to Dashboard
      </button>
    </div>
  );
}
