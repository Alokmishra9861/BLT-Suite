export const formatCurrency = (value, currency = "USD") => {
  if (value == null) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US").format(new Date(value));
};
