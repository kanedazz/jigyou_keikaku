import { describe, expect, it } from "vitest";
import { TOTAL_MONTHS } from "../types/financial";
import { buildDisplayPeriods, buildDisplayProjection, monthIndexToCalendar } from "./aggregate";
import { calculateModel } from "./calculateModel";
import { createSampleAssumptions } from "./testFixtures";

describe("monthIndexToCalendar", () => {
  it("開始年月からの経過月を正しく計算する", () => {
    expect(monthIndexToCalendar(2026, 4, 0)).toEqual({ year: 2026, month: 4 });
    expect(monthIndexToCalendar(2026, 4, 8)).toEqual({ year: 2026, month: 12 });
    expect(monthIndexToCalendar(2026, 4, 9)).toEqual({ year: 2027, month: 1 });
  });
});

describe("buildDisplayPeriods", () => {
  it("1〜3年目は月次36本、4〜5年目は年次2本になる", () => {
    const assumptions = createSampleAssumptions();
    const periods = buildDisplayPeriods(assumptions);
    const monthly = periods.filter((p) => p.granularity === "monthly");
    const annual = periods.filter((p) => p.granularity === "annual");
    expect(monthly).toHaveLength(36);
    expect(annual).toHaveLength(2);
    expect(annual[0].monthIndexes).toHaveLength(12);
    expect(annual[1].monthIndexes).toHaveLength(12);

    const allMonthIndexes = periods.flatMap((p) => p.monthIndexes);
    expect(allMonthIndexes).toHaveLength(TOTAL_MONTHS);
    expect(new Set(allMonthIndexes).size).toBe(TOTAL_MONTHS);
  });
});

describe("buildDisplayProjection", () => {
  it("年次PLは12ヶ月分の合算、年次BSは期末残高になる", () => {
    const assumptions = createSampleAssumptions();
    const result = calculateModel(assumptions);
    const display = buildDisplayProjection(result, assumptions);

    const year4Period = display.periods.find((p) => p.key === "y4")!;
    const year4Index = display.periods.indexOf(year4Period);

    const expectedRevenueSum = year4Period.monthIndexes.reduce(
      (total, idx) => total + result.pl[idx].revenue,
      0,
    );
    expect(display.pl[year4Index].revenue).toBeCloseTo(expectedRevenueSum, 6);

    const lastMonthIdx = year4Period.monthIndexes[year4Period.monthIndexes.length - 1];
    expect(display.bs[year4Index].cash).toBeCloseTo(result.bs[lastMonthIdx].cash, 6);
  });
});
