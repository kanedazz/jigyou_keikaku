import { describe, expect, it } from "vitest";
import type { LineItem } from "../types/financial";
import { resolveLineItem, sumLineItems } from "./formulas";

describe("resolveLineItem", () => {
  it("fixedGrowth: 月次成長率で複利成長する", () => {
    const item: LineItem = {
      id: "a",
      label: "a",
      category: "revenue",
      formula: { kind: "fixedGrowth", initialValue: 100, monthlyGrowthRate: 0.1 },
      overrides: {},
    };
    expect(resolveLineItem(item, 0)).toBeCloseTo(100);
    expect(resolveLineItem(item, 1)).toBeCloseTo(110);
    expect(resolveLineItem(item, 2)).toBeCloseTo(121);
  });

  it("perUnit: 単価 × 件数で計算する", () => {
    const item: LineItem = {
      id: "b",
      label: "b",
      category: "revenue",
      formula: { kind: "perUnit", unitPrice: 1000, initialUnits: 10, unitsGrowthRate: 0 },
      overrides: {},
    };
    expect(resolveLineItem(item, 0)).toBe(10_000);
    expect(resolveLineItem(item, 5)).toBe(10_000);
  });

  it("percentOfRevenue: 売上合計に比率を掛ける", () => {
    const item: LineItem = {
      id: "c",
      label: "c",
      category: "variableCost",
      formula: { kind: "percentOfRevenue", percent: 0.3 },
      overrides: {},
    };
    expect(resolveLineItem(item, 0, { totalRevenueForMonth: 1000 })).toBe(300);
    expect(resolveLineItem(item, 0)).toBe(0);
  });

  it("headcountCost: 該当する人数区分の給与を計算する", () => {
    const item: LineItem = {
      id: "d",
      label: "d",
      category: "personnelCost",
      formula: {
        kind: "headcountCost",
        headcountByMonth: [
          { fromMonth: 0, count: 2 },
          { fromMonth: 6, count: 5 },
        ],
        avgMonthlySalary: 400_000,
      },
      overrides: {},
    };
    expect(resolveLineItem(item, 0)).toBe(800_000);
    expect(resolveLineItem(item, 5)).toBe(800_000);
    expect(resolveLineItem(item, 6)).toBe(2_000_000);
    expect(resolveLineItem(item, 100)).toBe(2_000_000);
  });

  it("fixedAmount: 常に一定額を返す", () => {
    const item: LineItem = {
      id: "e",
      label: "e",
      category: "fixedCost",
      formula: { kind: "fixedAmount", monthlyAmount: 50_000 },
      overrides: {},
    };
    expect(resolveLineItem(item, 0)).toBe(50_000);
    expect(resolveLineItem(item, 40)).toBe(50_000);
  });

  it("overrides: 上書きがある月はそちらを優先し、他の月は数式に従う", () => {
    const item: LineItem = {
      id: "f",
      label: "f",
      category: "revenue",
      formula: { kind: "fixedGrowth", initialValue: 100, monthlyGrowthRate: 0.1 },
      overrides: { 1: 999 },
    };
    expect(resolveLineItem(item, 0)).toBeCloseTo(100);
    expect(resolveLineItem(item, 1)).toBe(999);
    expect(resolveLineItem(item, 2)).toBeCloseTo(121);
  });
});

describe("sumLineItems", () => {
  it("複数のLineItemを合算する", () => {
    const items: LineItem[] = [
      {
        id: "a",
        label: "a",
        category: "fixedCost",
        formula: { kind: "fixedAmount", monthlyAmount: 100 },
        overrides: {},
      },
      {
        id: "b",
        label: "b",
        category: "fixedCost",
        formula: { kind: "fixedAmount", monthlyAmount: 200 },
        overrides: {},
      },
    ];
    expect(sumLineItems(items, 0)).toBe(300);
  });
});
