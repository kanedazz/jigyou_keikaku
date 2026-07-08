import type { LineItem, MonthIndex, ProjectAssumptions } from "../types/financial";

export const STORAGE_KEY = "jigyou-keikaku:project";
export const STORAGE_VERSION = 2;

/** バックアップファイルの識別子。誤って無関係なJSONを読み込むことを防ぐ。 */
export const BACKUP_APP_ID = "jigyou-keikaku";

/** ローカルにダウンロードするバックアップファイルの形式。 */
export interface BackupPayload {
  app: typeof BACKUP_APP_ID;
  version: number;
  exportedAt: string;
  assumptions: ProjectAssumptions;
}

/**
 * localStorageの永続化（zustand persist）とバックアップファイルの両方で使う
 * バージョン間マイグレーションの共通ロジック。
 */
export function migrateAssumptions(
  assumptions: ProjectAssumptions,
  fromVersion: number,
): ProjectAssumptions {
  let result = assumptions;
  if (fromVersion < 2) {
    type LegacyLineItem = Omit<LineItem, "startMonth"> & { startMonth?: MonthIndex };
    const withStartMonth = (items: LegacyLineItem[]): LineItem[] =>
      items.map((item) => ({ ...item, startMonth: item.startMonth ?? 0 }));
    result = {
      ...result,
      revenueLines: withStartMonth(result.revenueLines),
      variableCostLines: withStartMonth(result.variableCostLines),
      fixedCostLines: withStartMonth(result.fixedCostLines),
      personnelCostLines: withStartMonth(result.personnelCostLines),
    };
  }
  return result;
}

export function createBackupPayload(assumptions: ProjectAssumptions): BackupPayload {
  return {
    app: BACKUP_APP_ID,
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    assumptions,
  };
}

/** ダウンロードファイル名（例: jigyou-keikaku_2026-07-08_2117.json）を生成する。 */
export function createBackupFileName(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `jigyou-keikaku_${y}-${m}-${d}_${hh}${mm}.json`;
}

export class BackupParseError extends Error {}

/**
 * バックアップファイルのテキスト内容を検証・マイグレーションし、
 * 復元可能な ProjectAssumptions を取り出す。
 */
export function parseBackupFile(text: string): ProjectAssumptions {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new BackupParseError("ファイルの形式が正しくありません（JSONとして解析できません）。");
  }

  if (typeof json !== "object" || json === null) {
    throw new BackupParseError("ファイルの形式が正しくありません。");
  }

  const payload = json as Partial<BackupPayload>;
  if (payload.app !== BACKUP_APP_ID || !payload.assumptions) {
    throw new BackupParseError(
      "このアプリのバックアップファイルではないようです。正しいファイルを選択してください。",
    );
  }

  const version = typeof payload.version === "number" ? payload.version : 0;
  return migrateAssumptions(payload.assumptions, version);
}
