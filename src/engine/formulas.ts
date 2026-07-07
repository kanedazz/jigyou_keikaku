import type { FormulaType, LineItem, MonthIndex } from "../types/financial";

export interface FormulaContext {
  /** percentOfRevenue 系の計算に使う、その月の売上合計 */
  totalRevenueForMonth?: number;
}

function resolveFormula(
  formula: FormulaType,
  monthIndex: MonthIndex,
  ctx: FormulaContext,
): number {
  switch (formula.kind) {
    case "fixedGrowth":
      return (
        formula.initialValue *
        Math.pow(1 + formula.monthlyGrowthRate, monthIndex)
      );
    case "perUnit": {
      const units =
        formula.initialUnits * Math.pow(1 + formula.unitsGrowthRate, monthIndex);
      return units * formula.unitPrice;
    }
    case "percentOfRevenue":
      return (ctx.totalRevenueForMonth ?? 0) * formula.percent;
    case "headcountCost": {
      const count = resolveHeadcount(formula.headcountByMonth, monthIndex);
      return count * formula.avgMonthlySalary;
    }
    case "fixedAmount":
      return formula.monthlyAmount;
    default: {
      const _exhaustive: never = formula;
      return _exhaustive;
    }
  }
}

function resolveHeadcount(
  headcountByMonth: { fromMonth: MonthIndex; count: number }[],
  monthIndex: MonthIndex,
): number {
  const applicable = [...headcountByMonth]
    .filter((entry) => entry.fromMonth <= monthIndex)
    .sort((a, b) => b.fromMonth - a.fromMonth);
  return applicable.length > 0 ? applicable[0].count : 0;
}

/** 上書き値があればそれを優先し、なければ数式から算出する。 */
export function resolveLineItem(
  item: LineItem,
  monthIndex: MonthIndex,
  ctx: FormulaContext = {},
): number {
  const override = item.overrides[monthIndex];
  if (override !== undefined) {
    return override;
  }
  return resolveFormula(item.formula, monthIndex, ctx);
}

export function sumLineItems(
  items: LineItem[],
  monthIndex: MonthIndex,
  ctx: FormulaContext = {},
): number {
  return items.reduce((total, item) => total + resolveLineItem(item, monthIndex, ctx), 0);
}

/**
 * 年次表示列（4〜5年目）のセルを編集した際、その年12ヶ月に均等分配して
 * overrides に書き込むための値を計算するヘルパー。
 */
export function distributeAnnualOverride(
  annualTotal: number,
  monthCount: number,
): number {
  return annualTotal / monthCount;
}
