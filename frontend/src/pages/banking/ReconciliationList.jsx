const statusClasses = {
  draft: "bg-slate-100 text-slate-700",
  in_progress: "bg-amber-50 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
  locked: "bg-rose-50 text-rose-700",
};

export default function ReconciliationList({ reconciliations, formatMoney }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {reconciliations.length ? (
        reconciliations.map((item) => (
          <div
            key={item._id}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {item.bankAccount?.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Statement Date:{" "}
                  {new Date(item.statementDate).toLocaleDateString()}
                </p>
              </div>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  statusClasses[item.status]
                }`}
              >
                {item.status}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Period
                </p>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  {new Date(item.periodStart).toLocaleDateString()} -{" "}
                  {new Date(item.periodEnd).toLocaleDateString()}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Difference
                </p>
                <p className="mt-2 text-sm font-bold text-rose-600">
                  {formatMoney(
                    item.differenceAmount,
                    item.bankAccount?.currency || "CI$",
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Closing Balance
                </p>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  {formatMoney(
                    item.closingBalance,
                    item.bankAccount?.currency || "CI$",
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Ledger Balance
                </p>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  {formatMoney(
                    item.ledgerBalanceAtEnd,
                    item.bankAccount?.currency || "CI$",
                  )}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          No reconciliations found.
        </div>
      )}
    </div>
  );
}
