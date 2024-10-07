// ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from 'antd';
import Handlebars from 'handlebars';
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { getFileFromServer, uploadFileServer } from '@/utils/api/thunks';
import fontkit from '@pdf-lib/fontkit';
import robotoBoldFont from '../../fonts/Roboto-Bold.ttf';
import robotoFontt from '../../fonts/Roboto-Regular.ttf'; // Путь к вашему шрифту
import logoImage from '../../assets/img/407Technics_logo.png'; // Путь к вашему логотипу
import {
  useGetProjectGroupPanelsQuery,
  useGetProjectItemsWOQuery,
  useGetProjectPanelsQuery,
  useUpdateProjectPanelsMutation,
} from '@/features/projectItemWO/projectItemWOApi';
import { useTranslation } from 'react-i18next';
import { transformToIProjectTask } from '@/services/utilites';
import axios from 'axios';
import { COMPANY_ID, SING } from '@/utils/api/http';

const PdfGeneratorPanel: React.FC<{
  htmlTemplate: string;
  data: any;
  ids?: any;
  disabled?: any;
  wo?: any;
}> = ({ htmlTemplate, data, ids, disabled, wo }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false); // Состояние загрузки
  console.log(wo);
  const {
    data: projectTasks,
    isLoading,
    isFetching,
    refetch,
  } = useGetProjectPanelsQuery(
    {
      WOReferenceID: wo?._id,
    },
    {
      skip: !wo?._id,
    }
  );

  const transformedTasks = useMemo(() => {
    return projectTasks || [];
  }, [projectTasks]);
  console.log(transformedTasks);

  const addPageNumber = async (
    page: PDFPage,
    pageNumber: number,
    totalPages: number
  ) => {
    const { width, height } = page.getSize();
    const font = await page.doc.embedFont(StandardFonts.Helvetica);

    // Добавление нумерации страниц внизу страницы
    page.drawText(`Page ${pageNumber} of ${totalPages}`, {
      x: width - 100,
      y: 15, // Размещение внизу страницы
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
    const { width, height } = page.getSize();

    const currentDate = new Date();
    const formattedDate = `${currentDate
      .getDate()
      .toString()
      .padStart(2, '0')}.${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}.${currentDate.getFullYear()} ${currentDate
      .getHours()
      .toString()
      .padStart(2, '0')}:${currentDate
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    // Добавление текста на дополнительные страницы
    page.drawText(`FORM 001 rev.01 Printed by ${SING} ${formattedDate} `, {
      x: 50,
      y: 15, // Размещение внизу страницы
      size: 8,
      font,
      color: rgb(0, 0, 0),
    });
  };

  const generatePdf = async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    setLoading(true);

    // Загрузка шрифтов и изображений
    const fontBytes = await fetch(robotoFontt).then((res) => res.arrayBuffer());
    const robotoFont = await pdfDoc.embedFont(fontBytes);
    const fontBytesB = await fetch(robotoBoldFont).then((res) =>
      res.arrayBuffer()
    );
    const fontSize = 8;
    const fontSizeM = 7;
    const smallerFontSize = 9;
    const smallFontSize = 5;
    const lageFontSize = 13;
    const extraLageFontSize = 18;
    const fillColor = rgb(0.9, 0.9, 0.9);
    const robotoFontB = await pdfDoc.embedFont(fontBytesB);
    const logoBytes = await fetch(logoImage).then((res) => res.arrayBuffer());
    const logoImageEmbed = await pdfDoc.embedPng(logoBytes);
    // let totalPages = 0;
    let blockStartIndex = 0;

    const addPage = async (initialY: number) => {
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points (width, height)
      const { width, height } = page.getSize();
      const headerTable = [['logo', 'title']];
      let y = height - 30;

      const cellData189 = [
        {
          label: '',
          label1: '',
          value: '',
        },
        {
          label: 'ACCESS PANELS/DOORS OPENING AND CLOSING CHECK LIST',
          label1: 'WO:',

          value: wo?.WOName ? wo?.WOName : '',
        },
      ];
      const cellWidthsrT = [166, 334];
      const cellHeight = 40;
      for (let i = 0; i < cellData189.length; i++) {
        let x = 50;
        const cell = cellData189[i];
        const cellX = cellWidthsrT
          .slice(0, i)
          .reduce((sum, width) => sum + width, 50); // Суммируем ширину предыдущих ячеек для вычисления x-координаты
        const cellWidthAdjusted = cellWidthsrT[i]; // Ширина текущей ячейки

        // Draw the cell border
        page.drawImage(logoImageEmbed, {
          x: x + 10, // Adjusted x position for logo
          y: y - 47, // Adjusted y position for logo
          width: 147,
          height: 30,
        });
        page.drawRectangle({
          x: cellX,
          y: y - 50,
          width: cellWidthAdjusted,
          height: 50,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        // Draw the label
        page.drawText(cell.label, {
          x: cellX + 5,
          y: y - 15,
          font: robotoFont,
          size: 11,
        });

        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 35,
          font: robotoFont,
          size: lageFontSize,
        });
        // Draw the value
        page.drawText(cell.value, {
          x: cellX + 30,
          y: y - 35,
          font: robotoFont,
          size: lageFontSize,
        });
      }
      y -= 50;

      const cellData180 = [
        {
          label: 'A/C Reg.',
          label1: 'Рег. Номер ВС',
          value: wo?.planeId?.regNbr ?? '',
        },
        {
          label: 'A/C Type',
          label1: 'ТИП ВС',
          value: wo?.planeId?.acTypeId[0].code ?? '',
        },
        {
          label: 'MSN',
          label1: 'Заводской номер',
          value: wo?.planeId?.serialNbr ? String(wo?.planeId?.serialNbr) : '',
        },
      ];
      const cellWidthsr = [166, 166, 168]; // Ширина первой ячейки и остальных ячеек
      for (let i = 0; i < cellData180.length; i++) {
        const cell = cellData180[i];
        const cellX = cellWidthsr
          .slice(0, i)
          .reduce((sum, width) => sum + width, 50); // Суммируем ширину предыдущих ячеек для вычисления x-координаты
        const cellWidthAdjusted = cellWidthsr[i]; // Ширина текущей ячейки

        // Draw the cell border
        page.drawRectangle({
          x: cellX,
          y: y - 40,
          width: cellWidthAdjusted,
          height: 40,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        // Draw the label
        page.drawText(cell.label, {
          x: cellX + 5,
          y: y - 6,
          font: robotoFont,
          size: smallFontSize,
        });

        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 12,
          font: robotoFont,
          size: smallFontSize,
        });
        // Draw the value
        page.drawText(cell.value, {
          x: cellX + 10,
          y: y - 30,
          font: robotoFont,
          size: extraLageFontSize,
        });
      }
      y -= cellHeight;
      const cellData1Table = [
        {
          label: 'ACCESS',
          label1: '',
          value: '',
        },
        {
          label: 'REMOVED/OPENED',
          label1: '',
          value: '',
        },
        {
          label: 'INSTALLED/CLOSED',
          label1: '',
          value: '',
        },
        {
          label: 'INSPECTOR',
          label1: '',
          value: '',
        },
      ];

      const cellWidthsrTable = [80, 140, 140, 140]; // Ширина первой ячейки и остальных ячеек

      for (let i = 0; i < cellData1Table.length; i++) {
        let x = 50;
        const cell = cellData1Table[i];
        const cellX = cellWidthsrTable
          .slice(0, i)
          .reduce((sum, width) => sum + width, 50); // Суммируем ширину предыдущих ячеек для вычисления x-координаты
        const cellWidthAdjusted = cellWidthsrTable[i]; // Ширина текущей ячейки

        // Draw the cell border

        page.drawRectangle({
          x: cellX,
          y: y - 20,
          width: cellWidthAdjusted,
          height: 20,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
          color: fillColor, //
        });

        // Draw the label
        page.drawText(cell.label, {
          x: cellX + 5,
          y: y - 15,
          font: robotoFont,
          size: lageFontSize,
        });

        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 35,
          font: robotoFont,
          size: lageFontSize,
        });
        // Draw the value
        page.drawText(cell.value, {
          x: cellX + 30,
          y: y - 35,
          font: robotoFont,
          size: lageFontSize,
        });
      }
      y -= 20;
      return { page, y };
    };

    const partNumbersTable = [
      // ['ACCESS', 'REMOVED/OPENED', 'INSTALLED/CLOSED', 'Inspector'],
      ...(projectTasks && projectTasks.length > 0
        ? projectTasks.map((part: any) => [
            String(part?.accessItemID?.accessNbr || ''),
            `${part?.removeUserId?.firstNameEnglish?.toUpperCase() || ''} ${
              part?.removeUserId?.lastNameEnglish?.toUpperCase() || ''
            }\n    ${part?.removeUserId?.organizationAuthorization || ''}`,
            `${part?.installUserId?.firstNameEnglish?.toUpperCase() || ''} ${
              part?.installUserId?.lastNameEnglish?.toUpperCase() || ''
            } \n  ${part?.installUserId?.organizationAuthorization || ''}`,
            `${part?.inspectedUserID?.firstNameEnglish?.toUpperCase() || ''} ${
              part?.inspectedUserID?.lastNameEnglish?.toUpperCase() || ''
            }\n   ${part?.inspectedUserID?.organizationAuthorization || ''}`,
          ])
        : [
            // ['', '', '', '', ''],
            // ['', '', '', '', ''],
          ]),
    ];

    const drawMultilineText = (
      page: PDFPage,
      text: string,
      x: number,
      y: number,
      font: PDFFont,
      fontSize: number,
      lineHeight: number
    ) => {
      const lines = text.split('\n');
      lines.forEach((line, index) => {
        page.drawText(line, {
          x,
          y: y - index * lineHeight,
          font,
          size: fontSize,
        });
      });
    };
    const truncateText = (
      text: any,
      maxWidth: number,
      font: PDFFont,
      fontSize: number
    ) => {
      let truncated = text;
      let width = font.widthOfTextAtSize(truncated, fontSize);

      if (width <= maxWidth) {
        return truncated;
      }

      while (width > maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
        width = font.widthOfTextAtSize(truncated + '...', fontSize);
      }

      return truncated + '...';
    };
    const partNumbersColumnWidths = [80, 140, 140, 140]; // Ширина колонок
    const partNumbersRowHeight = 35; // Высота строки

    let { page, y } = await addPage(841.89);

    for (const row of partNumbersTable) {
      let x = 50;
      for (let i = 0; i < row.length; i++) {
        const cell = row[i];

        if (cell !== undefined) {
          const cellWidth = partNumbersColumnWidths[i];
          const truncatedCell = truncateText(
            cell,
            cellWidth - 10,
            robotoFont,
            fontSize
          );

          if (y - partNumbersRowHeight < 50) {
            // Если строка не помещается, создаем новую страницу
            const newPageResult = await addPage(841.89);
            page = newPageResult.page;
            y = newPageResult.y;
          }

          drawMultilineText(
            page,
            truncatedCell,
            x + 15,
            y - 10,
            robotoFont,
            10,
            15
          );
        }
        // Рисуем границу вокруг ячейки
        page.drawRectangle({
          x,
          y: y - partNumbersRowHeight,
          width: partNumbersColumnWidths[i],
          height: partNumbersRowHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
        x += partNumbersColumnWidths[i];
      }
      y -= partNumbersRowHeight;
    }

    // Добавление номера страницы на текущую страницу
    const totalPages = pdfDoc.getPageCount();
    for (let i = 0; i < totalPages; i++) {
      const page = pdfDoc.getPage(i);
      await addPageNumber(page, i + 1, totalPages);
      addMainPageText(page, robotoFont, i + 1);
    }

    // Добавление строки на последней странице
    const lastPage = pdfDoc.getPage(totalPages - 1);
    const { width } = lastPage.getSize();
    lastPage.drawText(
      'STA: _______________________________                                DATA: _____________________',
      {
        x: 50,
        y: 60,
        font: robotoFont,
        size: 10,
      }
    );
    lastPage.drawText(
      'NAME: ____________________________      SIGNATURE: ______________________    STAMP: ___________',
      {
        x: 50,
        y: 40,
        font: robotoFont,
        size: 10,
      }
    );

    // Создание и открытие финального PDF-документа
    const finalPdfBytes = await pdfDoc.save();
    const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL, '_blank');
    URL.revokeObjectURL(fileURL);

    console.log('PDF успешно создан');
    setLoading(false);
  };

  return (
    <div>
      <Button
        loading={loading}
        disabled={disabled || loading}
        size="small"
        onClick={generatePdf}
      >
        {`${t('PRINT ACCESS PANELS/DOORS OPENING AND CLOSING CHECK LIST')}`}
      </Button>
    </div>
  );
};

export default PdfGeneratorPanel;
