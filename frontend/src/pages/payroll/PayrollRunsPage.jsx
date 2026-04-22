// src/pages/payroll/PayrollRunsPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  getPayrollRuns,
  createPayrollRun,
  processPayrollRun,
  postPayrollRun,
  deletePayrollRun,
  getPayrollLines,
} from "../../services/PayrollApi";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import PayrollLinesTable from "../../components/common/PayrollLinesTable";
import "../../styles/Payroll.css";

const ENTITIES = [
  "BLT International Group LLC",
  "Mall of Cayman",
  "CayEats",
  "CaySearch",
  "Cayman Home Page",
  "Discount Club Cayman",
  "CayBookMe",
  "CayVids",
  "CayMaintenance",
  "CayAuctions",
];
const PERIOD_TYPES = ["weekly", "biweekly", "semimonthly", "monthly"];
const PERIOD_LABELS = {
  weekly: "Weekly",
  biweekly: "Bi-Weekly",
  semimonthly: "Semi-Monthly",
  monthly: "Monthly",
};

const ci = (n = 0) => {
  const abs = Math.abs(n);
  const s =
    "CI$ " +
    abs.toLocaleString("en", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  return n < 0 ? `(${s})` : s;
};
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const EMPTY_FORM = {
  entityId: "",
  periodType: "semimonthly",
  periodStart: "",
  periodEnd: "",
  payDate: "",
  notes: "",
};

export default function PayrollRunsPage({ activeEntity }) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [expandedLines, setExpandedLines] = useState({});
  const [linesLoading, setLinesLoading] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const clearFilters = () => {
    setFilterStatus("");
    setFilterPeriod("");
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (activeEntity) params.entityId = activeEntity;
      if (filterStatus) params.status = filterStatus;
      const data = await getPayrollRuns(params);
      // Ensure data is always an array
      setRuns(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load payroll runs.");
      setRuns([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  }, [activeEntity, filterStatus]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Expand / collapse with lazy line loading ──────────────────────────
  const toggleExpand = async (run) => {
    const id = run._id;
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!expandedLines[id] && run.status !== "draft") {
      setLinesLoading((prev) => ({ ...prev, [id]: true }));
      try {
        const lines = await getPayrollLines(id);
        setExpandedLines((prev) => ({ ...prev, [id]: lines }));
      } catch (_) {}
      setLinesLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // ── Actions ────────────────────────────────────────────────────────────
  const handleProcess = async (e, id) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Process this payroll run? Payroll lines will be calculated.",
      )
    )
      return;
    setActionLoading((p) => ({ ...p, [id]: "processing" }));
    try {
      await processPayrollRun(id);
      await load();
      setExpandedLines((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });
    } catch (err) {
      alert(err.response?.data?.message || "Processing failed.");
    } finally {
      setActionLoading((p) => ({ ...p, [id]: null }));
    }
  };

  const handlePost = async (e, id) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Post this payroll run to the General Ledger? This action is irreversible.",
      )
    )
      return;
    setActionLoading((p) => ({ ...p, [id]: "posting" }));
    try {
      await postPayrollRun(id);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Posting failed.");
    } finally {
      setActionLoading((p) => ({ ...p, [id]: null }));
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this draft payroll run?")) return;
    try {
      await deletePayrollRun(id);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    }
  };

  // ── Create form ────────────────────────────────────────────────────────
  const handleCreateSubmit = async () => {
    if (!form.periodStart || !form.periodEnd || !form.payDate) {
      setFormError("Period start, end, and pay date are required.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await createPayrollRun(form);
      setShowCreate(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create run.");
    } finally {
      setSaving(false);
    }
  };

  // ── Filter runs client-side by period type ─────────────────────────────
  const visible =
    (filterPeriod && runs && runs.length > 0
      ? runs.filter((r) => r.periodType === filterPeriod)
      : runs) || [];

  return (
    <div className="pr-page">
      {/* ── Header ── */}
      <div className="pr-page-header">
        <div>
          <div className="pr-page-title">Pay Runs</div>
          <div className="pr-page-subtitle">
            {activeEntity || "All Entities"} · Payroll run management
          </div>
        </div>
        <div className="pr-header-actions">
          <button
            className="pr-btn pr-btn-primary"
            onClick={() => {
              setForm({ ...EMPTY_FORM, entityId: activeEntity || "all" });
              setShowCreate(true);
            }}
          >
            + New Pay Run
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="pr-panel" style={{ marginBottom: 16 }}>
        <div className="pr-toolbar">
          <select
            className="pr-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="processed">Processed</option>
            <option value="posted">Posted</option>
          </select>
          <select
            className="pr-select"
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
          >
            <option value="">All Period Types</option>
            {PERIOD_TYPES.map((p) => (
              <option key={p} value={p}>
                {PERIOD_LABELS[p]}
              </option>
            ))}
          </select>
          <div className="pr-toolbar-meta">
            <button
              type="button"
              className="pr-view-all"
              onClick={clearFilters}
            >
              View all
            </button>
            <span className="pr-count">
              {visible.length} run{visible.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && <div className="pr-alert pr-alert-red">⚠ {error}</div>}

      {/* ── Loading ── */}
      {loading && (
        <div className="pr-loading">
          <div className="pr-spinner" /> Loading pay runs…
        </div>
      )}

      {/* ── Runs list ── */}
      {!loading && !visible.length && (
        <div className="pr-empty">
          <div className="pr-empty-icon">📋</div>
          <div className="pr-empty-text">
            No payroll runs found. Create one to get started.
          </div>
        </div>
      )}

      {!loading &&
        visible.map((run) => {
          const isExpanded = expandedId === run._id;
          const al = actionLoading[run._id];
          return (
            <div className="pr-run-card" key={run._id}>
              <div
                className="pr-run-card-header"
                onClick={() => toggleExpand(run)}
              >
                <div className="pr-run-card-left">
                  <div className="pr-run-entity">
                    {run.entityId}
                    <Badge value={run.status} />
                  </div>
                  <div className="pr-run-meta">
                    {PERIOD_LABELS[run.periodType] || run.periodType}
                    &nbsp;·&nbsp;{fmt(run.periodStart)} – {fmt(run.periodEnd)}
                    &nbsp;·&nbsp;Pay: <strong>{fmt(run.payDate)}</strong>
                    {run.jeRef && (
                      <>
                        &nbsp;·&nbsp;JE:{" "}
                        <span style={{ fontFamily: "monospace" }}>
                          {run.jeRef}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="pr-run-card-right">
                  {run.status !== "draft" && (
                    <>
                      <div className="pr-run-gross">
                        {ci(run.totalGrossPay)}
                      </div>
                      <div className="pr-run-net">
                        {ci(run.totalNetPay)} net
                      </div>
                    </>
                  )}
                  {run.status === "draft" && (
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>
                      Not yet processed
                    </span>
                  )}
                  <div
                    style={{
                      fontSize: 18,
                      color: "var(--muted)",
                      marginTop: 6,
                    }}
                  >
                    {isExpanded ? "▲" : "▼"}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="pr-run-detail">
                  {run.status === "draft" && (
                    <div className="pr-alert pr-alert-gold">
                      ⚠ This run has not been processed yet. Click "Process" to
                      calculate payroll lines.
                    </div>
                  )}
                  {run.status === "posted" && run.jeRef && (
                    <div className="pr-alert pr-alert-green">
                      ✓ Posted · Journal entry <strong>{run.jeRef}</strong>{" "}
                      created on {fmt(run.postedAt)}
                    </div>
                  )}

                  <PayrollLinesTable
                    lines={expandedLines[run._id] || []}
                    loading={!!linesLoading[run._id]}
                  />

                  {run.notes && (
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 12,
                        color: "var(--muted)",
                      }}
                    >
                      <strong>Notes:</strong> {run.notes}
                    </div>
                  )}

                  <div className="pr-run-actions">
                    {run.status === "draft" && (
                      <>
                        <button
                          className="pr-btn pr-btn-success"
                          disabled={al === "processing"}
                          onClick={(e) => handleProcess(e, run._id)}
                        >
                          {al === "processing"
                            ? "Processing…"
                            : "▶ Process Payroll"}
                        </button>
                        <button
                          className="pr-btn pr-btn-danger"
                          onClick={(e) => handleDelete(e, run._id)}
                        >
                          Delete Run
                        </button>
                      </>
                    )}
                    {run.status === "processed" && (
                      <button
                        className="pr-btn pr-btn-primary"
                        disabled={al === "posting"}
                        onClick={(e) => handlePost(e, run._id)}
                      >
                        {al === "posting"
                          ? "Posting…"
                          : "✓ Post to General Ledger"}
                      </button>
                    )}
                    {run.status === "posted" && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--muted)",
                          fontStyle: "italic",
                        }}
                      >
                        This run is posted and locked.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

      {/* ── Create Modal ── */}
      {showCreate && (
        <Modal
          isOpen={showCreate}
          onClose={() => {
            setShowCreate(false);
            setForm(EMPTY_FORM);
            setFormError("");
          }}
          title="New Payroll Run"
          footer={
            <>
              <button
                className="pr-btn"
                onClick={() => {
                  setShowCreate(false);
                  setForm(EMPTY_FORM);
                  setFormError("");
                }}
              >
                Cancel
              </button>
              <button
                className="pr-btn pr-btn-primary"
                disabled={saving}
                onClick={handleCreateSubmit}
              >
                {saving ? "Creating…" : "Create Run"}
              </button>
            </>
          }
        >
          {formError && (
            <div className="pr-alert pr-alert-red">⚠ {formError}</div>
          )}

          <div className="pr-form-row">
            <label className="pr-form-label">Entity</label>
            <select
              className="pr-form-input"
              value={form.entityId}
              onChange={(e) =>
                setForm((p) => ({ ...p, entityId: e.target.value }))
              }
            >
              {activeEntity && (
                <option value={activeEntity}>This Entity</option>
              )}
              <option value="all">All Entities (Global)</option>
            </select>
          </div>

          <div className="pr-form-row">
            <label className="pr-form-label">Period Type</label>
            <select
              className="pr-form-input"
              value={form.periodType}
              onChange={(e) =>
                setForm((p) => ({ ...p, periodType: e.target.value }))
              }
            >
              {PERIOD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {PERIOD_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <div className="pr-form-grid">
            <div className="pr-form-row">
              <label className="pr-form-label">Period Start</label>
              <input
                className="pr-form-input"
                type="date"
                value={form.periodStart}
                onChange={(e) =>
                  setForm((p) => ({ ...p, periodStart: e.target.value }))
                }
              />
            </div>
            <div className="pr-form-row">
              <label className="pr-form-label">Period End</label>
              <input
                className="pr-form-input"
                type="date"
                value={form.periodEnd}
                onChange={(e) =>
                  setForm((p) => ({ ...p, periodEnd: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="pr-form-row">
            <label className="pr-form-label">Pay Date</label>
            <input
              className="pr-form-input"
              type="date"
              value={form.payDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, payDate: e.target.value }))
              }
            />
          </div>

          <div className="pr-form-row">
            <label className="pr-form-label">Notes (optional)</label>
            <input
              className="pr-form-input"
              type="text"
              placeholder="Internal notes…"
              value={form.notes}
              onChange={(e) =>
                setForm((p) => ({ ...p, notes: e.target.value }))
              }
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
