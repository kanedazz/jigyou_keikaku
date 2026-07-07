import { describe, expect, it } from "vitest";
import { TOTAL_MONTHS } from "../types/financial";
import { calculateModel } from "./calculateModel";
import { createSampleAssumptions } from "./testFixtures";

describe("calculateModel", () => {
  it("60ヶ月分のP/L・B/S・CFを生成する", () => {
    const result = calculateModel(createSampleAssumptions());
    expect(result.pl).toHaveLength(TOTAL_MONTHS);
    expect(result.bs).toHaveLength(TOTAL_MONTHS);
    expect(result.cf).toHaveLength(TOTAL_MONTHS);
  });

  it("B/Sは常にバランスする（資産＝資本金＋利益剰余金）", () => {
    const result = calculateModel(createSampleAssumptions());
    for (const month of result.bs) {
      expect(month.totalAssets).toBeCloseTo(month.totalLiabilitiesAndEquity, 6);
    }
  });

  it("調達ラウンドの月にキャッシュが増加する", () => {
    const assumptions = createSampleAssumptions();
    const result = calculateModel(assumptions);
    const round = assumptions.fundingRounds[0];
    const cfMonth = result.cf[round.monthIndex];
    expect(cfMonth.financingCF).toBe(round.amount);
    expect(cfMonth.endingCash).toBeCloseTo(cfMonth.beginningCash + cfMonth.netCashFlow, 6);
  });

  it("初月の現金は初期現金＋純利益（当月調達なしの場合）に一致する", () => {
    const assumptions = createSampleAssumptions();
    const result = calculateModel(assumptions);
    const month0 = result.cf[0];
    expect(month0.beginningCash).toBe(assumptions.initialCash);
    expect(month0.endingCash).toBeCloseTo(
      assumptions.initialCash + result.pl[0].netIncome,
      6,
    );
  });

  it("赤字が続き資金ショートする場合、cashOutMonthIndexが検出される", () => {
    const assumptions = createSampleAssumptions();
    assumptions.fundingRounds = []; // 調達なしでショートさせる
    assumptions.revenueLines[0].formula = {
      kind: "fixedGrowth",
      initialValue: 0,
      monthlyGrowthRate: 0,
    };
    const result = calculateModel(assumptions);
    expect(result.runway.cashOutMonthIndex).not.toBeNull();
    if (result.runway.cashOutMonthIndex !== null) {
      expect(result.cf[result.runway.cashOutMonthIndex].endingCash).toBeLessThan(0);
    }
  });

  it("黒字運営の場合、monthsRemainingはnull（ランウェイ無制限）", () => {
    const assumptions = createSampleAssumptions();
    assumptions.revenueLines[0].formula = {
      kind: "fixedGrowth",
      initialValue: 10_000_000,
      monthlyGrowthRate: 0,
    };
    const result = calculateModel(assumptions);
    expect(result.runway.monthsRemaining).toBeNull();
  });
});
