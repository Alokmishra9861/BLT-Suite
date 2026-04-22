export default function TrialBalanceTable({ data, formatMoney }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-[0.16em] text-slate-500">
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Account</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-right">Debit</th>
              <th className="px-6 py-4 text-right">Credit</th>
              <th className="px-6 py-4 text-right">Balance</th>
            </tr>
          </thead>

          <tbody>
            {(data.rows || []).map((row) => (
              <tr key={row.accountId} className="border-t border-slate-100">
                <td className="px-6 py-4 text-sm text-slate-700">{row.code}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {row.name}
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">{row.type}</td>
                <td className="px-6 py-4 text-right text-sm text-slate-700">
                  {formatMoney(row.debit)}
                </td>
                <td className="px-6 py-4 text-right text-sm text-slate-700">
                  {formatMoney(row.credit)}
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                  {formatMoney(row.balance)}
                </td>
              </tr>
            ))}

            <tr className="border-t border-slate-200 bg-slate-50">
              <td colSpan="3" className="px-6 py-4 font-bold text-slate-900">
                Totals
              </td>
              <td className="px-6 py-4 text-right font-bold text-slate-900">
                {formatMoney(data.totals?.debit || 0)}
              </td>
              <td className="px-6 py-4 text-right font-bold text-slate-900">
                {formatMoney(data.totals?.credit || 0)}
              </td>
              <td className="px-6 py-4 text-right font-bold text-slate-900">
                {formatMoney(
                  Number(data.totals?.debit || 0) -
                    Number(data.totals?.credit || 0),
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
