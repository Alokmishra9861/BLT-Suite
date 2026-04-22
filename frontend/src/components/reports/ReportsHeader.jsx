export default function ReportsHeader() {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
            Analytics & Reporting
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Reports Center
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            View financial and HR reports powered by real backend data with a
            cleaner, premium reporting experience.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Live
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              Backend Data
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Mode
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              Premium UI
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm col-span-2 sm:col-span-1">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Scope
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              Finance + HR
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
