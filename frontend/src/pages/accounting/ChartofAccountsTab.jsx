import { useState, useEffect, useCallback } from "react";
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from "../../services/accounting.service";

const TYPE_COLORS = {
  Asset: "pill-asset",
  Liability: "pill-liability",
  Equity: "pill-equity",
  Income: "pill-income",
  Expense: "pill-expense",
};

const EMPTY_FORM = {
  code: "",
  name: "",
  type: "Asset",
  subType: "",
  description: "",
};

export default function ChartOfAccountsTab() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      const res = await getAccounts(params);
      setAccounts(res.data.data || []);
    } catch (err) {
      setError("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const openCreate = () => {
    setEditingAccount(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (acct) => {
    setEditingAccount(acct);
    setForm({
      code: acct.code,
      name: acct.name,
      type: acct.type,
      subType: acct.subType || "",
      description: acct.description || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) return;
    setSaving(true);
    try {
      if (editingAccount) {
        await updateAccount(editingAccount._id, form);
      } else {
        await createAccount(form);
      }
      setShowModal(false);
      fetchAccounts();
    } catch (err) {
      alert(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (acct) => {
    if (!window.confirm(`Deactivate account ${acct.code} — ${acct.name}?`))
      return;
    try {
      await updateAccount(acct._id, { isActive: false });
      fetchAccounts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to deactivate");
    }
  };

  // Summary totals by type
  const totals = ["Asset", "Liability", "Equity", "Income", "Expense"].map(
    (t) => ({
      type: t,
      count: accounts.filter((a) => a.type === t).length,
    }),
  );

  const grouped = ["Asset", "Liability", "Equity", "Income", "Expense"].reduce(
    (acc, t) => {
      const filtered = accounts.filter((a) => a.type === t);
      if (filtered.length) acc[t] = filtered;
      return acc;
    },
    {},
  );

  return (
    <div>
      {/* Header */}
      <div className="accounting-section-header">
        <div>
          <h2 className="accounting-section-title">Chart of Accounts</h2>
          <p className="accounting-section-subtitle">
            {accounts.length} accounts
          </p>
        </div>
        <div className="accounting-toolbar">
          <input
            className="accounting-input"
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="accounting-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {["Asset", "Liability", "Equity", "Income", "Expense"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <button
            onClick={openCreate}
            className="accounting-btn accounting-btn-primary"
          >
            + New Account
          </button>
        </div>
      </div>

      {/* Type summary bar */}
      <div className="accounting-summary-grid">
        {totals.map(({ type, count }) => (
          <div
            key={type}
            onClick={() => setTypeFilter(typeFilter === type ? "" : type)}
            className={`accounting-summary-card ${
              typeFilter === type ? "is-active" : ""
            }`}
          >
            <div className="accounting-summary-label">{type}s</div>
            <div className="accounting-summary-value">{count}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="accounting-panel accounting-empty">
          Loading accounts...
        </div>
      ) : error ? (
        <div className="accounting-alert is-error">{error}</div>
      ) : (
        <div className="accounting-panel">
          <table className="accounting-table">
            <thead>
              <tr className="accounting-table-head">
                <th className="is-code">Code</th>
                <th>Account Name</th>
                <th>Type</th>
                <th>Sub-Type</th>
                <th className="is-center is-small">Status</th>
                <th className="is-right is-small">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([type, accts]) => (
                <>
                  <tr key={`group-${type}`} className="accounting-group-row">
                    <td colSpan={6}>{type}s</td>
                  </tr>
                  {accts.map((a) => (
                    <tr key={a._id} className="accounting-row">
                      <td className="is-code">{a.code}</td>
                      <td className="is-strong">{a.name}</td>
                      <td>
                        <span
                          className={`accounting-pill ${TYPE_COLORS[a.type]}`}
                        >
                          {a.type}
                        </span>
                      </td>
                      <td className="is-muted">{a.subType}</td>
                      <td className="is-center">
                        <span
                          className={`accounting-status-dot ${
                            a.isActive ? "is-active" : "is-inactive"
                          }`}
                          title={a.isActive ? "Active" : "Inactive"}
                        />
                      </td>
                      <td className="is-right">
                        <button
                          onClick={() => openEdit(a)}
                          className="accounting-link"
                        >
                          Edit
                        </button>
                        {a.isActive && (
                          <button
                            onClick={() => handleDeactivate(a)}
                            className="accounting-link is-danger"
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={6} className="accounting-empty">
                    No accounts found. Run the seed or create your first
                    account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="accounting-modal-backdrop">
          <div className="accounting-modal">
            <div className="accounting-modal-header">
              <span className="accounting-modal-title">
                {editingAccount ? "Edit Account" : "New Account"}
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="accounting-modal-close"
              >
                ×
              </button>
            </div>
            <div className="accounting-modal-body">
              <div className="accounting-form-grid">
                <div>
                  <label className="accounting-label">Account Code *</label>
                  <input
                    className="accounting-input"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g. 1010"
                  />
                </div>
                <div>
                  <label className="accounting-label">Type *</label>
                  <select
                    className="accounting-select"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    {["Asset", "Liability", "Equity", "Income", "Expense"].map(
                      (t) => (
                        <option key={t}>{t}</option>
                      ),
                    )}
                  </select>
                </div>
              </div>
              <div>
                <label className="accounting-label">Account Name *</label>
                <input
                  className="accounting-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Account name"
                />
              </div>
              <div>
                <label className="accounting-label">Sub-Type</label>
                <input
                  className="accounting-input"
                  value={form.subType}
                  onChange={(e) =>
                    setForm({ ...form, subType: e.target.value })
                  }
                  placeholder="e.g. Current Asset"
                />
              </div>
              <div>
                <label className="accounting-label">Description</label>
                <input
                  className="accounting-input"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="accounting-modal-footer">
              <button
                onClick={() => setShowModal(false)}
                className="accounting-btn accounting-btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.code.trim() || !form.name.trim()}
                className="accounting-btn accounting-btn-primary"
              >
                {saving
                  ? "Saving..."
                  : editingAccount
                    ? "Update Account"
                    : "Save Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
