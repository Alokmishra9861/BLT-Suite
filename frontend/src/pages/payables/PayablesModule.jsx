import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export const PayablesModule = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: "Vendors", path: "/payables/vendors" },
    { name: "Bills", path: "/payables/bills" },
    { name: "Payments", path: "/payables/bill-payments" },
    { name: "Banking", path: "/payables/banking" },
  ];

  return (
    <div className="module-container">
      <div className="module-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`module-tab ${
              location.pathname.startsWith(tab.path) ? "active" : ""
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>
      <div className="module-content">
        <Outlet />
      </div>
    </div>
  );
};
