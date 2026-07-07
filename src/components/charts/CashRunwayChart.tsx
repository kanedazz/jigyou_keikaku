import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useModelCalculation } from "../../hooks/useModelCalculation";
import { formatYen } from "../../utils/format";

export function CashRunwayChart() {
  const { display } = useModelCalculation();

  const data = display.periods.map((period, i) => ({
    name: period.label,
    現金残高: display.cf[i].endingCash,
  }));

  return (
    <div>
      <h3 className="statement-heading">現金残高の推移</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={2} />
          <YAxis tickFormatter={(v) => formatYen(Number(v))} tick={{ fontSize: 10 }} width={80} />
          <Tooltip formatter={(v) => `${formatYen(Number(v))}円`} />
          <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" label="資金ショート" />
          <Line dataKey="現金残高" stroke="#16a34a" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
