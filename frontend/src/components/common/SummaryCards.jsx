// Summary cards for payroll totals
export default function SummaryCards({
  totalGross = 0,
  totalDeductions = 0,
  totalNet = 0,
  employeeCount = 0,
}) {
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

  return (
    <div className="pr-summary-grid">
      <div className="pr-summary-card">
        <div className="pr-summary-label">Employees</div>
        <div className="pr-summary-value">{employeeCount}</div>
      </div>
      <div className="pr-summary-card">
        <div className="pr-summary-label">Total Gross Pay</div>
        <div className="pr-summary-value" style={{ color: "#27500A" }}>
          {ci(totalGross)}
        </div>
      </div>
      <div className="pr-summary-card">
        <div className="pr-summary-label">Total Deductions</div>
        <div className="pr-summary-value" style={{ color: "#c0392b" }}>
          {ci(totalDeductions)}
        </div>
      </div>
      <div className="pr-summary-card">
        <div className="pr-summary-label">Total Net Pay</div>
        <div className="pr-summary-value" style={{ color: "#185FA5" }}>
          {ci(totalNet)}
        </div>
      </div>
    </div>
  );
}
