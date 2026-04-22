import React, { useEffect, useState } from "react";
import { getAccounts } from "../../services/accounting.service";

const initialForm = {
  account: "",
  name: "",
  bankName: "",
  accountType: "checking",
  currency: "CI$",
  statementBalance: "",
  ledgerBalance: "",
  notes: "",
};

export default function BankAccountModal({
  open,
  onClose,
  onSubmit,
  initialData,
}) {
  const [form, setForm] = useState(initialForm);
  const [glAccounts, setGlAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  useEffect(() => {
    const fetchGlAccounts = async () => {
      try {
        setLoadingAccounts(true);
        const res = await getAccounts({ type: "Asset" });
        setGlAccounts(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch GL accounts:", err);
      } finally {
        setLoadingAccounts(false);
      }
    };

    if (open) {
      fetchGlAccounts();
    }
  }, [open]);

  useEffect(() => {
    if (initialData) {
      setForm({
        account: initialData.account?._id || initialData.account || "",
        name: initialData.name || "",
        bankName: initialData.bankName || "",
        accountType: initialData.accountType || "checking",
        currency: initialData.currency || "CI$",
        statementBalance: initialData.statementBalance ?? "",
        ledgerBalance: initialData.ledgerBalance ?? "",
        notes: initialData.notes || "",
      });
    } else {
      setForm(initialForm);
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.account) {
      alert("Please select a GL account.");
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-bold text-slate-900">
            {initialData ? "Edit Bank Account" : "New Bank Account"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">
                Linked GL Account *
              </span>
              <select
                name="account"
                value={form.account}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              >
                <option value="">Select GL Account (e.g. Cash at Bank)</option>
                {glAccounts.map((acct) => (
                  <option key={acct._id} value={acct._id}>
                    {acct.code} - {acct.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Display Name *
              </span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Scotiabank Operating"
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Bank Name
              </span>
              <input
                name="bankName"
                value={form.bankName}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Account Type
              </span>
              <select
                name="accountType"
                value={form.accountType}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit_card">Credit Card</option>
                <option value="petty_cash">Petty Cash</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Currency
              </span>
              <input
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Statement Balance
              </span>
              <input
                type="number"
                name="statementBalance"
                value={form.statementBalance}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Ledger Balance
              </span>
              <input
                type="number"
                name="ledgerBalance"
                value={form.ledgerBalance}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Notes
              </span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={1}
                className="h-11 w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-slate-900"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-6 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {initialData ? "Save Changes" : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
