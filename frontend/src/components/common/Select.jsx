import React from "react";

const Select = ({ label, options = [], placeholder, ...props }) => {
  const safeOptions = Array.isArray(options) ? options : [];
  const handleChange = (event) => {
    if (typeof props.onChange === "function") {
      props.onChange(event.target.value, event);
    }
  };

  return (
    <label className="form-field">
      <span>{label}</span>
      <select {...props} value={props.value ?? ""} onChange={handleChange}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {safeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default Select;
