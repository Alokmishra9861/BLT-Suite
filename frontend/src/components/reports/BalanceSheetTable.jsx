function SectionCard({ title, rows, total, formatMoney }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-6 py-4">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
      </div>

      <table className="min-w-full">
        <tbody>
          {(rows || []).map((row) => (
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
              Total {title}
            </td>
            <td className="px-6 py-4 text-right font-bold text-slate-900">
              {formatMoney(total)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function BalanceSheetTable({ data, formatMoney }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <SectionCard
        title="Assets"
        rows={data.assets}
        total={data.totals?.totalAssets || 0}
        formatMoney={formatMoney}
      />
      <SectionCard
        title="Liabilities"
        rows={data.liabilities}
        total={data.totals?.totalLiabilities || 0}
        formatMoney={formatMoney}
      />
      <SectionCard
        title="Equity"
        rows={data.equity}
        total={data.totals?.totalEquity || 0}
        formatMoney={formatMoney}
      />
    </div>
  );
}
