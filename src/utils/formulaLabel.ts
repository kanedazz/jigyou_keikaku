import type { FormulaType } from "../types/financial";
import { formatPercent, formatYen } from "./format";

export const FORMULA_KIND_LABELS: Record<FormulaType["kind"], string> = {
  fixedGrowth: "初期値＋月次成長率",
  perUnit: "単価×件数（成長率）",
  percentOfRevenue: "売上に対する比率",
  headcountCost: "人数×平均給与",
  fixedAmount: "毎月固定額",
};

export function describeFormula(formula: FormulaType, startMonth: number = 0): string {
  const base = describeFormulaBase(formula);
  if (formula.kind !== "headcountCost" && startMonth > 0) {
    return `${base}（${startMonth + 1}ヶ月目から発生）`;
  }
  return base;
}

function describeFormulaBase(formula: FormulaType): string {
  switch (formula.kind) {
    case "fixedGrowth":
      return `初月${formatYen(formula.initialValue)}円 / 月次成長率${formatPercent(formula.monthlyGrowthRate)}`;
    case "perUnit":
      return `単価${formatYen(formula.unitPrice)}円 × 初月${formula.initialUnits}件 / 件数成長率${formatPercent(formula.unitsGrowthRate)}`;
    case "percentOfRevenue":
      return `売上の${formatPercent(formula.percent)}`;
    case "headcountCost":
      return `平均給与${formatYen(formula.avgMonthlySalary)}円 / ${formula.headcountByMonth
        .map((h) => `${h.fromMonth + 1}ヶ月目〜${h.count}人`)
        .join("、")}`;
    case "fixedAmount":
      return `毎月${formatYen(formula.monthlyAmount)}円`;
  }
}

export function defaultFormulaFor(kind: FormulaType["kind"]): FormulaType {
  switch (kind) {
    case "fixedGrowth":
      return { kind, initialValue: 0, monthlyGrowthRate: 0 };
    case "perUnit":
      return { kind, unitPrice: 0, initialUnits: 0, unitsGrowthRate: 0 };
    case "percentOfRevenue":
      return { kind, percent: 0 };
    case "headcountCost":
      return { kind, headcountByMonth: [{ fromMonth: 0, count: 0 }], avgMonthlySalary: 0 };
    case "fixedAmount":
      return { kind, monthlyAmount: 0 };
  }
}
