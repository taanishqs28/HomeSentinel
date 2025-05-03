import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const CreateHousehold = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!name.trim() || !address.trim()) {
      setMessage("Please fill in all required fields.");
      return;
    }

    try {
      const response = await api.post("/household/create", { name, address });

      console.log("Household created response:", response.data);
      console.log("Token in localStorage:", localStorage.getItem("token"));

      setMessage("Household created successfully!");
      setTimeout(() => navigate("/admin-dashboard"), 1500);
    } catch (err) {
      console.error("Error response:", err.response?.data || err.message);
      console.log("Token after error:", localStorage.getItem("token"));

      if (err.response && err.response.status === 400) {
        setMessage("Household already exists. Try a different name.");
      } else if (err.response && err.response.status === 401) {
        setMessage("Unauthorized. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setMessage("Error creating household: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleBack = () => {
    navigate("/admin-dashboard");
  };

  return (
    <div className="create-household-container">
      <h2>Create Household</h2>

      <label>
        Household Name <span style={{ color: "red" }}>*</span>
      </label>
      <input
        type="text"
        placeholder="Household Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label>
        Address <span style={{ color: "red" }}>*</span>
      </label>
      <input
        type="text"
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <button onClick={handleCreate}>Create Household</button>

      {message && (
        <p style={{ color: message.toLowerCase().includes("error") || message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("please") ? "red" : "green" }}>
          {message}
        </p>
      )}

      <button onClick={handleBack} style={{ marginTop: "20px" }}>
        Back to Dashboard
      </button>
    </div>
  );
};

export default CreateHousehold;
