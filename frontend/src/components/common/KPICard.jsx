import React from "react";

const KPICard = ({ label, value, trend }) => {
  return (
    <div className="kpi-card">
      <span className="kpi-label">{label}</span>
      <strong className="kpi-value">{value}</strong>
      {trend && <span className="kpi-trend">{trend}</span>}
    </div>
  );
};

export default KPICard;
