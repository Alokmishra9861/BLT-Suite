export default function AuditDetailsModal({ open, log, onClose }) {
  if (!open || !log) return null;

  const pretty = (value) => {
    if (!value) return "No data";
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "Unable to render data";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-5xl rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Audit Log Details
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {log.userName} · {log.module} · {log.action} · {log.resource}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
              Before
            </h3>
            <pre className="max-h-[420px] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
              {pretty(log.before)}
            </pre>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
              After
            </h3>
            <pre className="max-h-[420px] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
              {pretty(log.after)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
