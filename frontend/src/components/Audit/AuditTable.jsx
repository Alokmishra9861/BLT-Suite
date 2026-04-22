export default function AuditTable({ logs, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Loading audit logs...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-[0.16em] text-slate-500">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {logs.length ? (
              logs.map((log) => (
                <tr key={log._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {log.userName}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {log.module}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {log.resource}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {log.description}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-8 text-center text-sm text-slate-500"
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
