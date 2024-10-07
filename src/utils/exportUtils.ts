// @ts-nocheck
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { ReportData } from '@/types/reports'

export function exportToPDF(data: ReportData) {
  const doc = new jsPDF()
  doc.autoTable({
    head: [data.columns.map(col => col.headerName)],
    body: data.rows.map(row => data.columns.map(col => row[col.field])),
  })
  doc.save('report.pdf')
}

export function exportToExcel(data: ReportData) {
  const ws = XLSX.utils.json_to_sheet(data.rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Report')
  XLSX.writeFile(wb, 'report.xlsx')
}