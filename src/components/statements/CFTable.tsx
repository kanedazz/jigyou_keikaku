import { useModelCalculation } from "../../hooks/useModelCalculation";
import { buildCFRows } from "../../utils/statementRows";
import { StatementTable } from "./StatementTable";

export function CFTable() {
  const { display } = useModelCalculation();

  return (
    <div>
      <h3 className="statement-heading">予想キャッシュフロー計算書（C/F）</h3>
      <StatementTable periods={display.periods} rows={buildCFRows(display)} />
    </div>
  );
}
