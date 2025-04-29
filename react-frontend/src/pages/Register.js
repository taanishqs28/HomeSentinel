import React, { useState } from "react";
import "../styles/styles.css";
import { useNavigate } from "react-router-dom";
import api from "../api";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    isAdmin: false,
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // ✅ Frontend validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.username ||
      !formData.password
    ) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      return;
    }

    const payload = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      username: formData.username,
      password: formData.password,
      role: formData.isAdmin ? "admin" : "user",
      household_id: null,
      face_embedding: [],
      created_at: new Date().toISOString(),
    };

    console.log("Sending payload to backend:", payload);

    try {
      await api.post("/auth/register", payload);
      setMessage("✅ Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("❌ Registration error:", error.response?.data);

      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        const msg = detail.map((e) => `${e.loc.join(".")}: ${e.msg}`).join(" | ");
        setMessage("Registration failed: " + msg);
      } else if (typeof detail === "object") {
        setMessage("Registration failed: " + (detail.msg || JSON.stringify(detail)));
      } else {
        setMessage("Registration failed: " + (detail || error.message));
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <label style={{ display: "block", marginTop: "10px" }}>
          <input
            type="checkbox"
            checked={formData.isAdmin}
            onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
          />
          Register as Admin
        </label>
        <button type="submit">Register</button>
      </form>

      {message && <p style={{ color: message.includes("failed") ? "red" : "green" }}>{message}</p>}
    </div>
  );
};

export default Register;

