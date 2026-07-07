import type { ProjectAssumptions } from "../types/financial";
import type { MonthlyBS, MonthlyCF, MonthlyPL } from "../types/statements";

/**
 * 簡易貸借対照表。
 * MVPスコープでは現金以外の資産・負債（売掛金、在庫、借入金など）を持たないため、
 * 資産＝現金、純資産＝資本金（累計調達額＋初期現金）＋利益剰余金（累計純利益）となる。
 */
export function calculateBS(
  pl: MonthlyPL[],
  cf: MonthlyCF[],
  assumptions: ProjectAssumptions,
): MonthlyBS[] {
  const result: MonthlyBS[] = [];
  let cumulativeCapital = assumptions.initialCash;
  let cumulativeRetainedEarnings = 0;

  for (let i = 0; i < pl.length; i++) {
    const monthPL = pl[i];
    const monthCF = cf[i];

    const fundingThisMonth = assumptions.fundingRounds
      .filter((round) => round.monthIndex === monthPL.monthIndex)
      .reduce((total, round) => total + round.amount, 0);
    cumulativeCapital += fundingThisMonth;
    cumulativeRetainedEarnings += monthPL.netIncome;

    result.push({
      monthIndex: monthPL.monthIndex,
      cash: monthCF.endingCash,
      totalAssets: monthCF.endingCash,
      capitalStock: cumulativeCapital,
      retainedEarnings: cumulativeRetainedEarnings,
      totalLiabilitiesAndEquity: cumulativeCapital + cumulativeRetainedEarnings,
    });
  }

  return result;
}
