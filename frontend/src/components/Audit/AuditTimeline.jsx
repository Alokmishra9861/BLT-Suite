const actionClasses = {
  create: "bg-emerald-500",
  update: "bg-amber-500",
  delete: "bg-rose-500",
  view: "bg-blue-500",
  login: "bg-violet-500",
};

export default function AuditTimeline({ logs, loading, onViewDetails }) {
  if (loading) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
        Loading timeline...
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-6">
        {logs.length ? (
          logs.map((log, index) => (
            <div key={log._id} className="relative pl-10">
              {index !== logs.length - 1 && (
                <span className="absolute left-[11px] top-8 h-full w-px bg-slate-200" />
              )}

              <span
                className={`absolute left-0 top-1 h-6 w-6 rounded-full ${
                  actionClasses[log.action] || "bg-slate-400"
                } ring-4 ring-white`}
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {log.userName} · {log.action} · {log.resource}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {log.description}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">
                      {log.module}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-2 lg:items-end">
                    <p className="text-sm text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                    <button
                      type="button"
                      onClick={() => onViewDetails(log)}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-sm text-slate-500">
            No audit timeline data found.
          </div>
        )}
      </div>
    </div>
  );
}
