import React from "react";

const Button = ({
  children,
  variant = "primary",
  type = "button",
  ...props
}) => {
  return (
    <button type={type} className={`btn btn-${variant}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
