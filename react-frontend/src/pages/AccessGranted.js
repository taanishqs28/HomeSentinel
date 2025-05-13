import React from "react";
import { useLocation } from "react-router-dom";

const AccessGranted = () => {
  const location = useLocation();
  const username =
    location.state?.user ||
    localStorage.getItem("username") ||
    "User";

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>✅ Access Granted</h2>
      <p>Welcome, {username}!</p>
    </div>
  );
};

export default AccessGranted;
