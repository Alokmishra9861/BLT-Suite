import React from "react";
import { useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="breadcrumbs">
      <span>Home</span>
      {segments.map((segment, index) => (
        <span key={`${segment}-${index}`}>/ {segment.replace("-", " ")}</span>
      ))}
    </div>
  );
};

export default Breadcrumbs;
