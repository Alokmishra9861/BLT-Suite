// src/pages/payroll/PayrollModule.jsx
//
// Drop this into your existing React router or sidebar nav as the "Payroll" section entry.
// It manages internal sub-navigation: Pay Runs | Deduction Types | Employee Deductions | Run Detail
//
// Usage in your existing app:
//   import PayrollModule from './pages/payroll/PayrollModule';
//   // In your router/page switcher:
//   case 'payroll': return <PayrollModule activeEntity={activeEntity} />;

import React, { useState } from "react";
import PayrollRunsPage from "./PayrollRunsPage";
import PayrollRunDetail from "./PayrollRunDetail";
import DeductionTypesPage from "./DeductionTypesPage";
import EmployeeDeductionsPage from "./EmployeeDeductionsPage";
import "../../styles/Payroll.css";

const TABS = [
  { key: "runs", label: "Pay Runs" },
  { key: "dedtypes", label: "Deduction Types" },
  { key: "empded", label: "Employee Deductions" },
];

export default function PayrollModule({ activeEntity }) {
  const [activeTab, setActiveTab] = useState("runs");
  const [detailRunId, setDetailRunId] = useState(null);

  // When a run is clicked for detail view
  const openDetail = (runId) => {
    setDetailRunId(runId);
  };
  const closeDetail = () => {
    setDetailRunId(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* ── Sub-tabs ── */}
      {!detailRunId && (
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border)",
            background: "var(--white)",
            padding: "0 24px",
            flexShrink: 0,
          }}
        >
          {TABS.map((t) => (
            <div
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: "10px 16px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                color: activeTab === t.key ? "var(--navy)" : "var(--muted)",
                borderBottom:
                  activeTab === t.key
                    ? "2px solid var(--gold)"
                    : "2px solid transparent",
                marginBottom: -1,
                transition: "all 0.15s",
                fontFamily: "'Lato', sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {t.label}
            </div>
          ))}
        </div>
      )}

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {detailRunId ? (
          <PayrollRunDetail runId={detailRunId} onBack={closeDetail} />
        ) : activeTab === "runs" ? (
          <PayrollRunsPage
            activeEntity={activeEntity}
            onOpenDetail={openDetail}
          />
        ) : activeTab === "dedtypes" ? (
          <DeductionTypesPage activeEntity={activeEntity} />
        ) : (
          <EmployeeDeductionsPage activeEntity={activeEntity} />
        )}
      </div>
    </div>
  );
}
