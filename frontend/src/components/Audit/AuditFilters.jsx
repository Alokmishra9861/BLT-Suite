export default function AuditFilters({ filters, setFilters, onApply }) {
  const updateField = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Module
          </label>
          <select
            value={filters.module}
            onChange={(e) => updateField("module", e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-slate-900"
          >
            <option value="">All Modules</option>
            <option value="accounting">Accounting</option>
            <option value="banking">Banking</option>
            <option value="payables">Payables</option>
            <option value="receivables">Receivables</option>
            <option value="hr">HR</option>
            <option value="payroll">Payroll</option>
            <option value="auth">Auth</option>
            <option value="system">System</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Action
          </label>
          <select
            value={filters.action}
            onChange={(e) => updateField("action", e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-slate-900"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="view">View</option>
            <option value="login">Login</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            From Date
          </label>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => updateField("from", e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            To Date
          </label>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => updateField("to", e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-slate-900"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onApply}
            className="h-12 w-full rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
