import type { ProjectAssumptions } from "../types/financial";
import type { ProjectionResult } from "../types/statements";
import { calculateBS } from "./calculateBS";
import { calculateCF } from "./calculateCF";
import { calculatePL } from "./calculatePL";
import { calculateRunway } from "./runway";

export function calculateModel(assumptions: ProjectAssumptions): ProjectionResult {
  const pl = calculatePL(assumptions);
  const cf = calculateCF(pl, assumptions);
  const bs = calculateBS(pl, cf, assumptions);
  const runway = calculateRunway(cf);

  return { pl, bs, cf, runway };
}
