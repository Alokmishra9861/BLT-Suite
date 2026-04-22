export default function AuditSummaryCards({ logs }) {
  const total = logs.length;
  const creates = logs.filter((l) => l.action === "create").length;
  const updates = logs.filter((l) => l.action === "update").length;
  const deletes = logs.filter((l) => l.action === "delete").length;

  const cards = [
    { label: "Total Logs", value: total },
    { label: "Created", value: creates },
    { label: "Updated", value: updates },
    { label: "Deleted", value: deletes },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border p-4 bg-white shadow">
          <p className="text-xs text-slate-400">{c.label}</p>
          <h3 className="text-xl font-bold">{c.value}</h3>
        </div>
      ))}
    </div>
  );
}
