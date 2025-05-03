import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/manage-household.css";

const ManageHousehold = () => {
  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "" });
  const [inviteResult, setInviteResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const res1 = await api.get("/household/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHousehold(res1.data);

        const res2 = await api.get("/household/members", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(res2.data);
      } catch (err) {
        const message = err.response?.data?.detail || err.message;
        setError(message);
        console.error(message);
      }
    };

    fetchData();
  }, []);

  const handlePromote = async (userId) => {
    try {
      await api.post("/household/promote", { user_id: userId });
      setMembers((prev) =>
        prev.map((m) => (m.id === userId ? { ...m, role: "admin" } : m))
      );
      setDropdownOpen(null);
    } catch (err) {
      alert("Failed to promote user.");
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await api.post("/household/remove-member", { user_id: userId });
      setMembers((prev) => prev.filter((m) => m.id !== userId));
      setDropdownOpen(null);
    } catch (err) {
      alert("Failed to remove user.");
    }
  };

  const handleInviteSubmit = async () => {
    try {
      const res = await api.post("/household/invite", inviteForm);
      setInviteResult(res.data.invite_url);
      setInviteForm({ name: "", email: "" });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to send invite");
    }
  };

  const renderMemberRow = (member) => {
    const isSelf = member.email === household?.current_user_email;
    return (
      <div className="member-row" key={member.id}>
        <div className="member-info">
          <span className="member-name">{member.name}</span>
          <span className="member-role">{member.role} — {member.email}</span>
        </div>
        {!isSelf && (
          <div className="member-actions">
            <button
              className="actions-button"
              onClick={() =>
                setDropdownOpen((prev) => (prev === member.id ? null : member.id))
              }
            >
              ⋮
            </button>
            {dropdownOpen === member.id && (
              <div className="dropdown">
                {member.role !== "admin" && (
                  <button onClick={() => handlePromote(member.id)}>Promote to Admin</button>
                )}
                <button onClick={() => handleRemove(member.id)}>Remove</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleBack = () => {
    navigate("/admin-dashboard");
  };

  return (
    <div className="manage-household-container">
      <h2>🏡 Manage Household</h2>

      {error?.includes("User is not part of any household") ? (
        <>
          <p style={{ color: "orange" }}>You haven’t created a household yet.</p>
          <button onClick={() => navigate("/create-household")}>Create One Now</button>
        </>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : household ? (
        <>
          <h3>Household: {household.name.replace(/\b\w/g, (c) => c.toUpperCase())}</h3>
          <p>📍 Address: {household.address}</p>

          <h3>👥 Members</h3>
          <div>{members.map((m) => renderMemberRow(m))}</div>

          <h3>📨 Invite New Member</h3>
          <input
            type="text"
            placeholder="Full Name"
            value={inviteForm.name}
            onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={inviteForm.email}
            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
          />
          <button onClick={handleInviteSubmit}>Send Invite</button>

          {inviteResult && (
            <div style={{ marginTop: "10px" }}>
              <p>✅ Invite Sent!</p>
              <code>{inviteResult}</code>
              <button onClick={() => navigator.clipboard.writeText(inviteResult)}>Copy Link</button>
            </div>
          )}
        </>
      ) : (
        <p>Loading household info...</p>
      )}

      <button onClick={handleBack} style={{ marginTop: "20px" }}>
        Back to Dashboard
      </button>
    </div>
  );
};

export default ManageHousehold;
