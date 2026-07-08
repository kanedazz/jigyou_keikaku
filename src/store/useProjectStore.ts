import { create } from "zustand";
import { persist } from "zustand/middleware";
import { distributeAnnualOverride } from "../engine/formulas";
import { createSampleAssumptions } from "../engine/testFixtures";
import type {
  FormulaType,
  FundingRound,
  LineItem,
  LineItemCategory,
  MonthIndex,
  ProjectAssumptions,
} from "../types/financial";
import type { DisplayPeriod } from "../types/statements";
import { migrateAssumptions, STORAGE_KEY, STORAGE_VERSION } from "./persistence";

function emptyAssumptions(): ProjectAssumptions {
  return {
    startYear: new Date().getFullYear(),
    startMonth: new Date().getMonth() + 1,
    initialCash: 0,
    revenueLines: [],
    variableCostLines: [],
    fixedCostLines: [],
    personnelCostLines: [],
    fundingRounds: [],
    tax: { rate: 0.3 },
  };
}

function lineItemsKeyFor(category: LineItemCategory): keyof ProjectAssumptions {
  switch (category) {
    case "revenue":
      return "revenueLines";
    case "variableCost":
      return "variableCostLines";
    case "fixedCost":
      return "fixedCostLines";
    case "personnelCost":
      return "personnelCostLines";
  }
}

function updateLineItems(
  assumptions: ProjectAssumptions,
  category: LineItemCategory,
  updater: (items: LineItem[]) => LineItem[],
): ProjectAssumptions {
  const key = lineItemsKeyFor(category);
  return { ...assumptions, [key]: updater(assumptions[key] as LineItem[]) };
}

let nextId = 1;
function generateId(prefix: string): string {
  nextId += 1;
  return `${prefix}-${Date.now()}-${nextId}`;
}

interface ProjectState {
  assumptions: ProjectAssumptions;

  setStartDate: (year: number, month: number) => void;
  setInitialCash: (value: number) => void;
  setTaxRate: (rate: number) => void;

  addLineItem: (
    category: LineItemCategory,
    label: string,
    formula: FormulaType,
    startMonth?: MonthIndex,
  ) => void;
  removeLineItem: (category: LineItemCategory, itemId: string) => void;
  renameLineItem: (category: LineItemCategory, itemId: string, label: string) => void;
  updateLineItemFormula: (
    category: LineItemCategory,
    itemId: string,
    formula: FormulaType,
  ) => void;
  setLineItemStartMonth: (
    category: LineItemCategory,
    itemId: string,
    startMonth: MonthIndex,
  ) => void;

  /** 単一月のセルを直接上書きする（グリッドの月次列編集用） */
  setMonthlyOverride: (
    category: LineItemCategory,
    itemId: string,
    monthIndex: number,
    value: number | undefined,
  ) => void;
  /**
   * 表示期間（DisplayPeriod）単位でセルを編集する。
   * 月次列なら単一月の上書き、年次列（4〜5年目）ならその期間の月に均等分配して上書きする。
   */
  setCellValue: (
    category: LineItemCategory,
    itemId: string,
    period: DisplayPeriod,
    totalOrValue: number,
  ) => void;

  addFundingRound: (round: Omit<FundingRound, "id">) => void;
  updateFundingRound: (id: string, patch: Partial<Omit<FundingRound, "id">>) => void;
  removeFundingRound: (id: string) => void;

  loadSample: () => void;
  resetToEmpty: () => void;
  replaceAssumptions: (assumptions: ProjectAssumptions) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      assumptions: createSampleAssumptions(),

      setStartDate: (year, month) =>
        set((state) => ({
          assumptions: { ...state.assumptions, startYear: year, startMonth: month },
        })),

      setInitialCash: (value) =>
        set((state) => ({ assumptions: { ...state.assumptions, initialCash: value } })),

      setTaxRate: (rate) =>
        set((state) => ({
          assumptions: { ...state.assumptions, tax: { rate } },
        })),

      addLineItem: (category, label, formula, startMonth = 0) =>
        set((state) => ({
          assumptions: updateLineItems(state.assumptions, category, (items) => [
            ...items,
            { id: generateId(category), label, category, formula, startMonth, overrides: {} },
          ]),
        })),

      removeLineItem: (category, itemId) =>
        set((state) => ({
          assumptions: updateLineItems(state.assumptions, category, (items) =>
            items.filter((item) => item.id !== itemId),
          ),
        })),

      renameLineItem: (category, itemId, label) =>
        set((state) => ({
          assumptions: updateLineItems(state.assumptions, category, (items) =>
            items.map((item) => (item.id === itemId ? { ...item, label } : item)),
          ),
        })),

      updateLineItemFormula: (category, itemId, formula) =>
        set((state) => ({
          assumptions: updateLineItems(state.assumptions, category, (items) =>
            items.map((item) => (item.id === itemId ? { ...item, formula } : item)),
          ),
        })),

      setLineItemStartMonth: (category, itemId, startMonth) =>
        set((state) => ({
          assumptions: updateLineItems(state.assumptions, category, (items) =>
            items.map((item) => (item.id === itemId ? { ...item, startMonth } : item)),
          ),
        })),

      setMonthlyOverride: (category, itemId, monthIndex, value) =>
        set((state) => ({
          assumptions: updateLineItems(state.assumptions, category, (items) =>
            items.map((item) => {
              if (item.id !== itemId) return item;
              const overrides = { ...item.overrides };
              if (value === undefined) {
                delete overrides[monthIndex];
              } else {
                overrides[monthIndex] = value;
              }
              return { ...item, overrides };
            }),
          ),
        })),

      setCellValue: (category, itemId, period, totalOrValue) =>
        set((state) => ({
          assumptions: updateLineItems(state.assumptions, category, (items) =>
            items.map((item) => {
              if (item.id !== itemId) return item;
              const overrides = { ...item.overrides };
              if (period.granularity === "monthly") {
                overrides[period.monthIndexes[0]] = totalOrValue;
              } else {
                const perMonth = distributeAnnualOverride(
                  totalOrValue,
                  period.monthIndexes.length,
                );
                for (const monthIndex of period.monthIndexes) {
                  overrides[monthIndex] = perMonth;
                }
              }
              return { ...item, overrides };
            }),
          ),
        })),

      addFundingRound: (round) =>
        set((state) => ({
          assumptions: {
            ...state.assumptions,
            fundingRounds: [
              ...state.assumptions.fundingRounds,
              { ...round, id: generateId("funding") },
            ],
          },
        })),

      updateFundingRound: (id, patch) =>
        set((state) => ({
          assumptions: {
            ...state.assumptions,
            fundingRounds: state.assumptions.fundingRounds.map((round) =>
              round.id === id ? { ...round, ...patch } : round,
            ),
          },
        })),

      removeFundingRound: (id) =>
        set((state) => ({
          assumptions: {
            ...state.assumptions,
            fundingRounds: state.assumptions.fundingRounds.filter((round) => round.id !== id),
          },
        })),

      loadSample: () => set({ assumptions: createSampleAssumptions() }),
      resetToEmpty: () => set({ assumptions: emptyAssumptions() }),
      replaceAssumptions: (assumptions) => set({ assumptions }),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      partialize: (state) => ({ assumptions: state.assumptions }),
      migrate: (persistedState, version) => {
        const state = persistedState as { assumptions: ProjectAssumptions };
        if (state?.assumptions) {
          state.assumptions = migrateAssumptions(state.assumptions, version);
        }
        return state;
      },
    },
  ),
);
