import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/add-member.css";

const AddMember = () => {
  const [form, setForm] = useState({ name: "", email: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      setMessage("Please fill in both fields.");
      return;
    }
    try {
      const res = await api.post("/household/invite", form);
      setMessage(`Invite sent! Link: ${res.data.invite_url}`);
      setForm({ name: "", email: "" });
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.detail || "Failed to send invite"}`);
    }
  };

  return (
    <div className="add-member-container">
      <h2>Add New Member</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <button type="submit">Send Invite</button>
      </form>
      {message && <p className="message">{message}</p>}
      <button onClick={() => navigate("/manage-household")}>← Back to Household</button>
    </div>
  );
};

export default AddMember;
