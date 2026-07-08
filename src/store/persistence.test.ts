import { describe, expect, it } from "vitest";
import { createSampleAssumptions } from "../engine/testFixtures";
import {
  BackupParseError,
  createBackupFileName,
  createBackupPayload,
  parseBackupFile,
  STORAGE_VERSION,
} from "./persistence";

describe("createBackupPayload / parseBackupFile", () => {
  it("往復（エクスポート→インポート）でassumptionsが一致する", () => {
    const assumptions = createSampleAssumptions();
    const payload = createBackupPayload(assumptions);
    const restored = parseBackupFile(JSON.stringify(payload));
    expect(restored).toEqual(assumptions);
  });

  it("生成されるペイロードにapp/version/exportedAtが含まれる", () => {
    const payload = createBackupPayload(createSampleAssumptions());
    expect(payload.app).toBe("jigyou-keikaku");
    expect(payload.version).toBe(STORAGE_VERSION);
    expect(() => new Date(payload.exportedAt).toISOString()).not.toThrow();
  });

  it("JSONとして解析できない文字列はBackupParseErrorを投げる", () => {
    expect(() => parseBackupFile("not json")).toThrow(BackupParseError);
  });

  it("appフィールドが異なる/欠けているファイルはBackupParseErrorを投げる", () => {
    expect(() =>
      parseBackupFile(JSON.stringify({ app: "other-app", assumptions: {} })),
    ).toThrow(BackupParseError);
    expect(() => parseBackupFile(JSON.stringify({ version: 2 }))).toThrow(BackupParseError);
  });

  it("旧バージョン(startMonth欠落)のバックアップをマイグレーションして復元できる", () => {
    const legacyItem = {
      id: "rev-1",
      label: "売上",
      category: "revenue",
      formula: { kind: "fixedGrowth" as const, initialValue: 100, monthlyGrowthRate: 0.1 },
      overrides: {},
    };
    const legacyPayload = {
      app: "jigyou-keikaku",
      version: 1,
      exportedAt: new Date().toISOString(),
      assumptions: {
        startYear: 2026,
        startMonth: 1,
        initialCash: 0,
        revenueLines: [legacyItem],
        variableCostLines: [],
        fixedCostLines: [],
        personnelCostLines: [],
        fundingRounds: [],
        tax: { rate: 0.3 },
      },
    };
    const restored = parseBackupFile(JSON.stringify(legacyPayload));
    expect(restored.revenueLines[0].startMonth).toBe(0);
  });
});

describe("createBackupFileName", () => {
  it("app名と日時を含むファイル名を生成する", () => {
    const name = createBackupFileName(new Date(2026, 6, 8, 21, 17));
    expect(name).toBe("jigyou-keikaku_2026-07-08_2117.json");
  });
});
