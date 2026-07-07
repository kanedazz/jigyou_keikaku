import { useModelCalculation } from "../../hooks/useModelCalculation";
import { useProjectStore } from "../../store/useProjectStore";
import "./ProjectSettingsPanel.css";

export function ProjectSettingsPanel() {
  const { assumptions } = useModelCalculation();
  const setStartDate = useProjectStore((s) => s.setStartDate);
  const setInitialCash = useProjectStore((s) => s.setInitialCash);
  const setTaxRate = useProjectStore((s) => s.setTaxRate);

  return (
    <div className="settings-panel">
      <h3>基本設定</h3>
      <div className="settings-grid">
        <label>
          <span>開始年月</span>
          <div className="inline-fields">
            <input
              type="number"
              value={assumptions.startYear}
              onChange={(e) => setStartDate(Number(e.target.value), assumptions.startMonth)}
            />
            年
            <input
              type="number"
              min={1}
              max={12}
              value={assumptions.startMonth}
              onChange={(e) => setStartDate(assumptions.startYear, Number(e.target.value))}
            />
            月
          </div>
        </label>
        <label>
          <span>初期現金（円）</span>
          <input
            type="number"
            value={assumptions.initialCash}
            onChange={(e) => setInitialCash(Number(e.target.value))}
          />
        </label>
        <label>
          <span>法人税率（例: 0.3 = 30%）</span>
          <input
            type="number"
            step="0.01"
            value={assumptions.tax.rate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}
