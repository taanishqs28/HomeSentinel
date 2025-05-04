import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import HouseholdTable from "../component/HouseholdTable.js";
import "../styles/manage-household.css";

const ManageHousehold = () => {
  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res1 = await api.get("/household/me");
        setHousehold(res1.data);
        setCurrentUserRole(res1.data.current_user_role || "user");

        const res2 = await api.get("/household/members");
        setMembers(res2.data);
      } catch (err) {
        const message = err.response?.data?.detail || err.message;
        setError(message);

        // Fetch user role even when household is missing
        try {
          const userRes = await api.get("/auth/me");
          setCurrentUserRole(userRes.data.role);
        } catch (e) {
          console.error("Failed to get user role", e);
        }

        console.error(message);
      }
    };
    fetchData();
  }, []);

  const handlePromote = async (userId) => {
    await api.post("/household/promote", { user_id: userId });
    refreshMembers();
  };

  const handleDemote = async (userId) => {
    if (userId === household?.current_user_id) {
      alert("You cannot demote yourself from admin.");
      return;
    }
    try {
      await api.post("/household/demote", { user_id: userId });
      setMembers((prev) =>
        prev.map((m) => (m.id === userId ? { ...m, role: "user" } : m))
      );
      setDropdownOpen(null);
    } catch (err) {
      alert("Failed to demote user.");
    }
  };

  const handleRemove = async (userId) => {
    if (userId === household?.current_user_id) {
      alert("You cannot remove yourself.");
      return;
    }
    try {
      await api.post("/household/remove-member", { user_id: userId });
      setMembers((prev) => prev.filter((m) => m.id !== userId));
      setDropdownOpen(null);
    } catch (err) {
      console.error(err);
      alert("Failed to remove user. Please try again.");
    }
  };

  const refreshMembers = async () => {
    const res = await api.get("/household/members");
    setMembers(res.data);
    setDropdownOpen(null);
  };

  return (
    <div className="manage-household-container">
      <h2>🏡 Manage Household</h2>
      {error ? (
        <>
          <p style={{ color: "red" }}>{error}</p>
          {currentUserRole === "admin" && (
            <button
              className="add-member-btn"
              onClick={() => navigate("/create-household")}
              style={{ marginBottom: "20px" }}
            >
              ➕ Create Household
            </button>
          )}
        </>
      ) : household ? (
        <>
          <h3>Household: {household.name}</h3>
          <p>📍 {household.address}</p>
          <button
            className="add-member-btn"
            onClick={() => navigate("/add-member")}
          >
            ➕ Add Member
          </button>
          <HouseholdTable
            members={members}
            household={household}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            handlePromote={handlePromote}
            handleDemote={handleDemote}
            handleRemove={handleRemove}
          />
        </>
      ) : (
        <p>Loading...</p>
      )}
      <button
        onClick={() => navigate("/admin-dashboard")}
        className="back-btn"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default ManageHousehold;
