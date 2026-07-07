/**
 * 計算結果（出力）まわりの型定義。
 */

import type { MonthIndex } from "./financial";

export interface MonthlyPL {
  monthIndex: MonthIndex;
  revenue: number;
  variableCost: number;
  grossProfit: number;
  personnelCost: number;
  fixedCost: number;
  operatingProfit: number;
  taxExpense: number;
  netIncome: number;
}

export interface MonthlyBS {
  monthIndex: MonthIndex;
  cash: number;
  totalAssets: number;
  /** 資本金（累計調達額） */
  capitalStock: number;
  /** 利益剰余金（累計純利益） */
  retainedEarnings: number;
  totalLiabilitiesAndEquity: number;
}

export interface MonthlyCF {
  monthIndex: MonthIndex;
  /** 営業CF（簡易方式：純利益をそのまま採用。減価償却・運転資金調整はMVP対象外） */
  operatingCF: number;
  /** 財務CF（当月の資金調達額） */
  financingCF: number;
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
}

export interface RunwayInfo {
  /** 資金がマイナスになる最初の月インデックス。ショートしない場合は null。 */
  cashOutMonthIndex: MonthIndex | null;
  /** 直近3ヶ月平均バーンレートに基づく残ランウェイ月数。黒字化済み等で計算不能なら null。 */
  monthsRemaining: number | null;
}

export interface ProjectionResult {
  pl: MonthlyPL[];
  bs: MonthlyBS[];
  cf: MonthlyCF[];
  runway: RunwayInfo;
}

/** 表示用に集計した1期間分（月次 or 年次） */
export interface DisplayPeriod {
  key: string;
  label: string;
  granularity: "monthly" | "annual";
  /** この表示期間に対応する内部月インデックスの範囲 */
  monthIndexes: MonthIndex[];
}

export interface DisplayPL extends Omit<MonthlyPL, "monthIndex"> {
  period: DisplayPeriod;
}

export interface DisplayBS extends Omit<MonthlyBS, "monthIndex"> {
  period: DisplayPeriod;
}

export interface DisplayCF extends Omit<MonthlyCF, "monthIndex"> {
  period: DisplayPeriod;
}

export interface DisplayProjection {
  periods: DisplayPeriod[];
  pl: DisplayPL[];
  bs: DisplayBS[];
  cf: DisplayCF[];
}
