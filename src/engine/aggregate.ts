import {
  MONTHLY_DISPLAY_MONTHS,
  TOTAL_MONTHS,
  type ProjectAssumptions,
} from "../types/financial";
import type {
  DisplayBS,
  DisplayCF,
  DisplayPeriod,
  DisplayPL,
  DisplayProjection,
  MonthlyBS,
  MonthlyCF,
  MonthlyPL,
  ProjectionResult,
} from "../types/statements";

export function monthIndexToCalendar(
  startYear: number,
  startMonth: number,
  monthIndex: number,
): { year: number; month: number } {
  const zeroBasedMonth = startMonth - 1 + monthIndex;
  const year = startYear + Math.floor(zeroBasedMonth / 12);
  const month = (zeroBasedMonth % 12) + 1;
  return { year, month };
}

/**
 * 表示期間の定義を組み立てる。
 * 1〜3年目（monthIndex 0〜35）は月次、4〜5年目（36〜59）は年次にまとめる。
 */
export function buildDisplayPeriods(assumptions: ProjectAssumptions): DisplayPeriod[] {
  const periods: DisplayPeriod[] = [];

  for (let monthIndex = 0; monthIndex < MONTHLY_DISPLAY_MONTHS; monthIndex++) {
    const { year, month } = monthIndexToCalendar(
      assumptions.startYear,
      assumptions.startMonth,
      monthIndex,
    );
    periods.push({
      key: `m${monthIndex}`,
      label: `${year}年${month}月`,
      granularity: "monthly",
      monthIndexes: [monthIndex],
    });
  }

  const remainingMonths = TOTAL_MONTHS - MONTHLY_DISPLAY_MONTHS;
  const annualYears = Math.ceil(remainingMonths / 12);
  for (let yearOffset = 0; yearOffset < annualYears; yearOffset++) {
    const startIdx = MONTHLY_DISPLAY_MONTHS + yearOffset * 12;
    const endIdx = Math.min(startIdx + 12, TOTAL_MONTHS);
    const monthIndexes = Array.from(
      { length: endIdx - startIdx },
      (_, i) => startIdx + i,
    );
    const yearNumber = MONTHLY_DISPLAY_MONTHS / 12 + yearOffset + 1;
    periods.push({
      key: `y${yearNumber}`,
      label: `${yearNumber}年目`,
      granularity: "annual",
      monthIndexes,
    });
  }

  return periods;
}

function sumBy<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((total, item) => total + selector(item), 0);
}

function aggregatePL(pl: MonthlyPL[], period: DisplayPeriod): DisplayPL {
  const rows = period.monthIndexes.map((idx) => pl[idx]);
  return {
    period,
    revenue: sumBy(rows, (r) => r.revenue),
    variableCost: sumBy(rows, (r) => r.variableCost),
    grossProfit: sumBy(rows, (r) => r.grossProfit),
    personnelCost: sumBy(rows, (r) => r.personnelCost),
    fixedCost: sumBy(rows, (r) => r.fixedCost),
    operatingProfit: sumBy(rows, (r) => r.operatingProfit),
    taxExpense: sumBy(rows, (r) => r.taxExpense),
    netIncome: sumBy(rows, (r) => r.netIncome),
  };
}

function aggregateBS(bs: MonthlyBS[], period: DisplayPeriod): DisplayBS {
  // B/Sは残高（ストック）なので、期間内の最終月の値を採用する。
  const lastIdx = period.monthIndexes[period.monthIndexes.length - 1];
  const last = bs[lastIdx];
  return {
    period,
    cash: last.cash,
    totalAssets: last.totalAssets,
    capitalStock: last.capitalStock,
    retainedEarnings: last.retainedEarnings,
    totalLiabilitiesAndEquity: last.totalLiabilitiesAndEquity,
  };
}

function aggregateCF(cf: MonthlyCF[], period: DisplayPeriod): DisplayCF {
  const rows = period.monthIndexes.map((idx) => cf[idx]);
  const firstIdx = period.monthIndexes[0];
  const lastIdx = period.monthIndexes[period.monthIndexes.length - 1];
  return {
    period,
    operatingCF: sumBy(rows, (r) => r.operatingCF),
    financingCF: sumBy(rows, (r) => r.financingCF),
    netCashFlow: sumBy(rows, (r) => r.netCashFlow),
    beginningCash: cf[firstIdx].beginningCash,
    endingCash: cf[lastIdx].endingCash,
  };
}

export function buildDisplayProjection(
  result: ProjectionResult,
  assumptions: ProjectAssumptions,
): DisplayProjection {
  const periods = buildDisplayPeriods(assumptions);
  return {
    periods,
    pl: periods.map((period) => aggregatePL(result.pl, period)),
    bs: periods.map((period) => aggregateBS(result.bs, period)),
    cf: periods.map((period) => aggregateCF(result.cf, period)),
  };
}
