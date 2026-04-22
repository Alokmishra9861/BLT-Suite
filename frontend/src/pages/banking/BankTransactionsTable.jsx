const directionClasses = {
  inflow: "bg-emerald-50 text-emerald-700",
  outflow: "bg-rose-50 text-rose-700",
  transfer: "bg-blue-50 text-blue-700",
};

const matchClasses = {
  unmatched: "bg-slate-100 text-slate-700",
  partially_matched: "bg-amber-50 text-amber-700",
  matched: "bg-blue-50 text-blue-700",
  reconciled: "bg-emerald-50 text-emerald-700",
};

export default function BankTransactionsTable({
  transactions,
  formatMoney,
  onEdit,
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-[0.16em] text-slate-500">
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Description</th>
              <th className="px-5 py-4">Account</th>
              <th className="px-5 py-4">Direction</th>
              <th className="px-5 py-4">Amount</th>
              <th className="px-5 py-4">Reference</th>
              <th className="px-5 py-4">Match</th>
              <th className="px-5 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length ? (
              transactions.map((item) => (
                <tr key={item._id} className="border-t border-slate-100">
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {new Date(item.transactionDate).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {item.description}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.status}{" "}
                      {item.isReconciled ? "• reconciled" : "• open"}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {item.bankAccount?.name}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        directionClasses[item.direction]
                      }`}
                    >
                      {item.direction}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                    {formatMoney(
                      item.amount,
                      item.bankAccount?.currency || "CI$",
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {item.referenceNo || "-"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        matchClasses[item.matchStatus]
                      }`}
                    >
                      {item.matchStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  No bank transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
