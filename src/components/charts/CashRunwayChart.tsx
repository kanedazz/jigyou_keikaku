import {
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MONTHLY_DISPLAY_MONTHS } from "../../types/financial";
import { useModelCalculation } from "../../hooks/useModelCalculation";
import { formatYen, formatYenCompact } from "../../utils/format";

export function CashRunwayChart() {
  const { display } = useModelCalculation();

  const data = display.periods.map((period, i) => ({
    name: period.label,
    現金残高: display.cf[i].endingCash,
  }));

  const defaultEndIndex = Math.min(MONTHLY_DISPLAY_MONTHS - 1, data.length - 1);

  return (
    <div>
      <h3 className="statement-heading">現金残高の推移</h3>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 24 }}>
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
          <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" label="資金ショート" />
          <Line dataKey="現金残高" stroke="#16a34a" strokeWidth={2} dot={false} />
          <Brush
            dataKey="name"
            height={24}
            startIndex={0}
            endIndex={defaultEndIndex}
            travellerWidth={8}
            stroke="#16a34a"
            tickFormatter={() => ""}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
