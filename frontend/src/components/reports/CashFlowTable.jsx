export default function CashFlowTable({ data, formatMoney }) {
  const rows = [
    { label: "Operating Activities", value: data.operating || 0 },
    { label: "Investing Activities", value: data.investing || 0 },
    { label: "Financing Activities", value: data.financing || 0 },
    {
      label: "Net Cash Movement",
      value: data.netCashMovement || 0,
      strong: true,
    },
  ];

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <table className="min-w-full">
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className={
                row.strong
                  ? "bg-slate-900 text-white"
                  : "border-t border-slate-100"
              }
            >
              <td className="px-6 py-4 text-sm font-medium">{row.label}</td>
              <td className="px-6 py-4 text-right text-sm font-semibold">
                {formatMoney(row.value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
