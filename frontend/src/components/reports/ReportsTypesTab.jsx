export default function ReportsTypeTabs({ reportCategory, setReportCategory }) {
  const tabs = [
    {
      key: "financial",
      title: "Financial Reports",
      desc: "Profit & Loss, Balance Sheet, Cash Flow, Trial Balance",
    },
    {
      key: "hr",
      title: "HR Reports",
      desc: "Employees, leave, payroll summary",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {tabs.map((tab) => {
        const active = reportCategory === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => setReportCategory(tab.key)}
            className={`rounded-[24px] border p-5 text-left transition-all duration-200 ${
              active
                ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                : "border-slate-200 bg-white text-slate-900 shadow-sm hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">{tab.title}</h3>
                <p
                  className={`mt-2 text-sm ${active ? "text-slate-200" : "text-slate-500"}`}
                >
                  {tab.desc}
                </p>
              </div>

              <div
                className={`h-4 w-4 rounded-full border-4 ${
                  active
                    ? "border-white bg-white"
                    : "border-slate-300 bg-transparent"
                }`}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
