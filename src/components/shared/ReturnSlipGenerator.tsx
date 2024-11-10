import React, { useState } from 'react';
import { Button } from 'antd';
import { PDFDocument, rgb, PDFPage, PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { useTranslation } from 'react-i18next';
import { PrinterOutlined } from '@ant-design/icons';
import robotoBoldFont from '../../fonts/Roboto-Bold.ttf';
import robotoFont from '../../fonts/Roboto-Regular.ttf';
import logoImage from '../../assets/img/407Technics_logo.png';
import { SING } from '@/utils/api/http';

interface CancelInfo {
  items: Array<{
    PART_NUMBER_BOOKED: string;
    DESCRIPTION: string;
    QTYCANCEL: number;
    LOCATION: string;
    LOCATION_TO: string;
    LOCAL_ID?: string;
  }>;
  storeMan: string;
  mechanic: string;
  cancelDate: string;
}

interface ReturnSlipGeneratorProps {
  data: {
    pickSlips: {
      pickSlipNumberNew: string;
      WONumber: string;
      projectWO: string;
      planeId: string;
      taskWO: string;
      taskNumber: string;
      taskType: string;
      store: string;
    } | null;
    cancelGroups: CancelInfo[];
  } | null;
  disabled?: boolean;
}

const ReturnSlipGenerator: React.FC<ReturnSlipGeneratorProps> = ({
  data,
  disabled,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const addPageNumber = (
    page: PDFPage,
    pageNumber: number,
    totalPages: number,
    font: PDFFont
  ) => {
    const { width } = page.getSize();
    page.drawText(`Page ${pageNumber} of ${totalPages}`, {
      x: width - 100,
      y: 30,
      size: 8,
      font,
      color: rgb(0, 0, 0),
    });
  };

  const addMainPageText = (page: PDFPage, font: PDFFont) => {
    const currentDate = new Date().toLocaleString('en-US');
    page.drawText(`FORM 002 rev.01 Printed by ${SING} ${currentDate}`, {
      x: 50,
      y: 30,
      size: 8,
      font,
      color: rgb(0, 0, 0),
    });
  };

  const addBorder = (page: PDFPage) => {
    const { width, height } = page.getSize();
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
  };

  const truncateText = (
    text: string,
    maxWidth: number,
    font: PDFFont,
    fontSize: number
  ) => {
    let truncated = text;
    while (
      font.widthOfTextAtSize(truncated, fontSize) > maxWidth &&
      truncated.length > 0
    ) {
      truncated = truncated.slice(0, -1);
    }
    return truncated.length < text.length ? truncated + '...' : truncated;
  };

  const generatePdf = async () => {
    if (!data) return;

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    setLoading(true);

    const fontBytes = await fetch(robotoFont).then((res) => res.arrayBuffer());
    const robotoFontInstance = await pdfDoc.embedFont(fontBytes);
    const fontBytesB = await fetch(robotoBoldFont).then((res) =>
      res.arrayBuffer()
    );
    const robotoBoldFontInstance = await pdfDoc.embedFont(fontBytesB);
    const logoBytes = await fetch(logoImage).then((res) => res.arrayBuffer());
    const logoImageEmbed = await pdfDoc.embedPng(logoBytes);

    const tableHeaders = [
      'Label',
      'Part Number',
      'Description',
      'QTY',
      'Location From',
      'Location To',
    ];
    const columnWidths = [40, 130, 170, 60, 70, 70];
    const rowHeight = 20;

    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    addBorder(page);
    const { width, height } = page.getSize();
    let y = height - 20;

    // Header with logo
    page.drawRectangle({
      x: 20,
      y: y - 40,
      width: width - 40,
      height: 40,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawImage(logoImageEmbed, {
      x: 25,
      y: y - 35,
      width: 120,
      height: 30,
    });
    page.drawLine({
      start: { x: width / 4, y: y },
      end: { x: width / 4, y: y - 40 },
      color: rgb(0, 0, 0),
    });
    page.drawText('RETURN SLIP', {
      x: width / 2 + 10,
      y: y - 25,
      font: robotoBoldFontInstance,
      size: 16,
      color: rgb(0, 0, 0),
    });
    y -= 60;

    // Pick Slip Info - первая строка
    page.drawText(`Pick Slip #: ${data.pickSlips?.pickSlipNumberNew || '-'}`, {
      x: 25,
      y: y,
      font: robotoBoldFontInstance,
      size: 12,
      color: rgb(0, 0, 0),
    });
    y -= 25;

    // Добавляем дополнительную информацию в компактном формате
    const infoRows = [
      [
        { label: 'Store:', value: String(data?.pickSlips?.store || '-') },
        { label: 'WO #:', value: String(data?.pickSlips?.WONumber || '-') },
        { label: 'AC Reg:', value: String(data?.pickSlips?.planeId || '-') },
      ],
      [
        { label: 'WP:', value: String(data?.pickSlips?.projectWO || '-') },
        { label: 'Trace #:', value: String(data?.pickSlips?.taskWO || '-') },
        { label: 'Task #:', value: String(data?.pickSlips?.taskNumber || '-') },
      ],
    ];

    infoRows.forEach((row, rowIndex) => {
      row.forEach((item, colIndex) => {
        const xPos = 25 + (colIndex * (width - 50)) / 3;
        const labelText = String(item.label);
        const valueText = String(item.value);

        page.drawText(labelText, {
          x: xPos,
          y: y,
          font: robotoFontInstance,
          size: 10,
          color: rgb(0, 0, 0),
        });
        page.drawText(valueText, {
          x: xPos + 60,
          y: y,
          font: robotoBoldFontInstance,
          size: 10,
          color: rgb(0, 0, 0),
        });
      });
      y -= 20;
    });
    y -= 20;

    // Table headers
    let x = 25;
    tableHeaders.forEach((header, index) => {
      page.drawRectangle({
        x,
        y: y - rowHeight,
        width: columnWidths[index],
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
      page.drawText(header, {
        x: x + 2,
        y: y - 15,
        font: robotoBoldFontInstance,
        size: 8,
        color: rgb(0, 0, 0),
      });
      x += columnWidths[index];
    });
    y -= rowHeight;

    // Для каждой группы отмен
    for (const cancelGroup of data.cancelGroups) {
      // Table data
      console.log(cancelGroup);
      if (cancelGroup.items.length > 0) {
        for (const item of cancelGroup.items) {
          x = 25;
          const rowData = [
            String(item.LOCAL_ID || '-'),
            String(item.PART_NUMBER_BOOKED || '-'),
            String(item.DESCRIPTION || '-'),
            String(item.QTYCANCEL || '0'),
            String(item.LOCATION || '-'),
            String(item.LOCATION_TO || '-'),
          ];

          rowData.forEach((cellValue, index) => {
            page.drawRectangle({
              x,
              y: y - rowHeight,
              width: columnWidths[index],
              height: rowHeight,
              borderColor: rgb(0, 0, 0),
              borderWidth: 1,
            });

            const text = String(cellValue).toUpperCase();
            const truncatedText = truncateText(
              text,
              columnWidths[index] - 4,
              robotoFontInstance,
              8
            );

            page.drawText(truncatedText, {
              x: x + 2,
              y: y - 15,
              font: robotoFontInstance,
              size: 8,
              color: rgb(0, 0, 0),
            });
            x += columnWidths[index];
          });
          y -= rowHeight;
        }

        // После каждой группы отмен добавляем информацию о пользователях
        y -= rowHeight * 2; // Добавляем отступ

        // Добавляем линию-разделитель
        page.drawLine({
          start: { x: 25, y: y + rowHeight },
          end: { x: width - 25, y: y + rowHeight },
          color: rgb(0.8, 0.8, 0.8),
          thickness: 1,
        });

        // Информация о возврате
        page.drawText(
          `Return Date: ${new Date(cancelGroup.cancelDate).toLocaleString(
            'ru-RU',
            {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }
          )}`,
          {
            x: 25,
            y: y,
            font: robotoBoldFontInstance,
            size: 8,
            color: rgb(0, 0, 0),
          }
        );

        // Storeman label and value
        page.drawText('Storeman: ', {
          x: 200,
          y: y,
          font: robotoBoldFontInstance,
          size: 8,
          color: rgb(0, 0, 0),
        });
        page.drawText(`${cancelGroup.storeMan?.toUpperCase()}`, {
          x: 250, // Adjusted x position for the value
          y: y,
          font: robotoFontInstance,
          size: 8,
          color: rgb(0, 0, 0),
        });

        // Mechanic label and value
        page.drawText('Mechanic: ', {
          x: 400,
          y: y,
          font: robotoBoldFontInstance,
          size: 8,
          color: rgb(0, 0, 0),
        });
        page.drawText(`${cancelGroup.mechanic?.toUpperCase()}`, {
          x: 450, // Adjusted x position for the value
          y: y,
          font: robotoFontInstance,
          size: 8,
          color: rgb(0, 0, 0),
        });

        y -= rowHeight * 2; // Добавляем отступ после информации
      }
    }

    // Add page numbers and footer text
    addPageNumber(page, 1, 1, robotoFontInstance);
    addMainPageText(page, robotoFontInstance);

    // Save and open PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    URL.revokeObjectURL(url);

    setLoading(false);
  };

  return (
    <Button
      icon={<PrinterOutlined />}
      loading={loading}
      disabled={disabled || loading}
      size="small"
      onClick={generatePdf}
    >
      {t('RETURN SLIP')}
    </Button>
  );
};

export default ReturnSlipGenerator;
