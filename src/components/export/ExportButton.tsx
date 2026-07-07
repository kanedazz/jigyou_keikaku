import { useState } from "react";
import { useModelCalculation } from "../../hooks/useModelCalculation";
import { exportProjectionToExcel } from "./exportToExcel";

export function ExportButton() {
  const { display } = useModelCalculation();
  const [isExporting, setIsExporting] = useState(false);

  const handleClick = async () => {
    setIsExporting(true);
    try {
      await exportProjectionToExcel(display);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button className="btn-export" onClick={handleClick} disabled={isExporting}>
      {isExporting ? "出力中..." : "📊 Excelに出力"}
    </button>
  );
}
