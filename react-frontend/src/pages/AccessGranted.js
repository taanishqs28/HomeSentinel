import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
// only bring in the CSS that defines .top-left/.home-button
import "../styles/Login.css";

export default function AccessGranted() {
  const navigate = useNavigate();
  const user     = useLocation().state?.user || localStorage.getItem("username");

  return (
    // this outer div can be as simple as your normal page wrapper
    // I’m assuming in App.js you already render each <Page /> inside
    // a div that has your global centering/padding styles
    <div>
      {/* Home button in the absolute top-left, same as Login */}
      <div className="top-left">
        <button
          className="home-button"
          onClick={() => navigate("/")}
        >
          Home
        </button>
      </div>

      {/* your existing “Access Granted” content */}
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <h2>✅ Access Granted</h2>
        <p>Welcome back, <strong>{user}</strong>!</p>
      </div>
    </div>
  );
}
