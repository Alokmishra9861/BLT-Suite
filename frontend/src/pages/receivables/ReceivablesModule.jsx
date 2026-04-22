import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export const ReceivablesModule = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: "Customers", path: "/receivables/customers" },
    { name: "Invoices", path: "/receivables/invoices" },
    { name: "Payments", path: "/receivables/invoice-payments" },
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
