import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log("Attempting to register:", username, password); // Debugging

    try {
      const response = await axios.post("http://localhost:8000/auth/register", {
        username: username,  // Ensure correct values are sent
        password: password
      });

      setMessage("Registration successful! You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      if (error.response && error.response.data.detail) {
        setMessage(error.response.data.detail); // Show backend error message
      } else {
        setMessage("Registration failed. Try again.");
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Register</h2>
      <form onSubmit={handleRegister} style={styles.form}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Register</button>
      </form>
      {message && <p style={styles.error}>{message}</p>}
    </div>
  );
};

const styles = {
  container: { display: "flex", flexDirection: "column", alignItems: "center", marginTop: "50px" },
  title: { fontSize: "24px", fontWeight: "bold", marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column", width: "300px" },
  input: { padding: "10px", marginBottom: "10px", fontSize: "16px", borderRadius: "5px", border: "1px solid #ccc" },
  button: { padding: "10px", fontSize: "16px", backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
  error: { color: "red", marginTop: "10px" },
};

export default Register;
