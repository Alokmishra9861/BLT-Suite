import { useState, useEffect } from "react";
import ChartOfAccountsTab from "./ChartOfAccountsTab";
import JournalsTab from "./JournalsTab";
import LedgerTab from "./LedgerTab";
import { getJournals, getAccounts } from "../../services/accounting.service";

const TABS = [
  { id: "coa", label: "Chart of Accounts" },
  { id: "journals", label: "Journal Entries" },
  { id: "ledger", label: "Ledger & Trial Balance" },
];

function KPI({ label, value, sub, accent }) {
  return (
    <div className="accounting-kpi">
      <div className={`accounting-kpi-accent ${accent}`} />
      <div className="accounting-kpi-label">{label}</div>
      <div className="accounting-kpi-value">{value}</div>
      {sub && <div className="accounting-kpi-sub">{sub}</div>}
    </div>
  );
}

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState("coa");
  const [stats, setStats] = useState({ accounts: 0, drafts: 0, posted: 0 });

  useEffect(() => {
    Promise.all([
      getAccounts({ isActive: true }),
      getJournals({ status: "draft", limit: 1 }),
      getJournals({ status: "posted", limit: 1 }),
    ])
      .then(([acctRes, draftRes, postedRes]) => {
        setStats({
          accounts: acctRes.data.data?.length || 0,
          drafts: draftRes.data.data?.total || 0,
          posted: postedRes.data.data?.total || 0,
        });
      })
      .catch(() => {});
  }, [activeTab]);

  return (
    <div className="accounting-page">
      {/* Page header */}
      <div className="accounting-header">
        <div>
          <h1 className="accounting-title">Accounting</h1>
          <p className="accounting-subtitle">
            Double-entry ledger · Journal engine · Trial balance
          </p>
        </div>
      </div>

      {/* KPI bar */}
      <div className="accounting-kpis">
        <KPI
          label="Active Accounts"
          value={stats.accounts}
          sub="in Chart of Accounts"
          accent="accent-gold"
        />
        <KPI
          label="Draft Journals"
          value={stats.drafts}
          sub="awaiting review"
          accent="accent-amber"
        />
        <KPI
          label="Posted Entries"
          value={stats.posted}
          sub="in general ledger"
          accent="accent-mint"
        />
      </div>

      {/* Tabs */}
      <div className="accounting-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`accounting-tab ${
              activeTab === tab.id ? "is-active" : ""
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="accounting-content">
        {activeTab === "coa" && <ChartOfAccountsTab />}
        {activeTab === "journals" && <JournalsTab />}
        {activeTab === "ledger" && <LedgerTab />}
      </div>
    </div>
  );
}
