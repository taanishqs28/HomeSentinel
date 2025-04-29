import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const ManageHousehold = () => {
  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
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
          <h3>Household: {household.name}</h3>
          <p>📍 Address: {household.address}</p>

          <h3>👥 Members</h3>
          <ul>
            {members.map((member) => (
              <li key={member.id}>
                {member.name} — <strong>{member.role}</strong> ({member.email})
              </li>
            ))}
          </ul>

          <h3>📨 Invite New Member</h3>
          <p>(We’ll add this form in the next step!)</p>
        </>
      ) : (
        <p>Loading household info...</p>
      )}
    </div>
  );
};

export default ManageHousehold;
