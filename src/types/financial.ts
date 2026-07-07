/**
 * 前提条件（入力）まわりの型定義。
 *
 * モデルは常に内部的に60ヶ月（5年）を月次で保持する。
 * 表示上は 1〜3年目は月次36ヶ月、4〜5年目は年次2本に集計する（engine/aggregate.ts）。
 */

export const TOTAL_MONTHS = 60;
export const MONTHLY_DISPLAY_MONTHS = 36;
export const ANNUAL_DISPLAY_YEARS = 2;

/** 0始まりの月インデックス（0〜59）。monthIndex 0 が事業計画の初月。 */
export type MonthIndex = number;

export type LineItemCategory =
  | "revenue"
  | "variableCost"
  | "fixedCost"
  | "personnelCost";

/** 人数計画：fromMonth 以降、次のエントリの fromMonth 直前まで count 人を維持する。 */
export interface HeadcountEntry {
  fromMonth: MonthIndex;
  count: number;
}

export type FormulaType =
  | {
      kind: "fixedGrowth";
      /** 初月（monthIndex 0）の値 */
      initialValue: number;
      /** 月次成長率（0.05 = 5%） */
      monthlyGrowthRate: number;
    }
  | {
      kind: "perUnit";
      /** 単価 */
      unitPrice: number;
      /** 初月の件数 */
      initialUnits: number;
      /** 件数の月次成長率 */
      unitsGrowthRate: number;
    }
  | {
      kind: "percentOfRevenue";
      /** 売上合計に対する比率（原価率など。0.3 = 30%） */
      percent: number;
    }
  | {
      kind: "headcountCost";
      headcountByMonth: HeadcountEntry[];
      /** 1人あたり月次平均給与（社会保険料等込みの目安） */
      avgMonthlySalary: number;
    }
  | {
      kind: "fixedAmount";
      monthlyAmount: number;
    };

export interface LineItem {
  id: string;
  label: string;
  category: LineItemCategory;
  formula: FormulaType;
  /** セル直接編集による上書き値。monthIndex -> 値。 */
  overrides: Partial<Record<MonthIndex, number>>;
}

export interface FundingRound {
  id: string;
  label: string;
  monthIndex: MonthIndex;
  amount: number;
}

export interface TaxSettings {
  /** 法人税等の実効税率（0.30 = 30%） */
  rate: number;
}

export interface ProjectAssumptions {
  /** 事業計画の開始年月（表示用） */
  startYear: number;
  startMonth: number;
  /** 初期現金（資本金として払い込まれた分を含む、期首の現金残高） */
  initialCash: number;
  revenueLines: LineItem[];
  variableCostLines: LineItem[];
  fixedCostLines: LineItem[];
  personnelCostLines: LineItem[];
  fundingRounds: FundingRound[];
  tax: TaxSettings;
}

export const LINE_ITEM_CATEGORIES: { value: LineItemCategory; label: string }[] = [
  { value: "revenue", label: "売上" },
  { value: "variableCost", label: "変動費" },
  { value: "fixedCost", label: "固定費" },
  { value: "personnelCost", label: "人件費" },
];
