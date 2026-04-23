export default function AuditSummaryCards({ summary }) {
  const cards = [
    {
      label: "Total Logs",
      value: summary.total,
      subtext: "All tracked events",
    },
    {
      label: "Creates",
      value: summary.creates,
      subtext: "New records created",
    },
    {
      label: "Updates",
      value: summary.updates,
      subtext: "Records modified",
    },
    {
      label: "Deletes",
      value: summary.deletes,
      subtext: "Removed or deactivated",
    },
    {
      label: "Views",
      value: summary.views,
      subtext: "Read-only access events",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
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
