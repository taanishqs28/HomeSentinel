import React, { useState } from "react";
import api from "../api";
import "../styles/styles.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", { username, password });

      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage("Invalid username or password");
    }
  };

  return (
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
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>

      {/* Show error if login fails */}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      {/* Register Button */}
      <p style={{ marginTop: "20px" }}>
        New user?{" "}
        <button
          onClick={() => navigate("/register")}
          style={{ background: "none", border: "none", color: "blue", textDecoration: "underline", cursor: "pointer" }}
        >
          Register here
        </button>
        <button
          onClick={() => navigate("/")}
          style={{ background: "none", border: "none", color: "blue", textDecoration: "underline", cursor: "pointer", marginLeft: "10px" }}
        >Back</button>
      </p>
    </div>
  );
};

export default Login;
