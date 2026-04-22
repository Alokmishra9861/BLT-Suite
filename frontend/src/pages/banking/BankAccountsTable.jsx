const badgeClasses = {
  checking: "bg-blue-50 text-blue-700",
  savings: "bg-emerald-50 text-emerald-700",
  credit_card: "bg-amber-50 text-amber-700",
  petty_cash: "bg-violet-50 text-violet-700",
  other: "bg-slate-100 text-slate-700",
};

export default function BankAccountsTable({ accounts, formatMoney, onEdit }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-[0.16em] text-slate-500">
              <th className="px-5 py-4">Account</th>
              <th className="px-5 py-4">Bank</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">Statement</th>
              <th className="px-5 py-4">Ledger</th>
              <th className="px-5 py-4">Difference</th>
              <th className="px-5 py-4">Unreconciled</th>
              <th className="px-5 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length ? (
              accounts.map((item) => (
                <tr key={item._id} className="border-t border-slate-100">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.name}
                      </p>
                      <p className="text-sm text-slate-500">{item.currency}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {item.bankName}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        badgeClasses[item.accountType] || badgeClasses.other
                      }`}
                    >
                      {item.accountType}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-700">
                    {formatMoney(item.statementBalance, item.currency)}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-700">
                    {formatMoney(item.ledgerBalance, item.currency)}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-rose-600">
                    {formatMoney(item.difference, item.currency)}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {item.unreconciledCount}
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
                  No bank accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
