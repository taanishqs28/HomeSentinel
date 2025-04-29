import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const Home = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const nav              = useNavigate();

  const handleAccess = async () => {
    if (!file) return alert("Upload a face first.");
    const fd = new FormData();
    fd.append("file", file);

    try {
      const { data } = await api.post("/face/verify", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.status === "Access Granted") {
        nav("/access-granted", { state: { user: data.user } });
      } else {
        nav("/access-denied");
      }
    } catch {
      nav("/access-denied");
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

      <button onClick={() => nav("/login")}>Login</button>

      {message && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
};

export default Home;
