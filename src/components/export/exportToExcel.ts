import ExcelJS from "exceljs";
import type { StatementRow } from "../statements/StatementTable";
import type { DisplayPeriod, DisplayProjection } from "../../types/statements";
import { buildBSRows, buildCFRows, buildPLRows } from "../../utils/statementRows";

const NUMBER_FORMAT = "#,##0;[Red]△#,##0";

function addStatementSheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  periods: DisplayPeriod[],
  rows: StatementRow[],
) {
  const sheet = workbook.addWorksheet(sheetName);

  const headerRow = sheet.addRow(["項目", ...periods.map((p) => p.label)]);
  headerRow.font = { bold: true };
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
  });

  for (const row of rows) {
    const excelRow = sheet.addRow([row.label, ...row.values.map((v) => Math.round(v))]);
    if (row.strong) {
      excelRow.font = { bold: true };
    }
    for (let i = 2; i <= periods.length + 1; i++) {
      excelRow.getCell(i).numFmt = NUMBER_FORMAT;
    }
  }

  sheet.getColumn(1).width = 26;
  for (let i = 0; i < periods.length; i++) {
    const col = sheet.getColumn(i + 2);
    col.width = periods[i].granularity === "annual" ? 14 : 12;
  }
  sheet.views = [{ state: "frozen", xSplit: 1, ySplit: 1 }];
}

export async function exportProjectionToExcel(
  display: DisplayProjection,
  fileName = "事業計画_財務三表.xlsx",
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "事業計画作成ツール";
  workbook.created = new Date();

  addStatementSheet(workbook, "P_L", display.periods, buildPLRows(display));
  addStatementSheet(workbook, "B_S", display.periods, buildBSRows(display));
  addStatementSheet(workbook, "C_F", display.periods, buildCFRows(display));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
