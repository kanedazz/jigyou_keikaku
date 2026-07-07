import { useModelCalculation } from "../../hooks/useModelCalculation";
import { buildBSRows } from "../../utils/statementRows";
import { StatementTable } from "./StatementTable";

export function BSTable() {
  const { display } = useModelCalculation();

  return (
    <div>
      <h3 className="statement-heading">予想貸借対照表（B/S）</h3>
      <p className="statement-note">
        ※MVPでは現金以外の資産・負債（売掛金・在庫・借入金等）は扱わないため、資産＝現金となります。
      </p>
      <StatementTable periods={display.periods} rows={buildBSRows(display)} />
    </div>
  );
}
