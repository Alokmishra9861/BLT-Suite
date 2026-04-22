import HRSummaryCards from "./HRSummaryCards";
import HRReportTable from "./HRReportTable";

export default function HrReportsPanel({ data }) {
  if (!data) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
        No HR data found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HRSummaryCards data={data} />
      <HRReportTable data={data} />
    </div>
  );
}
