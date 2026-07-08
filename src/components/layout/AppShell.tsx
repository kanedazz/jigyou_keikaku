import { AssumptionsGrid } from "../grid/AssumptionsGrid";
import { FundingRoundsPanel } from "../grid/FundingRoundsPanel";
import { ProjectSettingsPanel } from "../grid/ProjectSettingsPanel";
import { PLTable } from "../statements/PLTable";
import { BSTable } from "../statements/BSTable";
import { CFTable } from "../statements/CFTable";
import { RunwayWarningBanner } from "../warnings/RunwayWarningBanner";
import { RevenueProfitChart } from "../charts/RevenueProfitChart";
import { CashRunwayChart } from "../charts/CashRunwayChart";
import { ExportButton } from "../export/ExportButton";
import { BackupButton, RestoreButton } from "../backup/BackupButtons";
import { useProjectStore } from "../../store/useProjectStore";
import "./AppShell.css";

export function AppShell() {
  const loadSample = useProjectStore((s) => s.loadSample);
  const resetToEmpty = useProjectStore((s) => s.resetToEmpty);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>事業計画 財務三表作成ツール</h1>
          <p className="app-subtitle">
            前提条件を入力すると、予想P/L・B/S・C/Fを自動で連動計算します（資金調達向け）
          </p>
        </div>
        <div className="app-header-actions">
          <button className="btn-secondary" onClick={() => loadSample()}>
            サンプルを読み込む
          </button>
          <button className="btn-secondary" onClick={() => resetToEmpty()}>
            新規作成（クリア）
          </button>
          <BackupButton />
          <RestoreButton />
          <ExportButton />
        </div>
      </header>

      <main className="app-main">
        <RunwayWarningBanner />

        <section className="app-section">
          <ProjectSettingsPanel />
        </section>

        <section className="app-section">
          <FundingRoundsPanel />
        </section>

        <section className="app-section">
          <h2 className="section-title">前提条件の入力</h2>
          <AssumptionsGrid />
        </section>

        <section className="app-section charts-grid">
          <RevenueProfitChart />
          <CashRunwayChart />
        </section>

        <section className="app-section">
          <PLTable />
        </section>

        <section className="app-section">
          <BSTable />
        </section>

        <section className="app-section">
          <CFTable />
        </section>
      </main>
    </div>
  );
}
