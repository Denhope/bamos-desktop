//@ts-nocheck

import React from 'react';
import { Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Добавляем новый интерфейс для футера
interface FooterItem {
  label: string;
  value: string | number;
}

// Модифицируем интерфейс PDFExportProps
interface PDFExportProps {
  title: string;
  filename: string;
  statistics: Record<string, string | number>;
  columnDefs: { headerName: string; field: string }[];
  data: any[];
  orientation?: 'portrait' | 'landscape';
  footer?: string;
  releaseText?: string;
}

const PDFExport: React.FC<PDFExportProps> = ({
  title,
  filename,
  statistics,
  columnDefs,
  data,
  orientation = 'portrait',
  footer,
  releaseText,
}) => {
  const exportPDF = () => {
    const doc = new jsPDF(orientation, 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 40;

    // Добавляем поддержку кириллицы
    doc.addFont(
      'https://cdn.jsdelivr.net/npm/roboto-font@0.1.0/fonts/Roboto/roboto-regular-webfont.ttf',
      'Roboto',
      'normal'
    );
    doc.setFont('Roboto');

    let yPos = margin;

    // Add title
    doc.setFontSize(18);
    doc.text(title, margin, yPos);
    yPos += 25;

    // Add generation date and time in 24-hour format
    const now = new Date();
    const dateTimeString = `Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString(
      'en-GB'
    )}`;
    doc.setFontSize(10);
    doc.text(dateTimeString, margin, yPos);
    yPos += 20;

    // Add statistics
    doc.setFontSize(12);
    Object.entries(statistics).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, margin, yPos);
      yPos += 20;
    });

    // Add table
    const headers = columnDefs.map((col) => col.headerName);
    const dataRows = data.map((item) =>
      columnDefs.map((col) => item[col.field as keyof typeof item])
    );

    (doc as any).autoTable({
      head: [headers],
      body: dataRows,
      startY: yPos + 10,
      margin: { top: margin, right: margin, bottom: margin, left: margin },
      styles: {
        cellPadding: 3,
        fontSize: 10,
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
        font: 'Roboto',
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.5,
      theme: 'grid', // Это ключевой параметр для отображения всех линий
      didDrawPage: function (data: any) {
        // Номер страницы
        let str = 'Page ' + doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(
          str,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      },
      foot: [
        [
          {
            content: footer,
            styles: {
              halign: 'left',
              fontSize: 10,
              textColor: [100, 100, 100],
              cellPadding: 10,
            },
            colSpan: columnDefs.length,
          },
        ],
      ],
      footStyles: {
        fillColor: [255, 255, 255],
        lineWidth: 0.1,
      },
      showFoot: 'lastPage',
    });

    doc.save(`${filename}.pdf`);
  };

  return (
    <Button size="small" icon={<PrinterOutlined />} onClick={exportPDF}>
      Export PDF
    </Button>
  );
};

export default PDFExport;
