export default function AuditHeader({ viewMode, setViewMode }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
            Security & Monitoring
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Audit Center
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Review activity logs across accounting, banking, HR, payroll, and
            system modules.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              viewMode === "table"
                ? "bg-slate-900 text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            Table View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("timeline")}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              viewMode === "timeline"
                ? "bg-slate-900 text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            Timeline View
          </button>
        </div>
      </div>
    </div>
  );
}
