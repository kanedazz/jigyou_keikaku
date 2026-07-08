import {
  Bar,
  Brush,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MONTHLY_DISPLAY_MONTHS } from "../../types/financial";
import { useModelCalculation } from "../../hooks/useModelCalculation";
import { formatYen, formatYenCompact } from "../../utils/format";

export function RevenueProfitChart() {
  const { display } = useModelCalculation();

  // 4〜5年目は月次ではなく年間合計値のため、そのまま月次値と並べると
  // 直前の月の約12倍の高さになってしまう。月平均に正規化して単位を揃える。
  const data = display.periods.map((period, i) => {
    const isAnnual = period.granularity === "annual";
    const monthCount = period.monthIndexes.length || 1;
    return {
      name: isAnnual ? `${period.label}（月平均）` : period.label,
      売上高: isAnnual ? display.pl[i].revenue / monthCount : display.pl[i].revenue,
      営業利益: isAnnual
        ? display.pl[i].operatingProfit / monthCount
        : display.pl[i].operatingProfit,
    };
  });

  const defaultEndIndex = Math.min(MONTHLY_DISPLAY_MONTHS - 1, data.length - 1);

  return (
    <div>
      <h3 className="statement-heading">売上・営業利益の推移</h3>
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10 }}
            interval={2}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis tickFormatter={(v) => formatYenCompact(Number(v))} tick={{ fontSize: 10 }} width={60} />
          <Tooltip formatter={(v) => `${formatYen(Number(v))}円`} />
          <Legend />
          <Bar dataKey="売上高" fill="#93c5fd" />
          <Line dataKey="営業利益" stroke="#2563eb" strokeWidth={2} dot={false} />
          <Brush
            dataKey="name"
            height={24}
            startIndex={0}
            endIndex={defaultEndIndex}
            travellerWidth={8}
            stroke="#2563eb"
            tickFormatter={() => ""}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
