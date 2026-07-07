import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz, type ColDef, type ICellRendererParams } from "ag-grid-community";
import "../../lib/agGridSetup";
import { resolveLineItem } from "../../engine/formulas";
import { useModelCalculation } from "../../hooks/useModelCalculation";
import { useProjectStore } from "../../store/useProjectStore";
import type { FormulaType, LineItem, LineItemCategory } from "../../types/financial";
import type { DisplayPeriod } from "../../types/statements";
import { formatYen } from "../../utils/format";
import { LineItemFormModal } from "./LineItemFormModal";
import "./AssumptionsGrid.css";

const CATEGORY_LABELS: Record<LineItemCategory, string> = {
  revenue: "売上",
  variableCost: "変動費",
  personnelCost: "人件費",
  fixedCost: "固定費",
};

const CATEGORY_ORDER: LineItemCategory[] = [
  "revenue",
  "variableCost",
  "personnelCost",
  "fixedCost",
];

interface RowData {
  category: LineItemCategory;
  item: LineItem;
}

function computeCellValue(
  item: LineItem,
  period: DisplayPeriod,
  revenueByMonth: number[],
): number {
  return period.monthIndexes.reduce(
    (total, idx) =>
      total + resolveLineItem(item, idx, { totalRevenueForMonth: revenueByMonth[idx] }),
    0,
  );
}

function hasOverrideInPeriod(item: LineItem, period: DisplayPeriod): boolean {
  return period.monthIndexes.some((idx) => item.overrides[idx] !== undefined);
}

export function AssumptionsGrid() {
  const { assumptions, result, display } = useModelCalculation();
  const removeLineItem = useProjectStore((s) => s.removeLineItem);
  const addLineItem = useProjectStore((s) => s.addLineItem);
  const renameLineItem = useProjectStore((s) => s.renameLineItem);
  const updateLineItemFormula = useProjectStore((s) => s.updateLineItemFormula);
  const setCellValue = useProjectStore((s) => s.setCellValue);

  const [modalState, setModalState] = useState<
    | { mode: "add"; category: LineItemCategory }
    | { mode: "edit"; category: LineItemCategory; item: LineItem }
    | null
  >(null);

  const revenueByMonth = useMemo(() => result.pl.map((m) => m.revenue), [result.pl]);

  const rowData: RowData[] = useMemo(() => {
    const map: Record<LineItemCategory, LineItem[]> = {
      revenue: assumptions.revenueLines,
      variableCost: assumptions.variableCostLines,
      personnelCost: assumptions.personnelCostLines,
      fixedCost: assumptions.fixedCostLines,
    };
    return CATEGORY_ORDER.flatMap((category) =>
      map[category].map((item) => ({ category, item })),
    );
  }, [assumptions]);

  const columnDefs: ColDef<RowData>[] = useMemo(() => {
    const cols: ColDef<RowData>[] = [
      {
        headerName: "区分",
        field: "category",
        pinned: "left",
        width: 90,
        editable: false,
        valueFormatter: (p) => CATEGORY_LABELS[p.value as LineItemCategory],
      },
      {
        headerName: "項目名",
        field: "item.label",
        pinned: "left",
        width: 150,
        editable: true,
        valueSetter: (p) => {
          renameLineItem(p.data!.category, p.data!.item.id, String(p.newValue));
          return true;
        },
      },
      {
        headerName: "操作",
        pinned: "left",
        width: 110,
        editable: false,
        cellRenderer: (p: ICellRendererParams<RowData>) => (
          <div className="row-actions">
            <button
              className="btn-icon-small"
              title="計算式を編集"
              onClick={() => setModalState({ mode: "edit", category: p.data!.category, item: p.data!.item })}
            >
              編集
            </button>
            <button
              className="btn-icon-small danger"
              title="削除"
              onClick={() => removeLineItem(p.data!.category, p.data!.item.id)}
            >
              削除
            </button>
          </div>
        ),
      },
    ];

    for (const period of display.periods) {
      cols.push({
        headerName: period.label,
        colId: period.key,
        width: period.granularity === "monthly" ? 110 : 130,
        editable: true,
        cellEditor: "agNumberCellEditor",
        cellClass: (p) =>
          p.data && hasOverrideInPeriod(p.data.item, period) ? "cell-overridden" : "",
        valueGetter: (p) => (p.data ? computeCellValue(p.data.item, period, revenueByMonth) : 0),
        valueSetter: (p) => {
          const parsed = Number(p.newValue);
          if (Number.isNaN(parsed)) return false;
          setCellValue(p.data!.category, p.data!.item.id, period, parsed);
          return true;
        },
        valueFormatter: (p) => formatYen(p.value ?? 0),
      });
    }

    return cols;
  }, [display.periods, revenueByMonth, removeLineItem, renameLineItem, setCellValue]);

  return (
    <div className="assumptions-grid">
      <div className="grid-toolbar">
        {CATEGORY_ORDER.map((category) => (
          <button
            key={category}
            className="btn-add"
            onClick={() => setModalState({ mode: "add", category })}
          >
            + {CATEGORY_LABELS[category]}項目を追加
          </button>
        ))}
      </div>
      <div className="ag-grid-wrapper">
        <AgGridReact<RowData>
          theme={themeQuartz}
          rowData={rowData}
          columnDefs={columnDefs}
          getRowId={(p) => p.data.item.id}
          suppressMovableColumns
          animateRows
        />
      </div>
      <p className="grid-hint">
        セルを直接編集するとその月だけ上書きされ、他の月は元の数式に従います（黄色背景＝上書き済み）。年次列を編集すると12ヶ月に均等分配されます。
      </p>

      {modalState && (
        <LineItemFormModal
          title={
            modalState.mode === "add"
              ? `${CATEGORY_LABELS[modalState.category]}項目を追加`
              : `「${modalState.item.label}」を編集`
          }
          initial={modalState.mode === "edit" ? modalState.item : undefined}
          onClose={() => setModalState(null)}
          onSave={(label, formula: FormulaType) => {
            if (modalState.mode === "add") {
              addLineItem(modalState.category, label, formula);
            } else {
              renameLineItem(modalState.category, modalState.item.id, label);
              updateLineItemFormula(modalState.category, modalState.item.id, formula);
            }
            setModalState(null);
          }}
        />
      )}
    </div>
  );
}
