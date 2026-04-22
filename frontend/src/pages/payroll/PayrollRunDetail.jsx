// src/pages/payroll/PayrollRunDetail.jsx
import React, { useEffect, useState } from "react";
import {
  getPayrollSummary,
  getPayrollLines,
  processPayrollRun,
  postPayrollRun,
} from "../../services/PayrollApi";
import SummaryCards from "../../components/common/SummaryCards";
import PayrollLinesTable from "../../components/common/PayrollLinesTable";
import Badge from "../../components/common/Badge";
import "../../styles/Payroll.css";

const PERIOD_LABELS = {
  weekly: "Weekly",
  biweekly: "Bi-Weekly",
  semimonthly: "Semi-Monthly",
  monthly: "Monthly",
};

const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * PayrollRunDetail
 * Props:
 *   runId   {string}   - MongoDB _id of the payroll run
 *   onBack  {function} - Called when user clicks "Back to Pay Runs"
 */
export default function PayrollRunDetail({ runId, onBack }) {
  const [run, setRun] = useState(null);
  const [summary, setSummary] = useState(null);
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linesLoading, setLinesLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const s = await getPayrollSummary(runId);
      setRun(s.run);
      setSummary(s.summary);
      if (s.run.status !== "draft") {
        setLinesLoading(true);
        const l = await getPayrollLines(runId);
        setLines(l);
        setLinesLoading(false);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load payroll run.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (runId) loadAll();
  }, [runId]);

  const handleProcess = async () => {
    if (
      !window.confirm(
        "Process this payroll run? Payroll lines will be calculated for all eligible employees.",
      )
    )
      return;
    setActionLoading("processing");
    try {
      await processPayrollRun(runId);
      await loadAll();
    } catch (e) {
      alert(e.response?.data?.message || "Processing failed.");
    } finally {
      setActionLoading("");
    }
  };

  const handlePost = async () => {
    if (
      !window.confirm(
        "Post this payroll run to the General Ledger? This action is IRREVERSIBLE. The run will be locked.",
      )
    )
      return;
    setActionLoading("posting");
    try {
      await postPayrollRun(runId);
      await loadAll();
    } catch (e) {
      alert(e.response?.data?.message || "Posting failed.");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="pr-page">
        <div className="pr-loading">
          <div className="pr-spinner" /> Loading run detail…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pr-page">
        <div className="pr-alert pr-alert-red">⚠ {error}</div>
        <button className="pr-btn" onClick={onBack}>
          ← Back
        </button>
      </div>
    );
  }

  if (!run) return null;

  return (
    <div className="pr-page">
      {/* ── Back ── */}
      <div className="pr-back-link" onClick={onBack}>
        ← Back to Pay Runs
      </div>

      {/* ── Header ── */}
      <div className="pr-page-header">
        <div>
          <div
            className="pr-page-title"
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            {run.entityId}
            <Badge value={run.status} />
          </div>
          <div className="pr-page-subtitle">
            {PERIOD_LABELS[run.periodType]} Payroll Run &nbsp;·&nbsp;{" "}
            {fmt(run.periodStart)} – {fmt(run.periodEnd)}
          </div>
        </div>
        <div className="pr-header-actions">
          {run.status === "draft" && (
            <button
              className="pr-btn pr-btn-success"
              disabled={actionLoading === "processing"}
              onClick={handleProcess}
            >
              {actionLoading === "processing"
                ? "Processing…"
                : "▶ Process Payroll"}
            </button>
          )}
          {run.status === "processed" && (
            <button
              className="pr-btn pr-btn-primary"
              disabled={actionLoading === "posting"}
              onClick={handlePost}
            >
              {actionLoading === "posting"
                ? "Posting…"
                : "✓ Post to General Ledger"}
            </button>
          )}
        </div>
      </div>

      {/* ── Status alerts ── */}
      {run.status === "draft" && (
        <div className="pr-alert pr-alert-gold">
          ⚠ This run is in <strong>Draft</strong> status. Process it to generate
          payroll lines.
        </div>
      )}
      {run.status === "posted" && (
        <div className="pr-alert pr-alert-green">
          ✓ <strong>Posted</strong> on {fmt(run.postedAt)}
          {run.jeRef && (
            <>
              {" "}
              · Journal Entry:{" "}
              <strong style={{ fontFamily: "monospace" }}>{run.jeRef}</strong>
            </>
          )}
        </div>
      )}

      {/* ── Meta grid ── */}
      <div className="pr-panel" style={{ marginBottom: 16 }}>
        <div className="pr-panel-body">
          <div className="pr-detail-meta">
            <div className="pr-detail-meta-item">
              <div className="label">Period Type</div>
              <div className="value">{PERIOD_LABELS[run.periodType]}</div>
            </div>
            <div className="pr-detail-meta-item">
              <div className="label">Period</div>
              <div className="value">
                {fmt(run.periodStart)} – {fmt(run.periodEnd)}
              </div>
            </div>
            <div className="pr-detail-meta-item">
              <div className="label">Pay Date</div>
              <div className="value">{fmt(run.payDate)}</div>
            </div>
            <div className="pr-detail-meta-item">
              <div className="label">Status</div>
              <div className="value">
                <Badge value={run.status} />
              </div>
            </div>
            <div className="pr-detail-meta-item">
              <div className="label">Processed</div>
              <div className="value">
                {run.processedAt ? fmt(run.processedAt) : "—"}
              </div>
            </div>
            <div className="pr-detail-meta-item">
              <div className="label">Posted</div>
              <div className="value">
                {run.postedAt ? fmt(run.postedAt) : "—"}
              </div>
            </div>
            <div className="pr-detail-meta-item">
              <div className="label">Journal Ref</div>
              <div
                className="value"
                style={{ fontFamily: "monospace", fontSize: 12 }}
              >
                {run.jeRef || "—"}
              </div>
            </div>
            <div className="pr-detail-meta-item">
              <div className="label">Notes</div>
              <div
                className="value"
                style={{ fontWeight: 400, color: "var(--muted)" }}
              >
                {run.notes || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Summary cards ── */}
      {run.status !== "draft" && summary && (
        <SummaryCards
          totalGross={summary.totalGrossPay}
          totalDeductions={summary.totalDeductions}
          totalNet={summary.totalNetPay}
          employeeCount={summary.employeeCount}
        />
      )}

      {/* ── Payroll lines ── */}
      <div className="pr-panel">
        <div className="pr-panel-header">
          <div className="pr-panel-title">Payroll Lines</div>
          {lines.length > 0 && (
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              {lines.length} employees
            </span>
          )}
        </div>
        <PayrollLinesTable lines={lines} loading={linesLoading} />
      </div>
    </div>
  );
}
