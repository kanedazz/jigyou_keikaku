import { useRef } from "react";
import { useProjectStore } from "../../store/useProjectStore";
import {
  BackupParseError,
  createBackupFileName,
  createBackupPayload,
  parseBackupFile,
} from "../../store/persistence";

export function BackupButton() {
  const assumptions = useProjectStore((s) => s.assumptions);

  const handleClick = () => {
    const payload = createBackupPayload(assumptions);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = createBackupFileName();
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button className="btn-secondary" onClick={handleClick}>
      💾 バックアップ
    </button>
  );
}

export function RestoreButton() {
  const replaceAssumptions = useProjectStore((s) => s.replaceAssumptions);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const text = await file.text();
      const assumptions = parseBackupFile(text);
      const confirmed = window.confirm(
        "現在のデータを上書きしてバックアップから復元します。よろしいですか？",
      );
      if (!confirmed) return;
      replaceAssumptions(assumptions);
    } catch (err) {
      const message = err instanceof BackupParseError ? err.message : "復元に失敗しました。";
      window.alert(message);
    }
  };

  return (
    <>
      <button className="btn-secondary" onClick={() => inputRef.current?.click()}>
        📂 復元
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        hidden
        onChange={handleFileChange}
      />
    </>
  );
}
