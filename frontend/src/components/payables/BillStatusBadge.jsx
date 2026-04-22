import React from "react";
import Badge from "../common/Badge";

const billStatusColors = {
  draft: { bg: "#E5E7EB", text: "#374151" },
  approved: { bg: "#DBEAFE", text: "#1E40AF" },
  partially_paid: { bg: "#FEF3C7", text: "#92400E" },
  paid: { bg: "#D1FAE5", text: "#065F46" },
  overdue: { bg: "#FEE2E2", text: "#991B1B" },
  void: { bg: "#D1D5DB", text: "#374151" },
};

export const BillStatusBadge = ({ status }) => {
  const colors = billStatusColors[status] || billStatusColors.draft;
  return (
    <Badge
      label={status.replace("_", " ").toUpperCase()}
      bg={colors.bg}
      text={colors.text}
    />
  );
};
