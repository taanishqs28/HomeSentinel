// src/pages/ViewLogs.js
import React, { useEffect, useState } from "react";
import "../styles/styles.css";

const ViewLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/logs", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch logs");
        return res.json();
      })
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="view-logs-container">
      <h2>System Logs</h2>

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
            <div className="log-event">📍 {log.event}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewLogs;
