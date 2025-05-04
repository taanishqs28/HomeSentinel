import React from "react";

const HouseholdTable = ({ members, household, dropdownOpen, setDropdownOpen, handlePromote, handleRemove, handleDemote }) => {
  return (
    <table className="members-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {members.map((m) => (
          <tr key={m.id}>
            <td>{m.name}</td>
            <td>{m.email}</td>
            <td>{m.role}</td>
            <td>
              {m.email !== household?.current_user_email && (
                <div className="member-actions">
                  <button
                    className="actions-button"
                    onClick={() =>
                      setDropdownOpen((prev) => (prev === m.id ? null : m.id))
                    }
                  >
                    ⋮
                  </button>
                  {dropdownOpen === m.id && (
                    <div className="dropdown">
                      {m.role !== "admin" ? (
                        <button onClick={() => handlePromote(m.id)}>
                          Make Admin
                        </button>
                      ) : (
                        <button onClick={() => handleDemote(m.id)}>
                          Remove Admin
                        </button>
                      )}
                      <button onClick={() => handleRemove(m.id)}>Remove</button>
                    </div>
                  )}
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default HouseholdTable;
