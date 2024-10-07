import { NextApiRequest, NextApiResponse } from 'next'
import ExcelJS from 'exceljs'
import { ReportData } from '@/types/reports'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const reportData: ReportData = req.body

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Report')

  // Добавьте логику для заполнения worksheet данными из reportData

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx')

  await workbook.xlsx.write(res)
  res.end()
}