export default function HRReportTable({ data }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-6 py-4">
        <h3 className="text-base font-bold text-slate-900">Employee Summary</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-white">
            <tr className="text-left text-xs uppercase tracking-[0.16em] text-slate-500">
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {(data.employees || []).length ? (
              data.employees.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {row.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {row.department}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {row.title}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        String(row.status).toLowerCase() === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-10 text-center text-sm text-slate-500"
                >
                  No employee report data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
