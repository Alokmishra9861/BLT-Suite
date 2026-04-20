import React from "react";

const FormField = ({
  label,
  error,
  children,
  type = "text",
  value,
  onChange,
  ...props
}) => {
  return (
    <div className="form-field">
      <label>{label}</label>
      {children ? (
        children
      ) : type === "textarea" ? (
        <textarea
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          {...props}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          {...props}
        />
      )}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};

export default FormField;
