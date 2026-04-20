import { useState, useEffect, useCallback } from "react";
import {
  getJournals,
  getJournal,
  createJournal,
  postJournal,
  reverseJournal,
  voidJournal,
  getAccounts,
} from "../../services/accounting.service";

const STATUS_COLORS = {
  draft: "status-draft",
  pending: "status-pending",
  posted: "status-posted",
  voided: "status-voided",
  reversed: "status-reversed",
};

const SOURCE_LABELS = {
  manual: "Manual",
  payroll: "Payroll",
  ar: "AR",
  ap: "AP",
  banking: "Banking",
  system: "System",
};

const EMPTY_LINE = { accountId: "", description: "", debit: "", credit: "" };

function formatCI(amount) {
  if (!amount && amount !== 0) return "—";
  return `CI$ ${parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function JournalsTab() {
  const [journals, setJournals] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", search: "" });
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    reference: "",
  });
  const [lines, setLines] = useState([{ ...EMPTY_LINE }, { ...EMPTY_LINE }]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchJournals = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      const res = await getJournals(params);
      const d = res.data.data;
      setJournals(d.journals || []);
      setTotal(d.total || 0);
    } catch {
      setJournals([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  const openDetail = async (j) => {
    if (selectedJournal?._id === j._id) {
      setSelectedJournal(null);
      return;
    }
    setDetailLoading(true);
    try {
      const res = await getJournal(j._id);
      setSelectedJournal(res.data.data);
    } catch {
      setSelectedJournal(j);
    } finally {
      setDetailLoading(false);
    }
  };

  const openCreate = async () => {
    if (!accounts.length) {
      const res = await getAccounts({ isActive: true });
      setAccounts(res.data.data || []);
    }
    setForm({
      date: new Date().toISOString().split("T")[0],
      description: "",
      reference: "",
    });
    setLines([{ ...EMPTY_LINE }, { ...EMPTY_LINE }]);
    setFormError("");
    setShowCreate(true);
  };

  const addLine = () => setLines([...lines, { ...EMPTY_LINE }]);
  const removeLine = (i) => setLines(lines.filter((_, idx) => idx !== i));
  const updateLine = (i, field, val) => {
    const updated = [...lines];
    updated[i] = { ...updated[i], [field]: val };
    setShowCreate(true);
    setLines(updated);
  };

  const lineDebits = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const lineCredits = lines.reduce(
    (s, l) => s + (parseFloat(l.credit) || 0),
    0,
  );
  const isBalanced = Math.abs(lineDebits - lineCredits) < 0.005;

  const handleCreate = async () => {
    if (!form.description.trim()) {
      setFormError("Description is required");
      return;
    }
    if (lines.length < 2) {
      setFormError("At least 2 lines required");
      return;
    }
    const payload = {
      date: form.date,
      description: form.description,
      reference: form.reference,
      lines: lines
        .filter((l) => l.accountId)
        .map((l) => ({
          accountId: l.accountId,
          description: l.description,
          debit: parseFloat(l.debit) || 0,
          credit: parseFloat(l.credit) || 0,
        })),
    };
    if (payload.lines.length < 2) {
      setFormError("At least 2 complete lines required");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await createJournal(payload);
      setShowCreate(false);
      fetchJournals();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create journal");
    } finally {
      setSaving(false);
    }
  };

  const handlePost = async (j) => {
    if (
      !window.confirm(
        `Post journal ${j.journalNumber}? This cannot be undone (use reversal to undo).`,
      )
    )
      return;
    try {
      await postJournal(j._id);
      fetchJournals();
      setSelectedJournal(null);
    } catch (err) {
      alert(err.response?.data?.message || "Post failed");
    }
  };

  const handleReverse = async (j) => {
    const desc = window.prompt(
      `Enter description for reversal entry:`,
      `Reversal of ${j.journalNumber}`,
    );
    if (desc === null) return;
    try {
      await reverseJournal(j._id, {
        description: desc,
        date: new Date().toISOString().split("T")[0],
      });
      fetchJournals();
      setSelectedJournal(null);
      alert("Reversal journal created and posted successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "Reversal failed");
    }
  };

  const handleVoid = async (j) => {
    if (
      !window.confirm(`Void journal ${j.journalNumber}? This cannot be undone.`)
    )
      return;
    try {
      await voidJournal(j._id);
      fetchJournals();
      setSelectedJournal(null);
    } catch (err) {
      alert(err.response?.data?.message || "Void failed");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="accounting-section-header">
        <div>
          <h2 className="accounting-section-title">Journal Entries</h2>
          <p className="accounting-section-subtitle">{total} total entries</p>
        </div>
        <div className="accounting-toolbar">
          <input
            className="accounting-input"
            placeholder="Search journals..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="accounting-select"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {["draft", "pending", "posted", "voided", "reversed"].map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={openCreate}
            className="accounting-btn accounting-btn-primary"
          >
            + New Journal
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="accounting-panel accounting-empty">
          Loading journals...
        </div>
      ) : (
        <div className="accounting-panel">
          <table className="accounting-table">
            <thead>
              <tr className="accounting-table-head">
                <th className="is-code">Number</th>
                <th className="is-date">Date</th>
                <th>Description</th>
                <th className="is-small">Source</th>
                <th className="is-right is-small">Debits</th>
                <th className="is-center is-small">Lines</th>
                <th className="is-center is-small">Status</th>
                <th className="is-right is-small">Actions</th>
              </tr>
            </thead>
            <tbody>
              {journals.map((j) => (
                <>
                  <tr
                    key={j._id}
                    onClick={() => openDetail(j)}
                    className="accounting-row is-clickable"
                  >
                    <td className="is-code is-strong">{j.journalNumber}</td>
                    <td className="is-muted">{formatDate(j.date)}</td>
                    <td className="is-strong is-truncate">{j.description}</td>
                    <td className="is-muted">
                      {SOURCE_LABELS[j.source] || j.source}
                    </td>
                    <td className="is-right is-mono">
                      {formatCI(j.totalDebits)}
                    </td>
                    <td className="is-center is-muted">{j.lineCount}</td>
                    <td className="is-center">
                      <span
                        className={`accounting-badge ${STATUS_COLORS[j.status]}`}
                      >
                        {j.status}
                      </span>
                    </td>
                    <td
                      className="is-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="accounting-action-group">
                        {j.status === "draft" && (
                          <button
                            onClick={() => handlePost(j)}
                            className="accounting-btn accounting-btn-compact is-success"
                          >
                            Post
                          </button>
                        )}
                        {j.status === "posted" && !j.reversedBy && (
                          <button
                            onClick={() => handleReverse(j)}
                            className="accounting-btn accounting-btn-compact is-royal"
                          >
                            Reverse
                          </button>
                        )}
                        {["draft", "pending"].includes(j.status) && (
                          <button
                            onClick={() => handleVoid(j)}
                            className="accounting-btn accounting-btn-compact is-danger"
                          >
                            Void
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Inline detail row */}
                  {selectedJournal?._id === j._id && (
                    <tr key={`detail-${j._id}`}>
                      <td colSpan={8} className="accounting-detail">
                        {detailLoading ? (
                          <div className="accounting-empty">
                            Loading lines...
                          </div>
                        ) : (
                          <div>
                            <div className="accounting-detail-meta">
                              <span>
                                Period:{" "}
                                <strong>{selectedJournal.period}</strong>
                              </span>
                              <span>
                                Ref:{" "}
                                <strong>
                                  {selectedJournal.reference || "—"}
                                </strong>
                              </span>
                              {selectedJournal.postedAt && (
                                <span>
                                  Posted:{" "}
                                  <strong>
                                    {formatDate(selectedJournal.postedAt)}
                                  </strong>
                                </span>
                              )}
                            </div>
                            <table className="accounting-table is-compact">
                              <thead>
                                <tr className="accounting-table-subhead">
                                  <th>Account</th>
                                  <th>Description</th>
                                  <th className="is-right">Debit</th>
                                  <th className="is-right">Credit</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(selectedJournal.lines || []).map((l, i) => (
                                  <tr key={i} className="accounting-row">
                                    <td>
                                      <span className="accounting-code">
                                        {l.accountCode}
                                      </span>
                                      {l.accountName}
                                    </td>
                                    <td className="is-muted">
                                      {l.description}
                                    </td>
                                    <td className="is-right is-mono">
                                      {l.debit > 0 ? formatCI(l.debit) : ""}
                                    </td>
                                    <td className="is-right is-mono">
                                      {l.credit > 0 ? formatCI(l.credit) : ""}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="accounting-total-row">
                                  <td colSpan={2} className="is-right is-muted">
                                    Totals
                                  </td>
                                  <td className="is-right is-mono">
                                    {formatCI(selectedJournal.totalDebits)}
                                  </td>
                                  <td className="is-right is-mono">
                                    {formatCI(selectedJournal.totalCredits)}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {journals.length === 0 && (
                <tr>
                  <td colSpan={8} className="accounting-empty">
                    No journal entries yet. Create your first entry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Journal Modal */}
      {showCreate && (
        <div className="accounting-modal-backdrop">
          <div className="accounting-modal is-large">
            <div className="accounting-modal-header">
              <span className="accounting-modal-title">New Journal Entry</span>
              <button
                onClick={() => setShowCreate(false)}
                className="accounting-modal-close"
              >
                ×
              </button>
            </div>
            <div className="accounting-modal-body">
              {/* Header fields */}
              <div className="accounting-form-grid is-three">
                <div>
                  <label className="accounting-label">Date *</label>
                  <input
                    type="date"
                    className="accounting-input"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="accounting-span-2">
                  <label className="accounting-label">Description *</label>
                  <input
                    className="accounting-input"
                    placeholder="Journal description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="accounting-label">Reference</label>
                  <input
                    className="accounting-input"
                    placeholder="e.g. INV-0001"
                    value={form.reference}
                    onChange={(e) =>
                      setForm({ ...form, reference: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Lines */}
              <div>
                <div className="accounting-lines-title">Journal Lines</div>
                <table className="accounting-table is-compact">
                  <thead>
                    <tr className="accounting-table-subhead">
                      <th>Account</th>
                      <th>Description</th>
                      <th className="is-right">Debit (CI$)</th>
                      <th className="is-right">Credit (CI$)</th>
                      <th className="is-small"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, i) => (
                      <tr key={i} className="accounting-row">
                        <td>
                          <select
                            className="accounting-select"
                            value={line.accountId}
                            onChange={(e) =>
                              updateLine(i, "accountId", e.target.value)
                            }
                          >
                            <option value="">— Select account —</option>
                            {[
                              "Asset",
                              "Liability",
                              "Equity",
                              "Income",
                              "Expense",
                            ].map((t) => {
                              const group = accounts.filter(
                                (a) => a.type === t,
                              );
                              if (!group.length) return null;
                              return (
                                <optgroup key={t} label={t + "s"}>
                                  {group.map((a) => (
                                    <option key={a._id} value={a._id}>
                                      {a.code} — {a.name}
                                    </option>
                                  ))}
                                </optgroup>
                              );
                            })}
                          </select>
                        </td>
                        <td>
                          <input
                            className="accounting-input"
                            placeholder="Line description"
                            value={line.description}
                            onChange={(e) =>
                              updateLine(i, "description", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="accounting-input is-number"
                            placeholder="0.00"
                            value={line.debit}
                            onChange={(e) =>
                              updateLine(i, "debit", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="accounting-input is-number"
                            placeholder="0.00"
                            value={line.credit}
                            onChange={(e) =>
                              updateLine(i, "credit", e.target.value)
                            }
                          />
                        </td>
                        <td className="is-center">
                          {lines.length > 2 && (
                            <button
                              onClick={() => removeLine(i)}
                              className="accounting-link is-danger"
                            >
                              ×
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="accounting-total-row">
                      <td colSpan={2} className="is-right is-muted">
                        Totals
                      </td>
                      <td className="is-right is-mono">
                        {formatCI(lineDebits)}
                      </td>
                      <td className="is-right is-mono">
                        {formatCI(lineCredits)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Balanced summary */}
              <div
                className={`accounting-alert ${
                  isBalanced ? "is-success" : "is-error"
                }`}
              >
                {isBalanced
                  ? "✓ Entry is balanced"
                  : "⚠ Debits must equal credits"}
              </div>
            </div>
            <div className="accounting-modal-footer is-spread">
              <div className="accounting-form-error">{formError}</div>
              <div className="accounting-inline-actions">
                <button
                  onClick={() => setShowCreate(false)}
                  className="accounting-btn accounting-btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="accounting-btn accounting-btn-primary"
                >
                  {saving ? "Saving..." : "Create Journal"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
