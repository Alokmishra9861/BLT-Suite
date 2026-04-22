import React from "react";

export const InvoiceSummaryCards = ({ summary }) => {
  const cards = [
    {
      label: "Total Outstanding",
      value: summary?.totalOutstanding || 0,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Total Paid",
      value: summary?.totalPaid || 0,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Total Overdue",
      value: summary?.totalOverdue || 0,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`rounded-lg p-4 border border-gray-200 ${card.bgColor}`}
        >
          <p className="text-gray-600 text-sm font-medium mb-2">{card.label}</p>
          <p className={`text-2xl font-bold ${card.color}`}>
            ${card.value.toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
};
