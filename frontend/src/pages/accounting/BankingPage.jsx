import { useEffect, useMemo, useState } from "react";
import BankingSummaryCards from "../banking/BankingSummaryCards";
import BankAccountsTable from "../banking/BankAccountsTable";
import BankTransactionsTable from "../banking/BankTransactionsTable";
import ReconciliationList from "../banking/ReconciliationList";
import BankAccountModal from "../banking/BankAccountModal";
import BankTransactionModal from "../banking/BankTransactionModal";
import ReconciliationModal from "../banking/ReconciliationModal";
import bankingService from "../../services/banking.service";

const formatMoney = (value, currency = "CI$") => {
  const amount = Number(value || 0);
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function BankingPage() {
  const [activeTab, setActiveTab] = useState("accounts");
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [reconciliations, setReconciliations] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");

  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState("");

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showReconciliationModal, setShowReconciliationModal] = useState(false);

  const [editingAccount, setEditingAccount] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const loadBankingData = async () => {
    try {
      setError("");
      setLoading(true);

      const [accountsRes, transactionsRes, reconciliationsRes] =
        await Promise.all([
          bankingService.getBankAccounts(),
          bankingService.getBankTransactions(),
          bankingService.getReconciliations(),
        ]);

      setAccounts(accountsRes?.data || []);
      setTransactions(transactionsRes?.data || []);
      setReconciliations(reconciliationsRes?.data || []);
    } catch (err) {
      console.error("Failed to load banking data:", err);
      setError(err?.response?.data?.message || "Failed to load banking data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBankingData();
  }, []);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((item) => {
      const haystack =
        `${item.name || ""} ${item.bankName || ""} ${item.currency || ""}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [accounts, search]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const byAccount = selectedAccountId
        ? item.bankAccount?._id === selectedAccountId ||
          item.bankAccount === selectedAccountId
        : true;

      const bySearch = `${item.description || ""} ${item.referenceNo || ""} ${
        item.bankAccount?.name || ""
      }`
        .toLowerCase()
        .includes(search.toLowerCase());

      return byAccount && bySearch;
    });
  }, [transactions, selectedAccountId, search]);

  const filteredReconciliations = useMemo(() => {
    return reconciliations.filter((item) => {
      const byAccount = selectedAccountId
        ? item.bankAccount?._id === selectedAccountId ||
          item.bankAccount === selectedAccountId
        : true;

      const bySearch = `${item.bankAccount?.name || ""} ${item.status || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());

      return byAccount && bySearch;
    });
  }, [reconciliations, selectedAccountId, search]);

  const summary = useMemo(() => {
    const totalStatement = accounts.reduce(
      (sum, item) => sum + Number(item.statementBalance || 0),
      0,
    );
    const totalLedger = accounts.reduce(
      (sum, item) => sum + Number(item.ledgerBalance || 0),
      0,
    );
    const unreconciledCount = accounts.reduce(
      (sum, item) => sum + Number(item.unreconciledCount || 0),
      0,
    );

    return {
      totalAccounts: accounts.length,
      totalStatement,
      totalLedger,
      totalDifference: Number((totalStatement - totalLedger).toFixed(2)),
      unreconciledCount,
    };
  }, [accounts]);

  const handleCreateAccount = async (payload) => {
    try {
      setPageLoading(true);
      await bankingService.createBankAccount(payload);
      await loadBankingData();
      setShowAccountModal(false);
      setEditingAccount(null);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to create bank account.");
    } finally {
      setPageLoading(false);
    }
  };

  const handleUpdateAccount = async (payload) => {
    try {
      setPageLoading(true);
      await bankingService.updateBankAccount(editingAccount._id, payload);
      await loadBankingData();
      setShowAccountModal(false);
      setEditingAccount(null);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to update bank account.");
    } finally {
      setPageLoading(false);
    }
  };

  const handleCreateTransaction = async (payload) => {
    try {
      setPageLoading(true);
      await bankingService.createBankTransaction({
        bankAccount: payload.bankAccountId,
        transactionDate: payload.transactionDate,
        description: payload.description,
        direction: payload.direction,
        amount: Number(payload.amount),
        referenceNo: payload.referenceNo,
        matchStatus: payload.matchStatus,
        status: payload.status,
      });
      await loadBankingData();
      setShowTransactionModal(false);
      setEditingTransaction(null);
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message || "Failed to create bank transaction.",
      );
    } finally {
      setPageLoading(false);
    }
  };

  const handleUpdateTransaction = async (payload) => {
    try {
      setPageLoading(true);
      await bankingService.updateBankTransaction(editingTransaction._id, {
        bankAccount: payload.bankAccountId,
        transactionDate: payload.transactionDate,
        description: payload.description,
        direction: payload.direction,
        amount: Number(payload.amount),
        referenceNo: payload.referenceNo,
        matchStatus: payload.matchStatus,
        status: payload.status,
      });
      await loadBankingData();
      setShowTransactionModal(false);
      setEditingTransaction(null);
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message || "Failed to update bank transaction.",
      );
    } finally {
      setPageLoading(false);
    }
  };

  const handleCreateReconciliation = async (payload) => {
    try {
      setPageLoading(true);
      await bankingService.createReconciliation({
        bankAccount: payload.bankAccountId,
        statementDate: payload.statementDate,
        periodStart: payload.periodStart,
        periodEnd: payload.periodEnd,
        openingBalance: Number(payload.openingBalance),
        closingBalance: Number(payload.closingBalance),
      });
      await loadBankingData();
      setShowReconciliationModal(false);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to create reconciliation.");
    } finally {
      setPageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
        Loading banking data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pageLoading && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
          Processing request...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Banking</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage bank accounts, transactions, and reconciliation with live
              backend data.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingAccount(null);
                setShowAccountModal(true);
              }}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              + New Bank Account
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingTransaction(null);
                setShowTransactionModal(true);
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              + New Transaction
            </button>

            <button
              type="button"
              onClick={() => setShowReconciliationModal(true)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              + New Reconciliation
            </button>
          </div>
        </div>
      </div>

      <BankingSummaryCards summary={summary} formatMoney={formatMoney} />

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                activeTab === "accounts"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-700"
              }`}
              onClick={() => setActiveTab("accounts")}
            >
              Accounts
            </button>
            <button
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                activeTab === "transactions"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-700"
              }`}
              onClick={() => setActiveTab("transactions")}
            >
              Transactions
            </button>
            <button
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                activeTab === "reconciliations"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-700"
              }`}
              onClick={() => setActiveTab("reconciliations")}
            >
              Reconciliations
            </button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              placeholder="Search banking data..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 rounded-xl border border-slate-300 px-4 text-sm outline-none transition focus:border-slate-900"
            />

            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="h-11 rounded-xl border border-slate-300 px-4 text-sm outline-none transition focus:border-slate-900"
            >
              <option value="">All Accounts</option>
              {accounts.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={loadBankingData}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {activeTab === "accounts" && (
        <BankAccountsTable
          accounts={filteredAccounts}
          formatMoney={formatMoney}
          onEdit={(item) => {
            setEditingAccount(item);
            setShowAccountModal(true);
          }}
        />
      )}

      {activeTab === "transactions" && (
        <BankTransactionsTable
          transactions={filteredTransactions}
          formatMoney={formatMoney}
          onEdit={(item) => {
            setEditingTransaction({
              ...item,
              bankAccountId: item.bankAccount?._id || item.bankAccount || "",
            });
            setShowTransactionModal(true);
          }}
        />
      )}

      {activeTab === "reconciliations" && (
        <ReconciliationList
          reconciliations={filteredReconciliations}
          formatMoney={formatMoney}
        />
      )}

      <BankAccountModal
        open={showAccountModal}
        onClose={() => {
          setShowAccountModal(false);
          setEditingAccount(null);
        }}
        onSubmit={editingAccount ? handleUpdateAccount : handleCreateAccount}
        initialData={editingAccount}
      />

      <BankTransactionModal
        open={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setEditingTransaction(null);
        }}
        onSubmit={
          editingTransaction ? handleUpdateTransaction : handleCreateTransaction
        }
        initialData={editingTransaction}
        accounts={accounts}
      />

      <ReconciliationModal
        open={showReconciliationModal}
        onClose={() => setShowReconciliationModal(false)}
        onSubmit={handleCreateReconciliation}
        accounts={accounts}
      />
    </div>
  );
}
