import type { ProjectAssumptions } from "../types/financial";

/** テスト・デモ用のサンプル前提条件。 */
export function createSampleAssumptions(): ProjectAssumptions {
  return {
    startYear: 2026,
    startMonth: 4,
    initialCash: 10_000_000,
    revenueLines: [
      {
        id: "rev-main",
        label: "メインプロダクト売上",
        category: "revenue",
        formula: { kind: "fixedGrowth", initialValue: 1_000_000, monthlyGrowthRate: 0.1 },
        overrides: {},
      },
    ],
    variableCostLines: [
      {
        id: "cogs",
        label: "売上原価",
        category: "variableCost",
        formula: { kind: "percentOfRevenue", percent: 0.3 },
        overrides: {},
      },
    ],
    fixedCostLines: [
      {
        id: "rent",
        label: "地代家賃",
        category: "fixedCost",
        formula: { kind: "fixedAmount", monthlyAmount: 200_000 },
        overrides: {},
      },
    ],
    personnelCostLines: [
      {
        id: "salary",
        label: "人件費",
        category: "personnelCost",
        formula: {
          kind: "headcountCost",
          headcountByMonth: [{ fromMonth: 0, count: 2 }],
          avgMonthlySalary: 400_000,
        },
        overrides: {},
      },
    ],
    fundingRounds: [
      { id: "seed", label: "シードラウンド", monthIndex: 6, amount: 30_000_000 },
    ],
    tax: { rate: 0.3 },
  };
}
