import React from "react";

const LoadingSkeleton = ({ lines = 1 }) => {
  return (
    <div className="skeleton">
      {Array.from({ length: lines }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
