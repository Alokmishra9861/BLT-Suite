export default function ProfitAndLossTable({ data, formatMoney }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 xl:grid-cols-2">
        <div className="border-b border-slate-200 xl:border-b-0 xl:border-r border-slate-200">
          <div className="bg-slate-50 px-6 py-4">
            <h3 className="text-base font-bold text-slate-900">Income</h3>
          </div>

          <table className="min-w-full">
            <tbody>
              {(data.income || []).map((row) => (
                <tr key={row.accountId} className="border-t border-slate-100">
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {row.code} - {row.name}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                    {formatMoney(row.amount)}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-slate-200 bg-slate-50">
                <td className="px-6 py-4 font-bold text-slate-900">
                  Total Income
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">
                  {formatMoney(data.totals?.totalIncome || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <div className="bg-slate-50 px-6 py-4">
            <h3 className="text-base font-bold text-slate-900">Expenses</h3>
          </div>

          <table className="min-w-full">
            <tbody>
              {(data.expenses || []).map((row) => (
                <tr key={row.accountId} className="border-t border-slate-100">
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {row.code} - {row.name}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                    {formatMoney(row.amount)}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-slate-200 bg-slate-50">
                <td className="px-6 py-4 font-bold text-slate-900">
                  Total Expenses
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">
                  {formatMoney(data.totals?.totalExpenses || 0)}
                </td>
              </tr>
              <tr className="border-t border-slate-900 bg-slate-900">
                <td className="px-6 py-4 font-bold text-white">Net Profit</td>
                <td className="px-6 py-4 text-right font-bold text-white">
                  {formatMoney(data.totals?.netProfit || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
