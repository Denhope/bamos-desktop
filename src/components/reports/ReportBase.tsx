import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button, Space } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { handleOpenReport } from '@/services/utilites';
import { utils, writeFile } from 'xlsx';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

// Определяем тип для jsPDF с autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
  lastAutoTable: {
    finalY: number;
  };
}

interface ColumnWidth {
  [key: string]: number;
}

interface PDFExportProps {
  title: string;
  filename: string;
  headerInfo?: Record<string, string>;
  statistics: Record<string, number>;
  columnDefs: any[];
  data: any[];
  orientation?: 'portrait' | 'landscape';
  disabled?: boolean;
  loading?: boolean;
  filterValues?: any;
  pdfColumnWidths?: ColumnWidth;
  excelColumnWidths?: ColumnWidth;
  rightAlignedColumns?: string[];
}

const PDFExport: React.FC<PDFExportProps> = ({
  title,
  filename,
  headerInfo,
  statistics,
  columnDefs,
  data,
  orientation = 'portrait',
  disabled,
  loading,
  filterValues,
  pdfColumnWidths,
  excelColumnWidths,
  rightAlignedColumns = ['QUANTITY', 'UNIT_OF_MEASURE'],
}) => {
  const { t } = useTranslation();

  // Функция для обрезки текста с многоточием
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  // Функция для форматирования значения ячейки
  const formatCellValue = (value: any, field: string) => {
    if (!value || value === '-') return '-';

    // Обработка дат
    if (field === 'RECEIVED_DATE' || field === 'PRODUCT_EXPIRATION_DATE') {
      // Если значение уже отформатировано
      if (typeof value === 'string' && (value.includes('.') || value === '-')) {
        return value;
      }

      try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return '-';

        if (field === 'RECEIVED_DATE') {
          return date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });
        }
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      } catch (error) {
        console.error('Date formatting error:', error);
        return '-';
      }
    }

    // Обработка длинных текстов
    if (typeof value === 'string' && value.length > 30) {
      return truncateText(value, 30);
    }

    return value.toString() || '-';
  };

  const exportToPDF = () => {
    const doc = new jsPDF(orientation) as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;

    // Устанавливаем шрифт для поддержки кириллицы
    doc.setFont('helvetica');

    // Заголовок отчета
    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185);
    doc.text(title, pageWidth / 2, 15, { align: 'center' });
    doc.setTextColor(0);

    let currentY = 30;

    // Информация о фильтрах
    if (filterValues) {
      doc.setFontSize(12);
      doc.text(t('Filter Parameters'), margin, currentY);
      currentY += 5;

      doc.autoTable({
        startY: currentY,
        head: [[t('Parameter'), t('Value')]],
        body: Object.entries(filterValues).map(([key, value]) => {
          let displayValue = value;
          if (Array.isArray(value)) {
            displayValue = value.join(', ');
          } else if (value instanceof Date) {
            displayValue = format(value, 'dd.MM.yyyy');
          }
          return [t(key), displayValue || '-'];
        }),
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 2,
        },
        margin,
        styles: {
          font: 'helvetica',
          overflow: 'linebreak',
          cellWidth: 'wrap',
        },
      });

      currentY = doc.lastAutoTable.finalY + 10;
    }

    // Статистика
    doc.setFontSize(12);
    doc.text(t('Statistics'), margin, currentY);
    currentY += 5;

    doc.autoTable({
      startY: currentY,
      head: [[t('Metric'), t('Value')]],
      body: Object.entries(statistics).map(([key, value]) => [t(key), value]),
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 2,
      },
      margin,
      styles: {
        font: 'helvetica',
        overflow: 'linebreak',
        cellWidth: 'wrap',
      },
    });

    currentY = doc.lastAutoTable.finalY + 10;

    // Основные данные
    doc.autoTable({
      startY: currentY,
      head: [columnDefs.map((col) => t(col.headerName))],
      body: data.map((row) =>
        columnDefs.map((col) => {
          const value = row[col.field];
          let formattedValue;

          if (col.valueFormatter) {
            formattedValue = col.valueFormatter({ value });
          } else {
            formattedValue = formatCellValue(value, col.field);
          }

          return formattedValue || '';
        })
      ),
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        fontSize: 7,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 1,
      },
      bodyStyles: {
        fontSize: 6.5,
        cellPadding: 1,
      },
      margin: 8,
      styles: {
        font: 'helvetica',
        overflow: 'linebreak',
        cellWidth: 'wrap',
        minCellHeight: 7,
        halign: 'left',
        valign: 'middle',
      },
      columnStyles: columnDefs.reduce((acc, col) => {
        acc[col.field] = {
          cellWidth: pdfColumnWidths?.[col.field] || 'auto',
          halign: rightAlignedColumns?.includes(col.field) ? 'right' : 'left',
          cellPadding: 1,
          overflow: 'linebreak',
        };
        return acc;
      }, {}),
    });

    doc.save(`${filename}.pdf`);
  };

  const exportToExcel = () => {
    const wb = utils.book_new();

    // Настройка стилей для Excel
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2980B9' } },
      alignment: { horizontal: 'center' },
    };

    // Лист с информацией о фильтрах
    if (filterValues) {
      const filterSheet = [
        [t('Filter Parameters')],
        [t('Parameter'), t('Value')],
        ...Object.entries(filterValues).map(([key, value]) => {
          let displayValue = value;
          if (Array.isArray(value)) {
            displayValue = value.join(', ');
          } else if (value instanceof Date) {
            displayValue = format(value, 'dd.MM.yyyy');
          }
          return [t(key), displayValue || '-'];
        }),
      ];
      const wsFilters = utils.aoa_to_sheet(filterSheet);
      utils.book_append_sheet(wb, wsFilters, 'Filters');
    }

    // Лист со статистикой
    const statsSheet = [
      [t('Statistics')],
      [t('Metric'), t('Value')],
      ...Object.entries(statistics).map(([key, value]) => [t(key), value]),
    ];
    const wsStats = utils.aoa_to_sheet(statsSheet);
    utils.book_append_sheet(wb, wsStats, 'Statistics');

    // Лист с основными данными
    const headers = columnDefs.map((col) => t(col.headerName));
    const dataSheet = [
      headers,
      ...data.map((row) =>
        columnDefs.map((col) => {
          const value = row[col.field];
          if (col.valueFormatter) {
            return col.valueFormatter({ value });
          }
          return value?.toString() || '';
        })
      ),
    ];
    const wsData = utils.aoa_to_sheet(dataSheet);

    // Применяем стили к заголовкам
    const range = utils.decode_range(wsData['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = utils.encode_cell({ r: 0, c: C });
      if (!wsData[address]) continue;
      wsData[address].s = headerStyle;
    }

    utils.book_append_sheet(wb, wsData, 'Data');

    // Применяем пользовательские ширины колонок если они есть
    if (excelColumnWidths) {
      wsData['!cols'] = columnDefs.map((col) => ({
        width: excelColumnWidths[col.field] || 12,
        wch: excelColumnWidths[col.field] || 12,
      }));
    }

    writeFile(wb, `${filename}.xlsx`);
  };

  return (
    <Space>
      <Button
        icon={<DownloadOutlined />}
        onClick={exportToPDF}
        disabled={disabled || loading}
        size="small"
      >
        {t('Export to PDF')}
      </Button>
      <Button
        className="bg-green-600"
        icon={<DownloadOutlined />}
        onClick={exportToExcel}
        disabled={disabled || loading}
        size="small"
      >
        {t('Export to Excel')}
      </Button>
    </Space>
  );
};

export default PDFExport;
