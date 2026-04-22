// Badge component for displaying status or type indicators
export default function Badge({ value, className = "" }) {
  if (!value) return null;

  const normalizedValue = String(value).toLowerCase();
  const classes = `pr-badge pr-badge-${normalizedValue} ${className}`;

  return <span className={classes}>{value}</span>;
}
