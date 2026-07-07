import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useModelCalculation } from "../../hooks/useModelCalculation";
import { formatYen } from "../../utils/format";

export function RevenueProfitChart() {
  const { display } = useModelCalculation();

  const data = display.periods.map((period, i) => ({
    name: period.label,
    売上高: display.pl[i].revenue,
    営業利益: display.pl[i].operatingProfit,
  }));

  return (
    <div>
      <h3 className="statement-heading">売上・営業利益の推移</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={2} />
          <YAxis tickFormatter={(v) => formatYen(Number(v))} tick={{ fontSize: 10 }} width={80} />
          <Tooltip formatter={(v) => `${formatYen(Number(v))}円`} />
          <Legend />
          <Bar dataKey="売上高" fill="#93c5fd" />
          <Line dataKey="営業利益" stroke="#2563eb" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
