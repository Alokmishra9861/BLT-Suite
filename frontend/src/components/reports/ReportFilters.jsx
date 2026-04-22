export default function ReportFilters({
  reportCategory,
  financialReportType,
  setFinancialReportType,
  hrReportType,
  setHrReportType,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  onLoad,
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            {reportCategory === "financial" ? "Financial Report" : "HR Report"}
          </label>

          {reportCategory === "financial" ? (
            <select
              value={financialReportType}
              onChange={(e) => setFinancialReportType(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-900"
            >
              <option value="profit-loss">Profit & Loss</option>
              <option value="balance-sheet">Balance Sheet</option>
              <option value="cash-flow">Cash Flow</option>
              <option value="trial-balance">Trial Balance</option>
            </select>
          ) : (
            <select
              value={hrReportType}
              onChange={(e) => setHrReportType(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-900"
            >
              <option value="hr-summary">HR Summary</option>
            </select>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-900"
          />
        </div>

        <div className="lg:col-span-2 flex items-end">
          <button
            type="button"
            onClick={onLoad}
            className="h-12 rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Load Report
          </button>
        </div>
      </div>
    </div>
  );
}
