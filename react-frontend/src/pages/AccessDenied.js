// src/pages/AccessDenied.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/AccessDenied.css";

const AccessDenied = () => {
  const [pin, setPin]     = useState("");
  const [error, setError] = useState("");
  const navigate          = useNavigate();

  const handleSubmitPin = async () => {
    try {
      const res = await api.post("/auth/verify-pin", { pin });
      const { token, username, role } = res.data;

      // persist for downstream pages
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      localStorage.setItem("role", role);

      // go to AccessGranted
      navigate("/access-granted", { state: { user: username } });
    } catch (err) {
      setError("Not a valid PIN. Try again.");
    }
  };

  return (
    <div className="access-denied-container">
      <h2>❌ Access Denied</h2>
      <p>Face not recognized. Enter your failsafe PIN to continue.</p>

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

      <button onClick={() => navigate("/guest")}>
        Continue as Guest
      </button>
    </div>
  );
};

export default AccessDenied;
