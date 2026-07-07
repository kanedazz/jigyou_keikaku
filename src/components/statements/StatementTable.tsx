import type { DisplayPeriod } from "../../types/statements";
import { formatYen } from "../../utils/format";
import "./StatementTable.css";

export interface StatementRow {
  key: string;
  label: string;
  values: number[];
  strong?: boolean;
  negative?: boolean;
}

interface Props {
  periods: DisplayPeriod[];
  rows: StatementRow[];
}

export function StatementTable({ periods, rows }: Props) {
  return (
    <div className="statement-table-wrapper">
      <table className="statement-table">
        <thead>
          <tr>
            <th className="label-col">項目</th>
            {periods.map((period) => (
              <th key={period.key} className={period.granularity === "annual" ? "annual-col" : ""}>
                {period.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className={row.strong ? "row-strong" : ""}>
              <td className="label-col">{row.label}</td>
              {row.values.map((value, i) => (
                <td
                  key={periods[i]?.key ?? i}
                  className={value < 0 ? "value-negative" : ""}
                >
                  {formatYen(value)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
