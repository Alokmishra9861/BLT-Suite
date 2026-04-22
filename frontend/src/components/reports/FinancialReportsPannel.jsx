import ProfitAndLossTable from "./ProfitAndLossTable";
import BalanceSheetTable from "./BalanceSheetTable";
import CashFlowTable from "./CashFlowTable";
import TrialBalanceTable from "./TrialBalanceTable";

export default function FinancialReportsPanel({
  reportType,
  data,
  formatMoney,
}) {
  if (!data) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
        No financial data found.
      </div>
    );
  }

  if (reportType === "profit-loss") {
    return <ProfitAndLossTable data={data} formatMoney={formatMoney} />;
  }

  if (reportType === "balance-sheet") {
    return <BalanceSheetTable data={data} formatMoney={formatMoney} />;
  }

  if (reportType === "cash-flow") {
    return <CashFlowTable data={data} formatMoney={formatMoney} />;
  }

  if (reportType === "trial-balance") {
    return <TrialBalanceTable data={data} formatMoney={formatMoney} />;
  }

  return null;
}
