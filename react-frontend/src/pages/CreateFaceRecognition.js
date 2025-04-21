import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function CreateFaceRecognition() {
  const [file, setFile] = useState(null);
  const [msg, setMsg]   = useState("");
  const navigate        = useNavigate();

  const handleEnroll = async () => {
    if (!file) {
      setMsg("Please pick a photo first.");
      return;
    }
    const form = new FormData();
    form.append("file", file);

    try {
      await api.post("/face/enroll", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg("Face enrolled! Redirecting to dashboard…");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setMsg("Enrollment failed: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h2>Enroll Your Face</h2>
      <input
        type="file"
        accept="image/*"
        onChange={e => setFile(e.target.files[0])}
      />
      <br /><br />
      <button onClick={handleEnroll}>Upload & Enroll</button>
      {msg && <p>{msg}</p>}
    </div>
  );
}
