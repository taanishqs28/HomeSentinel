import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8000/auth/login", {
        username,
        password
      });

      localStorage.setItem("token", response.data.access_token);
      console.log("Login successful:", response.data);
      navigate("/dashboard"); // Redirect to dashboard
    } catch (error) {
      setErrorMessage("Invalid username or password");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      {errorMessage && <p style={styles.error}>{errorMessage}</p>}
    </div>
  );
};

// ✅ Define styles object here
const styles = {
  container: { textAlign: "center", marginTop: "50px" },
  error: { color: "red", marginTop: "10px" }
};

export default Login;
