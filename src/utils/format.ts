const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 0,
});

export function formatYen(value: number): string {
  if (!Number.isFinite(value)) return "-";
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "△" : "";
  return `${sign}${currencyFormatter.format(Math.abs(rounded))}`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatMonths(value: number | null): string {
  if (value === null) return "無制限";
  if (!Number.isFinite(value)) return "-";
  return `${value.toFixed(1)}ヶ月`;
}
