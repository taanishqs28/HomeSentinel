import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", { username, password });
      const token = response.data.access_token;
      localStorage.setItem("token", token);
      
      // Fetch user profile
      const profileResponse = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = profileResponse.data;
      
      localStorage.setItem("username", user.username);
      localStorage.setItem("role", user.role);
      
      // Redirect to appropriate dashboard
      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }
      
    } catch (error) {
      setErrorMessage("Invalid username or password");
    }
  };

  return (
    <div className="login-page">
      <div className="top-left">
        <button onClick={() => navigate("/")} className="home-button">Home</button>
      </div>

      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <div className="password-input-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <button type="submit">Login</button>
        </form>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/register")}
        >
          New user? Register
        </button>
      </div>
    </div>
  );
};

export default Login;
