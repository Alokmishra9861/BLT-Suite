import { useEffect, useMemo, useState } from "react";
import reportService from "../../services/report.service";
import ReportsHeader from "../../components/reports/ReportsHeader";
import ReportsTypeTabs from "../../components/reports/ReportsTypesTab";
import ReportFilters from "../../components/reports/ReportFilters";
import SummaryReportCards from "../../components/reports/SummaryReportCards";
import FinancialReportsPanel from "../../components/reports/FinancialReportsPannel";
import HrReportsPanel from "../../components/reports/HrReportsPanel";

const formatMoney = (value, currency = "CI$") => {
  const amount = Number(value || 0);
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function ReportsPage() {
  const [reportCategory, setReportCategory] = useState("financial");
  const [financialReportType, setFinancialReportType] = useState("profit-loss");
  const [hrReportType, setHrReportType] = useState("hr-summary");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [financialData, setFinancialData] = useState(null);
  const [hrData, setHrData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      if (reportCategory === "financial") {
        let response;

        if (financialReportType === "profit-loss") {
          response = await reportService.getProfitAndLoss(params);
        } else if (financialReportType === "balance-sheet") {
          response = await reportService.getBalanceSheet(params);
        } else if (financialReportType === "cash-flow") {
          response = await reportService.getCashFlow(params);
        } else if (financialReportType === "trial-balance") {
          response = await reportService.getTrialBalance(params);
        }

        setFinancialData(response?.data || null);
      } else {
        let response;

        if (hrReportType === "hr-summary") {
          response = await reportService.getHrSummary(params);
        }

        setHrData(response?.data || null);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
      setError(err?.response?.data?.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [reportCategory, financialReportType, hrReportType]);

  const financialSummaryCards = useMemo(() => {
    if (!financialData) return [];

    if (financialReportType === "profit-loss") {
      return [
        {
          label: "Total Income",
          value: formatMoney(financialData.totals?.totalIncome || 0),
          subtext: "Revenue accounts",
        },
        {
          label: "Total Expenses",
          value: formatMoney(financialData.totals?.totalExpenses || 0),
          subtext: "Expense accounts",
        },
        {
          label: "Net Profit",
          value: formatMoney(financialData.totals?.netProfit || 0),
          subtext: "Income minus expenses",
        },
      ];
    }

    if (financialReportType === "balance-sheet") {
      return [
        {
          label: "Assets",
          value: formatMoney(financialData.totals?.totalAssets || 0),
          subtext: "As of selected date",
        },
        {
          label: "Liabilities",
          value: formatMoney(financialData.totals?.totalLiabilities || 0),
          subtext: "As of selected date",
        },
        {
          label: "Equity",
          value: formatMoney(financialData.totals?.totalEquity || 0),
          subtext: "As of selected date",
        },
        {
          label: "L + E",
          value: formatMoney(
            financialData.totals?.totalLiabilitiesAndEquity || 0,
          ),
          subtext: "Liabilities plus equity",
        },
      ];
    }

    if (financialReportType === "cash-flow") {
      return [
        {
          label: "Operating",
          value: formatMoney(financialData.operating || 0),
          subtext: "Cash from operations",
        },
        {
          label: "Investing",
          value: formatMoney(financialData.investing || 0),
          subtext: "Investment movement",
        },
        {
          label: "Financing",
          value: formatMoney(financialData.financing || 0),
          subtext: "Funding movement",
        },
        {
          label: "Net Cash",
          value: formatMoney(financialData.netCashMovement || 0),
          subtext: "Overall cash movement",
        },
      ];
    }

    if (financialReportType === "trial-balance") {
      return [
        {
          label: "Total Debit",
          value: formatMoney(financialData.totals?.debit || 0),
          subtext: "Debit total",
        },
        {
          label: "Total Credit",
          value: formatMoney(financialData.totals?.credit || 0),
          subtext: "Credit total",
        },
        {
          label: "Difference",
          value: formatMoney(
            Number(financialData.totals?.debit || 0) -
              Number(financialData.totals?.credit || 0),
          ),
          subtext: "Should be zero",
        },
      ];
    }

    return [];
  }, [financialData, financialReportType]);

  return (
    <div className="space-y-6">
      <ReportsHeader />

      <ReportsTypeTabs
        reportCategory={reportCategory}
        setReportCategory={setReportCategory}
      />

      <ReportFilters
        reportCategory={reportCategory}
        financialReportType={financialReportType}
        setFinancialReportType={setFinancialReportType}
        hrReportType={hrReportType}
        setHrReportType={setHrReportType}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        onLoad={loadReports}
      />

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Loading report data...
        </div>
      ) : (
        <>
          {reportCategory === "financial" && (
            <>
              <SummaryReportCards cards={financialSummaryCards} />
              <FinancialReportsPanel
                reportType={financialReportType}
                data={financialData}
                formatMoney={formatMoney}
              />
            </>
          )}

          {reportCategory === "hr" && <HrReportsPanel data={hrData} />}
        </>
      )}
    </div>
  );
}
