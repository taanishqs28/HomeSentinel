import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleAccess = async () => {
    if (!file) {
      setMessage("Please upload a face image first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8000/verify-face/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.status === "Access Granted") {
        navigate("/access-granted", { state: { user: res.data.user } });
      } else {
        navigate("/access-denied");
      }
    } catch (error) {
      navigate("/access-denied");
    }
  };

  return (
    <div className="home-container" style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome to HomeSentinel</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ marginBottom: "10px" }}
      />
      <br />

      <button onClick={handleAccess} style={{ marginRight: "10px" }}>
        Gain Access
      </button>

      <button onClick={() => navigate("/login")}>Login</button>

      {message && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
};

export default Home;
