const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("ja-JP", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatYen(value: number): string {
  if (!Number.isFinite(value)) return "-";
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "△" : "";
  return `${sign}${currencyFormatter.format(Math.abs(rounded))}`;
}

/**
 * グラフの軸目盛り用に短縮表記（万・億・兆）で金額をフォーマットする。
 * 数値の桁数が大きい場合でも軸ラベルが枠からはみ出さないようにするため。
 */
export function formatYenCompact(value: number): string {
  if (!Number.isFinite(value)) return "-";
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "△" : "";
  return `${sign}${compactCurrencyFormatter.format(Math.abs(rounded))}`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatMonths(value: number | null): string {
  if (value === null) return "無制限";
  if (!Number.isFinite(value)) return "-";
  return `${value.toFixed(1)}ヶ月`;
}
