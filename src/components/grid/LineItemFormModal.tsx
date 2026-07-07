import { useState } from "react";
import type { FormulaType, HeadcountEntry, LineItem } from "../../types/financial";
import { FORMULA_KIND_LABELS, defaultFormulaFor } from "../../utils/formulaLabel";
import "./LineItemFormModal.css";

interface Props {
  title: string;
  initial?: LineItem;
  onSave: (label: string, formula: FormulaType) => void;
  onClose: () => void;
}

const FORMULA_KINDS: FormulaType["kind"][] = [
  "fixedGrowth",
  "perUnit",
  "percentOfRevenue",
  "headcountCost",
  "fixedAmount",
];

export function LineItemFormModal({ title, initial, onSave, onClose }: Props) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [formula, setFormula] = useState<FormulaType>(
    initial?.formula ?? defaultFormulaFor("fixedAmount"),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onSave(label.trim(), formula);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>項目名</span>
            <input value={label} onChange={(e) => setLabel(e.target.value)} required />
          </label>

          <label className="field">
            <span>計算方法</span>
            <select
              value={formula.kind}
              onChange={(e) => setFormula(defaultFormulaFor(e.target.value as FormulaType["kind"]))}
            >
              {FORMULA_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {FORMULA_KIND_LABELS[kind]}
                </option>
              ))}
            </select>
          </label>

          <FormulaFields formula={formula} onChange={setFormula} />

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" className="btn-primary">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormulaFields({
  formula,
  onChange,
}: {
  formula: FormulaType;
  onChange: (formula: FormulaType) => void;
}) {
  switch (formula.kind) {
    case "fixedGrowth":
      return (
        <>
          <NumberField
            label="初月の値（円）"
            value={formula.initialValue}
            onChange={(v) => onChange({ ...formula, initialValue: v })}
          />
          <NumberField
            label="月次成長率（例: 0.1 = 10%）"
            value={formula.monthlyGrowthRate}
            step="0.01"
            onChange={(v) => onChange({ ...formula, monthlyGrowthRate: v })}
          />
        </>
      );
    case "perUnit":
      return (
        <>
          <NumberField
            label="単価（円）"
            value={formula.unitPrice}
            onChange={(v) => onChange({ ...formula, unitPrice: v })}
          />
          <NumberField
            label="初月の件数"
            value={formula.initialUnits}
            onChange={(v) => onChange({ ...formula, initialUnits: v })}
          />
          <NumberField
            label="件数の月次成長率（例: 0.1 = 10%）"
            value={formula.unitsGrowthRate}
            step="0.01"
            onChange={(v) => onChange({ ...formula, unitsGrowthRate: v })}
          />
        </>
      );
    case "percentOfRevenue":
      return (
        <NumberField
          label="売上に対する比率（例: 0.3 = 30%）"
          value={formula.percent}
          step="0.01"
          onChange={(v) => onChange({ ...formula, percent: v })}
        />
      );
    case "fixedAmount":
      return (
        <NumberField
          label="毎月の固定額（円）"
          value={formula.monthlyAmount}
          onChange={(v) => onChange({ ...formula, monthlyAmount: v })}
        />
      );
    case "headcountCost":
      return (
        <>
          <NumberField
            label="1人あたり平均月給（円）"
            value={formula.avgMonthlySalary}
            onChange={(v) => onChange({ ...formula, avgMonthlySalary: v })}
          />
          <HeadcountEditor
            entries={formula.headcountByMonth}
            onChange={(headcountByMonth) => onChange({ ...formula, headcountByMonth })}
          />
        </>
      );
  }
}

function NumberField({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: number;
  step?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        step={step ?? "1"}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function HeadcountEditor({
  entries,
  onChange,
}: {
  entries: HeadcountEntry[];
  onChange: (entries: HeadcountEntry[]) => void;
}) {
  const update = (index: number, patch: Partial<HeadcountEntry>) => {
    onChange(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };
  const remove = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };
  const add = () => {
    onChange([...entries, { fromMonth: 0, count: 0 }]);
  };

  return (
    <div className="field">
      <span>人数計画（何ヶ月目から何人か）</span>
      {entries.map((entry, i) => (
        <div key={i} className="headcount-row">
          <input
            type="number"
            value={entry.fromMonth}
            onChange={(e) => update(i, { fromMonth: Number(e.target.value) })}
            aria-label="開始月"
          />
          <span>ヶ月目〜</span>
          <input
            type="number"
            value={entry.count}
            onChange={(e) => update(i, { count: Number(e.target.value) })}
            aria-label="人数"
          />
          <span>人</span>
          {entries.length > 1 && (
            <button type="button" className="btn-icon" onClick={() => remove(i)}>
              ×
            </button>
          )}
        </div>
      ))}
      <button type="button" className="btn-secondary btn-small" onClick={add}>
        + 段階を追加
      </button>
    </div>
  );
}
