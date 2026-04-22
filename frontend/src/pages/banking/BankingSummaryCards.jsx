export default function BankingSummaryCards({ summary, formatMoney }) {
  const cards = [
    {
      label: "Bank Accounts",
      value: summary.totalAccounts,
      subtext: "Active banking records",
    },
    {
      label: "Statement Balance",
      value: formatMoney(summary.totalStatement),
      subtext: "Total across bank accounts",
    },
    {
      label: "Ledger Balance",
      value: formatMoney(summary.totalLedger),
      subtext: "Derived from accounting journals",
    },
    {
      label: "Unreconciled Items",
      value: summary.unreconciledCount,
      subtext: `Difference ${formatMoney(summary.totalDifference)}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            {card.label}
          </p>
          <h3 className="mt-3 text-2xl font-bold text-slate-900">
            {card.value}
          </h3>
          <p className="mt-2 text-sm text-slate-500">{card.subtext}</p>
        </div>
      ))}
    </div>
  );
}
