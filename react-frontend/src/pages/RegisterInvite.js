import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Register.css";

const RegisterInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [inviteData, setInviteData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch invite details
    const fetchInvite = async () => {
      try {
        const res = await api.get(`/household/invite/${token}`);
        setInviteData(res.data);
        setFormData((prev) => ({
          ...prev,
          name: res.data.name,
        }));
      } catch (err) {
        setMessage("Invalid or expired invite link.");
      }
    };
    fetchInvite();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      return;
    }

    const payload = {
      token,
      name          : formData.name,
      username      : formData.username,
      password      : formData.password,
      email         : inviteData.email,
      role          : "user",
      household_id  : inviteData.household_id,
      face_embedding: [],
    };

    try {
      await api.post("/auth/invite-register", payload);
      setMessage("✅ Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage("Registration failed: " + (error.response?.data?.detail || error.message));
    }
  };

  return (
    <div className="register-page">
      <div className="top-left">
        <button onClick={() => navigate("/")} className="home-button">Home</button>
      </div>

      <div className="register-container">
        <h2>Complete Your Registration</h2>
        {message && <p className={message.includes("failed") ? "error-message" : "success-message"}>{message}</p>}
        {inviteData ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              readOnly
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
                <svg viewBox="0 0 24 24">
                  {showPassword ? (
                    <path d="M12 5C7 5 2.7 8.6 1 12c1.7 3.4 6 7 11 7s9.3-3.6 11-7c-1.7-3.4-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
                  ) : (
                    <path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
                  )}
                </svg>
              </span>
            </div>
            <button type="submit">Register</button>
          </form>
        ) : (
          <p>Loading invite details...</p>
        )}
      </div>
    </div>
  );
};

export default RegisterInvite;
