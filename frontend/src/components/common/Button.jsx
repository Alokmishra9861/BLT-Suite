import React from "react";

const Button = ({
  children,
  label,
  variant = "primary",
  type = "button",
  ...props
}) => {
  return (
    <button type={type} className={`btn btn-${variant}`} {...props}>
      {children || label}
    </button>
  );
};

export default Button;
