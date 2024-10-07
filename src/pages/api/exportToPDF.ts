import { NextApiRequest, NextApiResponse } from 'next'
import PDFDocument from 'pdfkit'
import { ReportData } from '@/types/reports'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const reportData: ReportData = req.body

  const doc = new PDFDocument({ size: 'A4', autoFirstPage: false })
  
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'attachment; filename=report.pdf')

  doc.pipe(res)

  // Добавьте логику для заполнения doc данными из reportData

  doc.end()
}