export default function SummaryReportCards({ cards = [] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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
