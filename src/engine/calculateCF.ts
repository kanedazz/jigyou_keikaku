import type { ProjectAssumptions } from "../types/financial";
import type { MonthlyCF, MonthlyPL } from "../types/statements";

/**
 * 簡易キャッシュフロー計算書。
 * MVPスコープでは減価償却・運転資金（売掛金/買掛金/在庫）の調整を行わないため、
 * 営業CF = 純利益 とする。
 */
export function calculateCF(
  pl: MonthlyPL[],
  assumptions: ProjectAssumptions,
): MonthlyCF[] {
  const result: MonthlyCF[] = [];
  let cash = assumptions.initialCash;

  for (const monthPL of pl) {
    const beginningCash = cash;
    const operatingCF = monthPL.netIncome;
    const financingCF = assumptions.fundingRounds
      .filter((round) => round.monthIndex === monthPL.monthIndex)
      .reduce((total, round) => total + round.amount, 0);
    const netCashFlow = operatingCF + financingCF;
    const endingCash = beginningCash + netCashFlow;
    cash = endingCash;

    result.push({
      monthIndex: monthPL.monthIndex,
      operatingCF,
      financingCF,
      netCashFlow,
      beginningCash,
      endingCash,
    });
  }

  return result;
}
