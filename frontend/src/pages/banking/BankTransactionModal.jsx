import { useEffect, useState } from "react";

const initialForm = {
  bankAccountId: "",
  transactionDate: "",
  description: "",
  direction: "inflow",
  amount: "",
  referenceNo: "",
  matchStatus: "unmatched",
  status: "posted",
};

export default function BankTransactionModal({
  open,
  onClose,
  onSubmit,
  initialData,
  accounts,
}) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        bankAccountId: initialData.bankAccountId || "",
        transactionDate: initialData.transactionDate
          ? new Date(initialData.transactionDate).toISOString().slice(0, 10)
          : "",
        description: initialData.description || "",
        direction: initialData.direction || "inflow",
        amount: initialData.amount ?? "",
        referenceNo: initialData.referenceNo || "",
        matchStatus: initialData.matchStatus || "unmatched",
        status: initialData.status || "posted",
      });
    } else {
      setForm({
        ...initialForm,
        bankAccountId: accounts[0]?._id || "",
      });
    }
  }, [initialData, open, accounts]);

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
            {initialData ? "Edit Bank Transaction" : "New Bank Transaction"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
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
                Transaction Date
              </span>
              <input
                type="date"
                name="transactionDate"
                value={form.transactionDate}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">
                Description
              </span>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Direction
              </span>
              <select
                name="direction"
                value={form.direction}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              >
                <option value="inflow">Inflow</option>
                <option value="outflow">Outflow</option>
                <option value="transfer">Transfer</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Amount
              </span>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Reference No
              </span>
              <input
                name="referenceNo"
                value={form.referenceNo}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Match Status
              </span>
              <select
                name="matchStatus"
                value={form.matchStatus}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              >
                <option value="unmatched">Unmatched</option>
                <option value="partially_matched">Partially Matched</option>
                <option value="matched">Matched</option>
                <option value="reconciled">Reconciled</option>
              </select>
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
              {initialData ? "Update Transaction" : "Create Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
