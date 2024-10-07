import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button, Space } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { handleOpenReport } from '@/services/utilites';

interface PDFExportProps {
  title: string;
  filename: string;
  headerInfo?: { [key: string]: string };
  statistics?: { [key: string]: number | string };
  columnDefs: any[];
  data: any[];
  orientation?: 'portrait' | 'landscape';
  disabled?: boolean;
  loading?: boolean;
  buttonText?: string;
  isOpen?: boolean; // Новый проп для контроля открытия/сохранения
}

const PDFExport: React.FC<PDFExportProps> = ({
  title,
  filename,
  headerInfo,
  statistics,
  columnDefs,
  data,
  orientation = 'landscape',
  disabled = false,
  loading = false,
  buttonText,
  isOpen,
}) => {
  const generatePDF = async (open: boolean) => {
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    }) as any;

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Функция для добавления нижнего колонтитула
    // Функция для добавления нижнего колонтитула
const addFooter = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const time = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const dateTimeString = `${date} ${time}`;
    
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Report generated: ${dateTimeString}`, 14, pageHeight - 10);
  };

    // Title
    doc.setFontSize(18);
    doc.text(title, pageWidth / 2, 15, { align: 'center' });

    let yPos = 25;

    // Header Info
    if (headerInfo) {
      doc.setFontSize(12);
      Object.entries(headerInfo).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 14, yPos);
        yPos += 7;
      });
    }

    // Statistics
    if (statistics) {
      yPos += 5;
      doc.setFontSize(14);
      doc.text('Statistics', 14, yPos);
      yPos += 5;
      doc.autoTable({
        startY: yPos,
        head: [['Metric', 'Value']],
        body: Object.entries(statistics),
        theme: 'grid',
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
        styles: { cellPadding: 2, fontSize: 10 },
        columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 30 } },
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Main Data Table
    doc.setFontSize(14);
    doc.text('Details', 14, yPos);
    doc.autoTable({
      startY: yPos + 5,
      head: [columnDefs.map(col => col.headerName)],
      body: data.map(item => columnDefs.map(col => {
        if (col.valueGetter) {
          return col.valueGetter({ data: item });
        }
        if (typeof col.field === 'string') {
          return col.field.split('.').reduce((obj:any, key:any) => obj?.[key], item) || '-';
        }
        return item[col.field] || '-';
      })),
      theme: 'grid',
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
      styles: { cellPadding: 2, fontSize: 8 },
      columnStyles: columnDefs.reduce((styles, col, index) => {
        styles[index] = { cellWidth: col.width / 4 || 'auto' };
        return styles;
      }, {}),
      didDrawPage: addFooter,
    });

    if (open) {
      const pdfData = doc.output('arraybuffer');
      await handleOpenReport(pdfData);
    } else {
      doc.save(`${filename}.pdf`);
    }
  };

  if (isOpen === undefined) {
    // Если isOpen не определен, показываем обе кнопки
    return (
      <Space>
        <Button 
          size='small'
          icon={<PrinterOutlined />}
          onClick={() => generatePDF(true)}
          disabled={disabled}
          loading={loading}
        >
          {buttonText || 'Print PDF'}
        </Button>
        <Button 
          size='small'
          icon={<DownloadOutlined />}
          onClick={() => generatePDF(false)}
          disabled={disabled}
          loading={loading}
        >
          Export PDF
        </Button>
      </Space>
    );
  }

  // Если isOpen определен, показываем одну кнопку
  return (
    <Button 
      size='small'
      icon={isOpen ? <PrinterOutlined /> : <DownloadOutlined />}
      onClick={() => generatePDF(isOpen)}
      disabled={disabled}
      loading={loading}
    >
      {buttonText || (isOpen ? 'Print PDF' : 'Export PDF')}
    </Button>
  );
};

export default PDFExport;