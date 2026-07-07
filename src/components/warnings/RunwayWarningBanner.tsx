import { monthIndexToCalendar } from "../../engine/aggregate";
import { useModelCalculation } from "../../hooks/useModelCalculation";
import { formatMonths } from "../../utils/format";
import "./RunwayWarningBanner.css";

export function RunwayWarningBanner() {
  const { assumptions, result } = useModelCalculation();
  const { runway } = result;

  const isDanger = runway.cashOutMonthIndex !== null;

  let cashOutLabel: string | null = null;
  if (runway.cashOutMonthIndex !== null) {
    const { year, month } = monthIndexToCalendar(
      assumptions.startYear,
      assumptions.startMonth,
      runway.cashOutMonthIndex,
    );
    cashOutLabel = `${year}年${month}月`;
  }

  return (
    <div className={`runway-banner ${isDanger ? "danger" : "safe"}`}>
      <div className="runway-metric">
        <span className="runway-metric-label">現在のバーンレートに基づく残ランウェイ</span>
        <span className="runway-metric-value">{formatMonths(runway.monthsRemaining)}</span>
      </div>
      <div className="runway-status">
        {isDanger ? (
          <span>
            ⚠️ このままだと <strong>{cashOutLabel}</strong> に資金がショートする見込みです。調達計画やコストを見直してください。
          </span>
        ) : (
          <span>✅ 今後5年間の投影では資金ショートは発生しません。</span>
        )}
      </div>
    </div>
  );
}
