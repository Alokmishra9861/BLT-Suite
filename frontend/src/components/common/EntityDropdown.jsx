import React from "react";

const EntityDropdown = ({ entities = [], value, onChange }) => {
  return (
    <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select entity</option>
      {entities.map((ent) => (
        <option key={ent._id} value={ent._id}>
          {ent.name}
        </option>
      ))}
    </select>
  );
};

export default EntityDropdown;
