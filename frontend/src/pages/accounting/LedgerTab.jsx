import { useState, useEffect } from "react";
import {
  getAccounts,
  getAccountLedger,
  getTrialBalance,
} from "../../services/accounting.service";

function formatCI(amount) {
  if (amount === undefined || amount === null) return "—";
  const n = parseFloat(amount);
  if (isNaN(n)) return "—";
  const formatted = Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return n < 0 ? `(CI$ ${formatted})` : `CI$ ${formatted}`;
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const TYPE_COLORS = {
  Asset: "type-asset",
  Liability: "type-liability",
  Equity: "type-equity",
  Income: "type-income",
  Expense: "type-expense",
};

export default function LedgerTab() {
  const [view, setView] = useState("trial-balance"); // 'trial-balance' | 'ledger'
  const [accounts, setAccounts] = useState([]);
  const [trialBalance, setTrialBalance] = useState(null);
  const [tbLoading, setTbLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("");

  useEffect(() => {
    loadTrialBalance();
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const res = await getAccounts({ isActive: true });
      setAccounts(res.data.data || []);
    } catch {}
  };

  const loadTrialBalance = async (params = {}) => {
    setTbLoading(true);
    try {
      const res = await getTrialBalance(params);
      setTrialBalance(res.data.data);
    } catch {
      setTrialBalance(null);
    } finally {
      setTbLoading(false);
    }
  };

  const openLedger = async (account) => {
    setSelectedAccount(account);
    setView("ledger");
    setLedgerLoading(true);
    try {
      const res = await getAccountLedger(
        account._id || account.accountId,
        periodFilter
          ? { periodFrom: periodFilter, periodTo: periodFilter }
          : {},
      );
      setLedger(res.data.data);
    } catch {
      setLedger(null);
    } finally {
      setLedgerLoading(false);
    }
  };

  const grouped = trialBalance
    ? ["Asset", "Liability", "Equity", "Income", "Expense"].reduce((acc, t) => {
        const rows = trialBalance.rows.filter((r) => r.type === t);
        if (rows.length) acc[t] = rows;
        return acc;
      }, {})
    : {};

  return (
    <div>
      {/* Header */}
      <div className="accounting-section-header">
        <div className="accounting-section-title-group">
          <h2 className="accounting-section-title">
            {view === "trial-balance"
              ? "Trial Balance"
              : `Ledger: ${selectedAccount?.name || ""}`}
          </h2>
          {view === "ledger" && (
            <button
              onClick={() => setView("trial-balance")}
              className="accounting-link"
            >
              ← Back to Trial Balance
            </button>
          )}
        </div>
        <div className="accounting-toolbar">
          {view === "trial-balance" && (
            <>
              <input
                type="month"
                className="accounting-input"
                placeholder="Filter period"
                onChange={(e) => {
                  const val = e.target.value; // YYYY-MM
                  setPeriodFilter(val);
                  loadTrialBalance(
                    val ? { periodFrom: val, periodTo: val } : {},
                  );
                }}
              />
              <button
                onClick={() => loadTrialBalance()}
                className="accounting-btn accounting-btn-ghost"
              >
                All Periods
              </button>
            </>
          )}
          {view === "ledger" && selectedAccount && (
            <select
              className="accounting-select"
              onChange={(e) => {
                setPeriodFilter(e.target.value);
                openLedger(selectedAccount);
              }}
            >
              <option value="">All Periods</option>
              {/* Generate last 12 months */}
              {Array.from({ length: 12 }, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                return (
                  <option key={val} value={val}>
                    {val}
                  </option>
                );
              })}
            </select>
          )}
        </div>
      </div>

      {/* Trial Balance View */}
      {view === "trial-balance" &&
        (tbLoading ? (
          <div className="accounting-panel accounting-empty">
            Loading trial balance...
          </div>
        ) : !trialBalance ? (
          <div className="accounting-alert is-warning">
            No trial balance data. Post journal entries to see balances here.
          </div>
        ) : (
          <>
            {/* Balance check banner */}
            <div
              className={`accounting-alert ${
                trialBalance.balanced ? "is-success" : "is-error"
              }`}
            >
              {trialBalance.balanced
                ? `✓ Trial balance is in balance — ${formatCI(trialBalance.sumDebits)}`
                : `⚠ Out of balance! Debits: ${formatCI(trialBalance.sumDebits)}, Credits: ${formatCI(trialBalance.sumCredits)}`}
            </div>

            <div className="accounting-panel">
              <table className="accounting-table">
                <thead>
                  <tr className="accounting-table-head">
                    <th className="is-code">Code</th>
                    <th>Account</th>
                    <th className="is-small">Type</th>
                    <th className="is-right is-small">Debits</th>
                    <th className="is-right is-small">Credits</th>
                    <th className="is-right is-small">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(grouped).map(([type, rows]) => (
                    <>
                      <tr key={`g-${type}`} className="accounting-group-row">
                        <td colSpan={6}>{type}s</td>
                      </tr>
                      {rows.map((r) => (
                        <tr
                          key={r.accountId}
                          onClick={() => openLedger(r)}
                          className="accounting-row is-clickable"
                        >
                          <td className="is-code">{r.code}</td>
                          <td className="is-strong">{r.name}</td>
                          <td className={`is-muted ${TYPE_COLORS[r.type]}`}>
                            {r.type}
                          </td>
                          <td className="is-right is-mono">
                            {r.totalDebits > 0 ? (
                              formatCI(r.totalDebits)
                            ) : (
                              <span className="is-faint">—</span>
                            )}
                          </td>
                          <td className="is-right is-mono">
                            {r.totalCredits > 0 ? (
                              formatCI(r.totalCredits)
                            ) : (
                              <span className="is-faint">—</span>
                            )}
                          </td>
                          <td
                            className={`is-right is-mono is-strong ${
                              r.balance < 0
                                ? "is-negative"
                                : r.balance > 0
                                  ? ""
                                  : "is-faint"
                            }`}
                          >
                            {r.balance !== 0 ? formatCI(r.balance) : "—"}
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                  {/* Totals row */}
                  <tr className="accounting-total-row is-dark">
                    <td colSpan={3}>Totals</td>
                    <td className="is-right is-mono">
                      {formatCI(trialBalance.sumDebits)}
                    </td>
                    <td className="is-right is-mono">
                      {formatCI(trialBalance.sumCredits)}
                    </td>
                    <td className="is-right is-mono">
                      {trialBalance.balanced ? "✓" : "✗"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="accounting-hint">
              Click any account row to view its full transaction ledger.
            </p>
          </>
        ))}

      {/* Ledger View */}
      {view === "ledger" &&
        (ledgerLoading ? (
          <div className="accounting-panel accounting-empty">
            Loading ledger...
          </div>
        ) : !ledger ? (
          <div className="accounting-alert is-warning">
            No ledger data for this account.
          </div>
        ) : (
          <>
            {/* Account card */}
            <div className="accounting-panel accounting-account-card">
              <div>
                <div className="accounting-code">{ledger.account.code}</div>
                <div className="accounting-account-name">
                  {ledger.account.name}
                </div>
                <div className="accounting-account-meta">
                  {ledger.account.type} · {ledger.account.subType}
                </div>
              </div>
            </div>

            <div className="accounting-panel">
              <table className="accounting-table">
                <thead>
                  <tr className="accounting-table-head">
                    <th className="is-date">Date</th>
                    <th className="is-code">Journal #</th>
                    <th>Description</th>
                    <th className="is-small">Ref</th>
                    <th className="is-right is-small">Debit</th>
                    <th className="is-right is-small">Credit</th>
                    <th className="is-right is-small">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.lines.length === 0 && (
                    <tr>
                      <td colSpan={7} className="accounting-empty">
                        No posted transactions for this account.
                      </td>
                    </tr>
                  )}
                  {ledger.lines.map((line, i) => (
                    <tr key={i} className="accounting-row">
                      <td className="is-muted">{formatDate(line.date)}</td>
                      <td className="is-code is-strong">
                        {line.journalNumber}
                      </td>
                      <td>{line.description}</td>
                      <td className="is-muted">{line.reference || ""}</td>
                      <td className="is-right is-mono">
                        {line.debit > 0 ? formatCI(line.debit) : ""}
                      </td>
                      <td className="is-right is-mono">
                        {line.credit > 0 ? formatCI(line.credit) : ""}
                      </td>
                      <td
                        className={`is-right is-mono is-strong ${
                          line.runningBalance < 0 ? "is-negative" : ""
                        }`}
                      >
                        {formatCI(line.runningBalance)}
                      </td>
                    </tr>
                  ))}
                  {ledger.lines.length > 0 && (
                    <tr className="accounting-total-row is-dark">
                      <td colSpan={6} className="is-right">
                        Closing Balance
                      </td>
                      <td className="is-right is-mono">
                        {formatCI(
                          ledger.lines[ledger.lines.length - 1]?.runningBalance,
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ))}
    </div>
  );
}
