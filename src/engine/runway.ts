import type { MonthlyCF } from "../types/statements";
import type { RunwayInfo } from "../types/statements";

const BURN_RATE_SAMPLE_MONTHS = 3;

/**
 * ランウェイ計算。
 * - cashOutMonthIndex: 60ヶ月の投影の中で実際に現金残高がマイナスに転じる最初の月
 *   （調達ラウンドや売上成長も加味した「実際の」資金ショート予測）。
 * - monthsRemaining: 直近の事業運営の初期バーンレート（直近3ヶ月の営業CF平均）を
 *   ベースにした「現状のペースで何ヶ月分の資金があるか」という簡易指標。
 *   営業CFが黒字（バーンなし）の場合は null（ランウェイ無制限）を返す。
 */
export function calculateRunway(cf: MonthlyCF[]): RunwayInfo {
  const cashOutEntry = cf.find((month) => month.endingCash < 0);
  const cashOutMonthIndex = cashOutEntry ? cashOutEntry.monthIndex : null;

  const sample = cf.slice(0, BURN_RATE_SAMPLE_MONTHS);
  const avgOperatingCF =
    sample.length > 0
      ? sample.reduce((total, month) => total + month.operatingCF, 0) / sample.length
      : 0;
  const burnRate = -avgOperatingCF;

  const initialCash = cf.length > 0 ? cf[0].beginningCash : 0;
  const monthsRemaining = burnRate > 0 ? initialCash / burnRate : null;

  return { cashOutMonthIndex, monthsRemaining };
}
