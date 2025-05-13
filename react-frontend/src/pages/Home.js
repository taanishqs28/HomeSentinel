// src/pages/Home.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleAccess = async () => {
   navigate("/gain-access");
  };

  return (
    <div className="home-container" style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome to HomeSentinel</h1>
      <p>Click the button below to trigger face verification from the Raspberry Pi.</p>

      <button onClick={handleAccess} style={{ marginRight: "10px" }}>
        Gain Access
      </button>

      <button onClick={() => navigate("/login")}>Login</button>

      {message && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
};

export default Home;
