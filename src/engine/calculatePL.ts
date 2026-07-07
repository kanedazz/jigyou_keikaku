import { TOTAL_MONTHS, type ProjectAssumptions } from "../types/financial";
import type { MonthlyPL } from "../types/statements";
import { sumLineItems } from "./formulas";

export function calculatePL(assumptions: ProjectAssumptions): MonthlyPL[] {
  const result: MonthlyPL[] = [];

  for (let monthIndex = 0; monthIndex < TOTAL_MONTHS; monthIndex++) {
    const revenue = sumLineItems(assumptions.revenueLines, monthIndex);
    const variableCost = sumLineItems(assumptions.variableCostLines, monthIndex, {
      totalRevenueForMonth: revenue,
    });
    const grossProfit = revenue - variableCost;

    const personnelCost = sumLineItems(assumptions.personnelCostLines, monthIndex);
    const fixedCost = sumLineItems(assumptions.fixedCostLines, monthIndex);
    const operatingProfit = grossProfit - personnelCost - fixedCost;

    const taxExpense = operatingProfit > 0 ? operatingProfit * assumptions.tax.rate : 0;
    const netIncome = operatingProfit - taxExpense;

    result.push({
      monthIndex,
      revenue,
      variableCost,
      grossProfit,
      personnelCost,
      fixedCost,
      operatingProfit,
      taxExpense,
      netIncome,
    });
  }

  return result;
}
