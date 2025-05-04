// src/pages/Register.js
import React, { useState } from "react";
import "../styles/Register.css";
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

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [failsafePin, setFailsafePin] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

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

    try {
      const res = await api.post("/auth/register", payload);
      if (res.data && res.data.failsafe_pin) {
        setFailsafePin(res.data.failsafe_pin);
        setShowPinModal(true);
        setMessage("");
      } else {
        setMessage("✅ Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        const msg = detail.map((e) => `${e.loc.join(".")}: ${e.msg}`).join(" | ");
        setMessage("Registration failed: " + msg);
      } else {
        setMessage("Registration failed: " + (detail || error.message));
      }
    }
  };

  return (
    <div className="register-page">
      <div className="top-left">
        <button onClick={() => navigate("/")} className="home-button">Home</button>
      </div>

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

          <div className="password-input-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span
              role="button"
              className="eye-button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {showPassword ? (
                  <path d="M12 5C7 5 2.7 8.6 1 12c1.7 3.4 6 7 11 7s9.3-3.6 11-7c-1.7-3.4-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
                ) : (
                  <path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
                )}
              </svg>
            </span>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.isAdmin}
              onChange={(e) =>
                setFormData({ ...formData, isAdmin: e.target.checked })
              }
            />
            Register as Admin
          </label>

          <button type="submit">Register</button>

          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/login")}
          >
            Already have an account? Login
          </button>
        </form>

        <div className="legend">
          <ul>
            <li>Username must be unique</li>
            <li>Password must be at least 8 characters</li>
            <li>All fields are required</li>
          </ul>
        </div>

        {message && (
          <p className={message.includes("failed") ? "error-message" : "success-message"}>
            {message}
          </p>
        )}
      </div>
    {/* Modal for failsafe PIN */}
    {showPinModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Failsafe PIN</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", letterSpacing: "0.2em" }}>{failsafePin}</p>
          <p>
            This is your failsafe PIN. Please write it down and keep it safe. You will not be able to see it again.
          </p>
          <button
            onClick={() => {
              setShowPinModal(false);
              setMessage("✅ Registration successful! Redirecting to login...");
              setTimeout(() => navigate("/login"), 2000);
            }}
            style={{ marginTop: "1rem" }}
          >
            OK
          </button>
        </div>
      </div>
    )}
  </div>
  );
};

export default Register;
