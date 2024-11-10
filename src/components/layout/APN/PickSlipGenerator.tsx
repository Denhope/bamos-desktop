import React, { useState } from 'react';
import { Button } from 'antd';
import { PDFDocument, rgb, PDFPage, PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { useTranslation } from 'react-i18next';
import robotoBoldFont from '../../../fonts/Roboto-Bold.ttf';
import robotoFont from '../../../fonts/Roboto-Regular.ttf';
import logoImage from '../../../assets/img/407Technics_logo.png';
import { SING } from '@/utils/api/http';

interface PickSlipGeneratorProps {
  data: {
    pickSlips: any;
    pickSlipSearchValues: any;
    rowDataForSecondContainer: any[];
  };
  disabled: boolean;
}

// Определяем enum для типов задач
const valueEnumTask: Record<string, string> = {
  RC: 'TC',
  CR_TASK: 'CR TASK (CRITICAL TASK/DI)',
  NRC: 'NRC (DEFECT)',
  NRC_ADD: 'ADHOC (ADHOC TASK)',
  MJC: 'MJC',
  CMJC: 'CMJC',
  FC: 'FC',
  HARD_ACCESS: 'HARD_ACCESS',
};

const PickSlipGenerator: React.FC<PickSlipGeneratorProps> = ({
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

  const addMainPageText = (
    page: PDFPage,
    font: PDFFont,
    pageNumber: number
  ) => {
    const currentDate = new Date().toLocaleString('en-US');
    page.drawText(`FORM 001 rev.01 Printed by ${SING} ${currentDate}`, {
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
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    setLoading(true);
    console.log('generatePdf', data);
    const fontBytes = await fetch(robotoFont).then((res) => res.arrayBuffer());
    const robotoFontInstance = await pdfDoc.embedFont(fontBytes);
    const fontBytesB = await fetch(robotoBoldFont).then((res) =>
      res.arrayBuffer()
    );
    const robotoBoldFontInstance = await pdfDoc.embedFont(fontBytesB);
    const logoBytes = await fetch(logoImage).then((res) => res.arrayBuffer());
    const logoImageEmbed = await pdfDoc.embedPng(logoBytes);

    const tableHeaders = [
      'Part Number',
      'Description',
      'Label',
      'S/N/Batch',
      'Quantity',
      'Canceled',
      'UOM',
      'Store',
      'Location',
    ];
    const columnWidths = [160, 120, 40, 60, 40, 40, 25, 25, 35];
    const rowHeight = 20;

    const addPage = async () => {
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
      addBorder(page);
      const { width, height } = page.getSize();
      let y = height - 20; // Начинаем сразу под верхним срезом рамки

      // Add logo and title in a table-like structure at the top
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
      page.drawText('PICK SLIP REPORT', {
        x: width / 2 + 10,
        y: y - 25,
        font: robotoBoldFontInstance,
        size: 16,
        color: rgb(0, 0, 0),
      });
      y -= 60;

      // Draw Pick Slip number and Booking Date in larger, bold font
      page.drawText('Pick Slip #:', {
        x: 25,
        y: y,
        font: robotoBoldFontInstance,
        size: 12,
        color: rgb(0, 0, 0),
      });
      page.drawText(String(data.pickSlips?.pickSlipNumberNew) || '-', {
        x: 110,
        y: y,
        font: robotoBoldFontInstance,
        size: 12,
        color: rgb(0, 0, 0),
      });

      const bookingDate = data.pickSlipSearchValues?.bookingDate
        ? new Date(data.pickSlipSearchValues.bookingDate).toLocaleDateString(
            'ru-RU'
          )
        : '-';
      page.drawText('Booking Date:', {
        x: width / 2 + 5,
        y: y,
        font: robotoBoldFontInstance,
        size: 12,
        color: rgb(0, 0, 0),
      });
      page.drawText(bookingDate, {
        x: width / 2 + 105,
        y: y,
        font: robotoBoldFontInstance,
        size: 12,
        color: rgb(0, 0, 0),
      });
      y -= 25;

      // Compact header information
      const headerInfo: Record<string, string> = {
        Store: String(data.pickSlips?.getFromID?.storeShortName || '-'),
        'WO #': String(
          data.pickSlips?.projectID?.WOReferenceID?.WONumber || '-'
        ),
        'AC Reg': String(
          data.pickSlips?.projectID?.WOReferenceID.planeId?.regNbr || '-'
        ),
        WP: String(data.pickSlips?.projectID?.projectName || '-'),
        'Trace #': String(data.pickSlips?.projectTaskID?.taskWO || '-'),
        'Task #': String(data.pickSlips?.projectTaskID?.taskNumber || '-'),
        'Task Type': t(
          valueEnumTask[data.pickSlips?.projectTaskID?.projectItemType] || '-'
        ),
      };

      const headerColumnWidth = (width - 40) / 3;
      Object.entries(headerInfo).forEach(([key, value], index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);

        page.drawText(`${key}:`, {
          x: 25 + col * headerColumnWidth,
          y: y - row * 15,
          font: robotoFontInstance,
          size: 8,
          color: rgb(0, 0, 0),
        });
        page.drawText(value, {
          x: 25 + col * headerColumnWidth + 50,
          y: y - row * 15,
          font: robotoBoldFontInstance,
          size: 8,
          color: rgb(0, 0, 0),
        });
      });
      y -= 40;

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

      // Moved footer and remarks section
      const footerY = 50;
      const remarksY = footerY + 20; // Увеличен отступ для remarks

      // Draw remarks border
      page.drawRectangle({
        x: 50,
        y: remarksY,
        width: width - 100,
        height: 60,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      // Add "Remarks:" label
      page.drawText('Remarks:', {
        x: 55,
        y: remarksY + 45,
        font: robotoBoldFontInstance,
        size: 10,
        color: rgb(0, 0, 0),
      });

      // Add checkboxes vertically
      const checkboxSize = 7;
      const verticalSpacing = 12;
      const startY = remarksY + 30;

      [0, 1, 2].forEach((i) => {
        page.drawRectangle({
          x: 65,
          y: startY - i * verticalSpacing,
          width: checkboxSize,
          height: checkboxSize,
          borderColor: rgb(0, 0, 0),
          borderWidth: 0.5,
        });
      });

      // Signatures section
      page.drawText('Storeman:', {
        x: 50,
        y: footerY,
        font: robotoBoldFontInstance,
        size: 10,
        color: rgb(0, 0, 0),
      });
      page.drawText(data.pickSlipSearchValues?.storeManName || '-', {
        x: 110,
        y: footerY,
        font: robotoFontInstance,
        size: 10,
        color: rgb(0, 0, 0),
      });

      page.drawText('Mech:', {
        x: width / 2 + 50,
        y: footerY,
        font: robotoBoldFontInstance,
        size: 10,
        color: rgb(0, 0, 0),
      });
      page.drawText(data.pickSlipSearchValues?.userName || '-', {
        x: width / 2 + 90,
        y: footerY,
        font: robotoFontInstance,
        size: 10,
        color: rgb(0, 0, 0),
      });

      return { page, y };
    };

    let { page, y } = await addPage();

    // Table data
    for (const item of data.rowDataForSecondContainer) {
      if (y < 150) {
        // Увеличен порог для новой страницы, чтобы учесть место для remarks
        const newPageResult = await addPage();
        page = newPageResult.page;
        y = newPageResult.y;
      }

      let x = 25;
      [
        item.PART_NUMBER_BOOKED,
        item.DESCRIPTION,
        item.LOCAL_ID,
        item.SERIAL_NUMBER ||
          item.BATCH_NUMBER ||
          item.SUPPLIER_BATCH_NUMBER ||
          item.BATCH,
        item.bookedQty,
        item.canceledQty,
        item.UNIT_OF_MEASURE,
        item.STOCK,
        item.LOCATION,
      ].forEach((cellValue, index) => {
        page.drawRectangle({
          x,
          y: y - 20,
          width: columnWidths[index],
          height: 20,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
        const upperCaseValue = String(cellValue || '').toUpperCase();
        const truncatedText = truncateText(
          upperCaseValue,
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
      y -= 20;
    }

    // Add page numbers and footer
    const totalPages = pdfDoc.getPageCount();
    for (let i = 0; i < totalPages; i++) {
      const page = pdfDoc.getPage(i);
      addPageNumber(page, i + 1, totalPages, robotoFontInstance);
      addMainPageText(page, robotoFontInstance, i + 1);
    }

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
      loading={loading}
      disabled={disabled || loading}
      size="small"
      onClick={generatePdf}
    >
      {t('PRINT PICK SLIP')}
    </Button>
  );
};

export default PickSlipGenerator;
