import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/AccessDenied.css";

const AccessDenied = () => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmitPin = async () => {
    try {
      const response = await api.post("/auth/verify-pin", { pin });

      if (response.data.status === "success") {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("username", response.data.username);

        if (response.data.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      } else {
        setError("Incorrect PIN. Try again.");
      }
    } catch (err) {
      setError("PIN verification failed.");
    }
  };

  return (
    <div className="access-denied-container">
      <h2>Access Denied</h2>
      <p>Face not recognized. Enter your PIN to continue or use guest access.</p>

      <input
        type="password"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="Enter PIN"
        className="pin-input"
      />
      <button onClick={handleSubmitPin}>Submit PIN</button>

      {error && <p className="error">{error}</p>}

      <hr style={{ margin: "20px 0" }} />

      <button onClick={() => navigate("/guest")}>Continue as Guest</button>
    </div>
  );
};

export default AccessDenied;