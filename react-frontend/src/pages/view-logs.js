// src/pages/ViewLogs.js
import React, { useEffect, useState } from "react";
import "../styles/styles.css";

const ViewLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Unauthorized. Please log in.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:5000/api/logs", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch logs");
        }
        return response.json();
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

  return (
    <div className="logs-container">
      <h2>View Logs</h2>
      {loading && <p>Loading logs...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <div className="logs-list">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="log-entry">
                <p><strong>Timestamp:</strong> {log.timestamp}</p>
                <p><strong>Event:</strong> {log.event}</p>
              </div>
            ))
          ) : (
            <p>No logs found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewLogs;
