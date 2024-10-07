import { ColDef, ColGroupDef } from "ag-grid-community";

export type ReportType = 'time' | 'materials' | 'defects' | 'works' | 'efficiency' | 'cost';

export interface ReportData {
  rows: any[] | null | undefined;
  columns: (ColDef<any, any> | ColGroupDef<any>)[] | null | undefined;
  // Определите структуру данных отчета здесь
}