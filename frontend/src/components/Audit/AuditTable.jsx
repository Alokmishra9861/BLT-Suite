const actionClasses = {
  create: "bg-emerald-50 text-emerald-700",
  update: "bg-amber-50 text-amber-700",
  delete: "bg-rose-50 text-rose-700",
  view: "bg-blue-50 text-blue-700",
  login: "bg-violet-50 text-violet-700",
};

const moduleClasses = {
  accounting: "bg-slate-100 text-slate-700",
  banking: "bg-cyan-50 text-cyan-700",
  payables: "bg-orange-50 text-orange-700",
  receivables: "bg-indigo-50 text-indigo-700",
  hr: "bg-pink-50 text-pink-700",
  payroll: "bg-emerald-50 text-emerald-700",
  auth: "bg-violet-50 text-violet-700",
  system: "bg-slate-100 text-slate-700",
};

export default function AuditTable({ logs, loading, onViewDetails }) {
  if (loading) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
        Loading audit logs...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-[0.16em] text-slate-500">
              <th className="px-5 py-4">User</th>
              <th className="px-5 py-4">Module</th>
              <th className="px-5 py-4">Action</th>
              <th className="px-5 py-4">Resource</th>
              <th className="px-5 py-4">Description</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Details</th>
            </tr>
          </thead>

          <tbody>
            {logs.length ? (
              logs.map((log) => (
                <tr key={log._id} className="border-t border-slate-100">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {log.userName || "Unknown"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {log.user?.email || "No email"}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        moduleClasses[log.module] ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {log.module}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        actionClasses[log.action] ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-slate-900">
                    {log.resource}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {log.description}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => onViewDetails(log)}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
