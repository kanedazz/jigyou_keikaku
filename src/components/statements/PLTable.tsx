import { useModelCalculation } from "../../hooks/useModelCalculation";
import { buildPLRows } from "../../utils/statementRows";
import { StatementTable } from "./StatementTable";

export function PLTable() {
  const { display } = useModelCalculation();

  return (
    <div>
      <h3 className="statement-heading">予想損益計算書（P/L）</h3>
      <StatementTable periods={display.periods} rows={buildPLRows(display)} />
    </div>
  );
}
