// src/components/payroll/PayrollLinesTable.jsx
import React from "react";
import Badge from "./Badge";

const ci = (n = 0) => {
  const abs = Math.abs(n);
  const s =
    "CI$ " +
    abs.toLocaleString("en", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  return n < 0 ? `(${s})` : s;
};

const PayrollLinesTable = ({ lines = [], loading = false }) => {
  if (loading) {
    return (
      <div className="pr-loading">
        <div className="pr-spinner" />
        Loading payroll lines…
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="pr-empty">
        <div className="pr-empty-icon">📋</div>
        <div className="pr-empty-text">
          No payroll lines yet. Process the run to generate them.
        </div>
      </div>
    );
  }

  const totGross = lines.reduce((s, l) => s + (l.grossPay || 0), 0);
  const totDed = lines.reduce((s, l) => s + (l.totalDeductions || 0), 0);
  const totNet = lines.reduce((s, l) => s + (l.netPay || 0), 0);

  return (
    <div className="pr-table-wrap">
      <table className="pr-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Type</th>
            <th>Deductions Breakdown</th>
            <th className="right">Gross Pay</th>
            <th className="right">Deductions</th>
            <th className="right">Net Pay</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line._id}>
              <td>
                <div style={{ fontWeight: 700 }}>{line.employeeName}</div>
                {line.employeeId?.title && (
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--muted)",
                      marginTop: 2,
                    }}
                  >
                    {line.employeeId.title}
                  </div>
                )}
              </td>
              <td>
                <Badge value={line.payType} />
              </td>
              <td>
                {(line.deductions || []).map((d, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    {d.name}
                    <span
                      style={{
                        float: "right",
                        marginLeft: 12,
                        color: "var(--text)",
                        fontWeight: 600,
                      }}
                    >
                      {ci(d.amount)}
                    </span>
                  </div>
                ))}
                {!(line.deductions || []).length && (
                  <span style={{ color: "var(--muted)", fontSize: 11 }}>
                    None
                  </span>
                )}
              </td>
              <td className="right pr-ci">{ci(line.grossPay)}</td>
              <td className="right pr-ci pr-text-red">
                {ci(line.totalDeductions)}
              </td>
              <td className="right pr-ci pr-text-green bold">
                {ci(line.netPay)}
              </td>
            </tr>
          ))}
          <tr className="totals-row">
            <td colSpan={3} style={{ color: "var(--gold)" }}>
              Totals
            </td>
            <td className="right">{ci(totGross)}</td>
            <td className="right">{ci(totDed)}</td>
            <td className="right">{ci(totNet)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PayrollLinesTable;
