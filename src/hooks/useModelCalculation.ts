import { useMemo } from "react";
import { buildDisplayProjection } from "../engine/aggregate";
import { calculateModel } from "../engine/calculateModel";
import { useProjectStore } from "../store/useProjectStore";

export function useModelCalculation() {
  const assumptions = useProjectStore((state) => state.assumptions);

  return useMemo(() => {
    const result = calculateModel(assumptions);
    const display = buildDisplayProjection(result, assumptions);
    return { assumptions, result, display };
  }, [assumptions]);
}
