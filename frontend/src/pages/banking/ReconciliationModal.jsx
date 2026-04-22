import { useEffect, useState } from "react";

const initialForm = {
  bankAccountId: "",
  statementDate: "",
  periodStart: "",
  periodEnd: "",
  openingBalance: "",
  closingBalance: "",
  ledgerBalanceAtEnd: "",
  status: "draft",
};

export default function ReconciliationModal({
  open,
  onClose,
  onSubmit,
  accounts,
}) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (open) {
      setForm({
        ...initialForm,
        bankAccountId: accounts[0]?._id || "",
      });
    }
  }, [open, accounts]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.bankAccountId) {
      alert("Please select a bank account.");
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-bold text-slate-900">
            New Reconciliation
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">
                Bank Account
              </span>
              <select
                name="bankAccountId"
                value={form.bankAccountId}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              >
                <option value="">Select account</option>
                {accounts.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Statement Date
              </span>
              <input
                type="date"
                name="statementDate"
                value={form.statementDate}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Status
              </span>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              >
                <option value="draft">Draft</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Period Start
              </span>
              <input
                type="date"
                name="periodStart"
                value={form.periodStart}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Period End
              </span>
              <input
                type="date"
                name="periodEnd"
                value={form.periodEnd}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Opening Balance
              </span>
              <input
                type="number"
                name="openingBalance"
                value={form.openingBalance}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Closing Balance
              </span>
              <input
                type="number"
                name="closingBalance"
                value={form.closingBalance}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">
                Ledger Balance At End
              </span>
              <input
                type="number"
                name="ledgerBalanceAtEnd"
                value={form.ledgerBalanceAtEnd}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white hover:opacity-90"
            >
              Create Reconciliation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
