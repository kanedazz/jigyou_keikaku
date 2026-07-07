import type { DisplayProjection } from "../types/statements";
import type { StatementRow } from "../components/statements/StatementTable";

export function buildPLRows(display: DisplayProjection): StatementRow[] {
  return [
    { key: "revenue", label: "売上高", values: display.pl.map((p) => p.revenue) },
    { key: "variableCost", label: "変動費（原価）", values: display.pl.map((p) => p.variableCost) },
    {
      key: "grossProfit",
      label: "売上総利益",
      values: display.pl.map((p) => p.grossProfit),
      strong: true,
    },
    { key: "personnelCost", label: "人件費", values: display.pl.map((p) => p.personnelCost) },
    { key: "fixedCost", label: "固定費", values: display.pl.map((p) => p.fixedCost) },
    {
      key: "operatingProfit",
      label: "営業利益",
      values: display.pl.map((p) => p.operatingProfit),
      strong: true,
    },
    { key: "taxExpense", label: "法人税等", values: display.pl.map((p) => p.taxExpense) },
    {
      key: "netIncome",
      label: "当期純利益",
      values: display.pl.map((p) => p.netIncome),
      strong: true,
    },
  ];
}

export function buildBSRows(display: DisplayProjection): StatementRow[] {
  return [
    {
      key: "totalAssets",
      label: "資産合計（現金）",
      values: display.bs.map((b) => b.totalAssets),
      strong: true,
    },
    {
      key: "capitalStock",
      label: "資本金（累計調達額）",
      values: display.bs.map((b) => b.capitalStock),
    },
    {
      key: "retainedEarnings",
      label: "利益剰余金（累計純利益）",
      values: display.bs.map((b) => b.retainedEarnings),
    },
    {
      key: "totalLiabilitiesAndEquity",
      label: "負債・純資産合計",
      values: display.bs.map((b) => b.totalLiabilitiesAndEquity),
      strong: true,
    },
  ];
}

export function buildCFRows(display: DisplayProjection): StatementRow[] {
  return [
    {
      key: "operatingCF",
      label: "営業キャッシュフロー",
      values: display.cf.map((c) => c.operatingCF),
    },
    {
      key: "financingCF",
      label: "財務キャッシュフロー（調達）",
      values: display.cf.map((c) => c.financingCF),
    },
    {
      key: "netCashFlow",
      label: "現金純増減",
      values: display.cf.map((c) => c.netCashFlow),
      strong: true,
    },
    {
      key: "beginningCash",
      label: "期首現金残高",
      values: display.cf.map((c) => c.beginningCash),
    },
    {
      key: "endingCash",
      label: "期末現金残高",
      values: display.cf.map((c) => c.endingCash),
      strong: true,
    },
  ];
}
