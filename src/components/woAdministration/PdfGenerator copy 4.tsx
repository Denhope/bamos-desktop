// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from 'antd';
import Handlebars from 'handlebars';
import { SaveOutlined } from '@ant-design/icons';
import {
  PDFDocument,
  PDFFont,
  rgb,
  StandardFonts,
  degrees,
  PDFPage,
  PDFName, // Добавляем импорт
  PDFString,
} from 'pdf-lib';
import QRCode from 'qrcode';
import { getFileFromServer, uploadFileServer } from '@/utils/api/thunks';
import fontkit from '@pdf-lib/fontkit';
import robotoBoldFont from '../../fonts/Roboto-Bold.ttf';
import robotoFontt from '../../fonts/Roboto-Regular.ttf'; // Путь к вашему шрифту
import logoImage from '../../assets/img/407Technics_logo.png'; // Путь к вашему логотипу
import {
  useGetProjectItemsWOQuery,
  useGetProjectTaskForCardQuery,
} from '@/features/projectItemWO/projectItemWOApi';
import { useTranslation } from 'react-i18next';
import { transformToIProjectTask } from '@/services/utilites';
import axios from 'axios';
import { COMPANY_ID, SING } from '@/utils/api/http';

const PdfGenerator: React.FC<{
  htmlTemplate: string;
  data: any;
  ids?: any;
  disabled?: any;
  wo?: any;
  isAddTextVisible?: boolean;
  isOriginal?: boolean;
  buttonText?: string;
}> = ({
  htmlTemplate,
  data,
  ids,
  disabled,
  wo,
  isOriginal = false,
  buttonText,
  isAddTextVisible = false,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false); // Состояние загрузки
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [shouldFetchData, setShouldFetchData] = useState(false);
  const [isPdfRequested, setIsPdfRequested] = useState(false);
  const [pdfAction, setPdfAction] = useState<'view' | 'save' | null>(null);

  const {
    data: projectTasks,
    isLoading,
    isFetching,
    refetch,
  } = useGetProjectTaskForCardQuery(
    {
      ids: ids,
    },
    {
      skip: !shouldFetchData || !ids.length, // Добавляем shouldFetchData в условие пропуска
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    }
  );
  const transformedTasks = useMemo(() => {
    return (
      projectTasks?.map((task) => ({
        ...task,
        // Можно добавить дополнительные трансформации данных здесь
      })) || []
    );
  }, [projectTasks]);
  // console.log(projectTasks);
  const addPageNumber = async (
    page: PDFPage,
    pageNumber: number,
    totalPages: number
  ) => {
    const { width, height } = page.getSize();
    const font = await page.doc.embedFont(StandardFonts.Helvetica);

    // Добавление нумерации страниц
    page.drawText(`Page ${pageNumber} of ${totalPages}`, {
      x: width - 100,
      y: height - 50,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  };

  const mergePdfs = async (
    mainPdf: Uint8Array,
    additionalPdfs: Uint8Array[]
  ): Promise<Uint8Array> => {
    const mainDoc = await PDFDocument.load(mainPdf);
    let currentPageNumber = mainDoc.getPageCount();

    for (const pdf of additionalPdfs) {
      const additionalDoc = await PDFDocument.load(pdf);
      const pages = await mainDoc.copyPages(
        additionalDoc,
        additionalDoc.getPageIndices()
      );

      for (const page of pages) {
        mainDoc.addPage(page);
        await addPageNumber(page, currentPageNumber++, mainDoc.getPageCount());
      }
    }

    return await mainDoc.save();
  };

  const generatePdf = () => {
    setIsViewLoading(true);
    setShouldFetchData(true);
    setIsPdfRequested(true);
    setPdfAction('view');
  };

  const generateAndSavePdf = () => {
    setIsSaveLoading(true);
    setShouldFetchData(true);
    setIsPdfRequested(true);
    setPdfAction('save');
  };

  const createPdfDocument = async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    setLoading(true);
    // Добавляем метаданные в PDF
    const firstTask = transformedTasks[0];
    const fileName = `${firstTask?.taskNumber || 'unknown'}`;
    // Устанавливаем метаданные
    const info = pdfDoc.getInfoDict();
    info.set(PDFName.of('FileName'), PDFString.of(fileName));
    info.set(PDFName.of('Title'), PDFString.of(fileName));

    pdfDoc.setTitle(fileName);

    pdfDoc.setAuthor('BAMOS');
    pdfDoc.setSubject(`Work Order Task: ${firstTask?.taskNumber}`);
    pdfDoc.setKeywords(['task', 'work order', 'BAMOS']);
    pdfDoc.setProducer('BAMOS PDF Generator');
    pdfDoc.setCreator('BAMOS System');
    // Загрузка шрифтов и изображений
    const fontBytes = await fetch(robotoFontt).then((res) => res.arrayBuffer());
    const robotoFont = await pdfDoc.embedFont(fontBytes);
    const fontBytesB = await fetch(robotoBoldFont).then((res) =>
      res.arrayBuffer()
    );
    const robotoFontB = await pdfDoc.embedFont(fontBytesB);
    const logoBytes = await fetch(logoImage).then((res) => res.arrayBuffer());
    const logoImageEmbed = await pdfDoc.embedPng(logoBytes);

    let totalPages = 0;
    let blockStartIndex = 0;
    const fontSize = 9;
    const fontSizeM = 7;
    const smallFontSize = 5;
    const lageFontSize = 13;
    const extraLageFontSize = 16;

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

    const truncateValue = (value: string, maxLength: number) => {
      return value.length > maxLength
        ? value.slice(0, maxLength) + '...'
        : value;
    };

    for (const task of transformedTasks) {
      const pages = [];
      const qrCodeData = await QRCode.toDataURL(`${task?.taskWO}`);
      const qrCodeImage = await pdfDoc.embedPng(qrCodeData);

      const addPage = () => {
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points (width, height)
        pages.push(page); // Добавление страницы в массив
        const { width, height } = page.getSize();
        // const firstPage = pdfDoc.getPage(0);
        // const { width: widthCr, height: hightCr } = firstPage.getSize();
        // firstPage.drawText('CRITICAL TASK', {
        //   x: widthCr / 4,
        //   y: hightCr / 1.3,
        //   font: robotoFontB,
        //   size: 60,
        //   color: rgb(1, 0, 0), // Красный цвет
        //   rotate: degrees(-45), // Поворот на 45 градусов против часовой стрелки
        //   opacity: 0.5, // Полупрозрачность
        // });

        // Header
        const headerTable = [['logo', 'title', 'QR Code']];

        let y = height - 30;
        for (const row of headerTable) {
          let x = 50;
          for (let i = 0; i < row.length; i++) {
            console.log(task);
            const cell = row[i];
            const taskCardNumberText =
              task?.taskNumber !== undefined ? String(task.taskNumber) : 'N/A';

            const truncatedTaskNumberText = truncateText(
              taskCardNumberText,
              170,
              robotoFont,
              12
            );

            if (cell === 'title') {
              page.drawText(truncatedTaskNumberText, {
                x: x + 105,
                y: y - 25,
                font: robotoFontB,
                size: 14,
              });
              // HARD_ACCESS

              if (task.projectItemType == 'NRC_ADD') {
                page.drawText('ADHOC TASK', {
                  x: x + 10,
                  y: y - 25,
                  font: robotoFontB,
                  size: 14,
                });
              }
              if (task.projectItemType == 'HARD_ACCESS') {
                page.drawText('HARD ACCESS', {
                  x: x + 10,
                  y: y - 25,
                  font: robotoFontB,
                  size: 14,
                });
              }
              if (
                task.projectItemType !== 'NRC' &&
                task.projectItemType !== 'HARD_ACCESS' &&
                task.projectItemType !== 'NRC_ADD'
              ) {
                page.drawText('TASK CARD', {
                  x: x + 10,
                  y: y - 25,
                  font: robotoFontB,
                  size: 14,
                });
              }
              if (task.projectItemType == 'NRC') {
                page.drawText('NRC', {
                  x: x + 10,
                  y: y - 25,
                  font: robotoFontB,
                  size: 14,
                });
              }

              // page.drawText('КАРТА НА ВЫПОЛНЕНИЕ РЕГЛАМЕНТНЫХ РАБОТ', {
              //   x: x + 5,
              //   y: y - 30,
              //   font: robotoFontB,
              //   size: fontSize,
              // });
              page.drawLine({
                start: { x: x, y: y - 36.8 },
                end: { x: x + 300, y: y - 36.8 },
                thickness: 1,
                color: rgb(0, 0, 0),
              });
              if (task.projectItemType !== 'NRC') {
                page.drawText('Title', {
                  x: x + 5,
                  y: y - 65,
                  font: robotoFont,
                  size: smallFontSize,
                });
              }
              if (task.projectItemType == 'NRC') {
                page.drawText('AC Type', {
                  x: x + 5,
                  y: y - 65,
                  font: robotoFont,
                  size: smallFontSize,
                });

                page.drawText('MSN', {
                  x: x + 105,
                  y: y - 65,
                  font: robotoFont,
                  size: smallFontSize,
                });
                page.drawText('Customer', {
                  x: x + 205,
                  y: y - 65,
                  font: robotoFont,
                  size: smallFontSize,
                });

                if (task.projectItemType == 'NRC') {
                  // Рисуем две вертикальные линии для разделения поля title
                  const lineX1 = x + 100; // Первая линия
                  const lineX2 = x + 200; // Вторая линия

                  page.drawLine({
                    start: { x: lineX1, y: y - 36.2 },
                    end: { x: lineX1, y: y - 72 },
                    thickness: 1,
                    color: rgb(0, 0, 0),
                  });

                  page.drawLine({
                    start: { x: lineX2, y: y - 36.2 },
                    end: { x: lineX2, y: y - 72 },
                    thickness: 1,
                    color: rgb(0, 0, 0),
                  });
                }
              }
              if (task.projectItemType !== 'NRC') {
                const taskNumberText =
                  task?.title !== undefined
                    ? String(task.title).toUpperCase()
                    : 'N/A';
                const truncatedTaskNumberText = truncateText(
                  taskNumberText,
                  290,
                  robotoFont,
                  10
                );

                // Смещение влево на 20 единиц
                page.drawText(truncatedTaskNumberText, {
                  x: x + 5, // Изменено с x + 85 на x + 65
                  y: y - 55,
                  font: robotoFont,
                  size: 10,
                });
              }

              if (task.projectItemType == 'NRC') {
                const acTypeText =
                  task?.acType !== undefined
                    ? String(task.acType).toUpperCase()
                    : 'N/A';
                const truncatedAcTypeText = truncateText(
                  acTypeText,
                  80,
                  robotoFont,
                  12
                );
                const acTypeMSN =
                  task?.ACMSN !== undefined
                    ? String(task.ACMSN).toUpperCase()
                    : 'N/A';
                const truncatedacTypeMSN = truncateText(
                  acTypeMSN,
                  80,
                  robotoFont,
                  12
                );

                const accustomerCode =
                  task?.customerCode !== undefined
                    ? String(task.customerCode).toUpperCase()
                    : 'N/A';
                const truncatedCode = truncateText(
                  accustomerCode,
                  85,
                  robotoFont,
                  12
                );

                // Смещение влево на 20 единиц
                page.drawText(truncatedAcTypeText, {
                  x: x + 25, // Изменено с x + 85 на x + 65
                  y: y - 55,
                  font: robotoFont,
                  size: 12,
                });

                page.drawText(truncatedacTypeMSN, {
                  x: x + 125, // Изменено с x + 85 на x + 65
                  y: y - 55,
                  font: robotoFont,
                  size: 12,
                });
                page.drawText(truncatedCode, {
                  x: x + 205, // Изменено с x + 85 на x + 65
                  y: y - 55,
                  font: robotoFont,
                  size: 12,
                });
              }
              if (task.projectItemType !== 'NRC') {
                page.drawText('Описание', {
                  x: x + 5,
                  y: y - 70,
                  font: robotoFont,
                  size: smallFontSize,
                });
              }
              if (task.projectItemType == 'NRC') {
                page.drawText('Тип ВС', {
                  x: x + 5,
                  y: y - 70,
                  font: robotoFont,
                  size: smallFontSize,
                });
                page.drawText('Заводской номер', {
                  x: x + 105,
                  y: y - 70,
                  font: robotoFont,
                  size: smallFontSize,
                });
                page.drawText('Заказчик', {
                  x: x + 205,
                  y: y - 70,
                  font: robotoFont,
                  size: smallFontSize,
                });
              }
            } else if (cell === 'QR Code') {
              page.drawImage(qrCodeImage, {
                x: x + 20, // Adjusted x position for QR code
                y: y - 50, // Adjusted y position for QR code
                width: 50,
                height: 50,
              });
              page.drawText('Trace №', {
                x: x + 5,
                y: y - 65,
                font: robotoFont,
                size: smallFontSize,
              });
              page.drawText('Идент. номер', {
                x: x + 5,
                y: y - 70,
                font: robotoFont,
                size: smallFontSize,
              });
              page.drawText(`${task?.taskWO}`, {
                x: x + 45,
                y: y - 60,
                font: robotoFont,
                size: lageFontSize,
              });
            } else if (cell === 'logo') {
              page.drawImage(logoImageEmbed, {
                x: x + 10, // Adjusted x position for logo
                y: y - 30, // Adjusted y position for logo
                width: 80,
                height: 20,
              });
              // Draw horizontal line
              page.drawLine({
                start: { x: x, y: y - 36.8 },
                end: { x: x + 100, y: y - 36.8 },
                thickness: 1,
                color: rgb(0, 0, 0),
              });
              // Add text below the line
              page.drawText('A/C Reg.', {
                x: x + 5,
                y: y - 65,
                font: robotoFont,
                size: smallFontSize,
              });

              page.drawText('Рег. Номер ВС', {
                x: x + 5,
                y: y - 70,
                font: robotoFont,
                size: smallFontSize,
              });
              // Add taskCardNumber or N/A to the right
              // const taskCardNumberText =
              //   task?.cardNumber !== undefined
              //     ? String(task.cardNumber)
              //     : 'N/A';
              const taskCardNumberText =
                task?.ACRegistration !== undefined
                  ? String(task.ACRegistration)
                  : 'N/A';
              page.drawText(taskCardNumberText, {
                x: x + 40,
                y: y - 65,
                font: robotoFont,
                size: lageFontSize,
              });
            } else {
              if (cell !== undefined) {
                page.drawText(cell, {
                  x: x + 5,
                  y: y - 15,
                  font: robotoFont,
                  size: fontSize,
                });
              }
            }
            // Draw border around the cell

            page.drawRectangle({
              x,
              y: y - 72, // Adjusted height for the QR code cell
              width: i === 1 ? 300 : 100, // Adjusted width for the merged cell
              height: 72, // Adjusted height for the QR code cell
              borderColor: rgb(0, 0, 0),
              borderWidth: 1,
            });
            x += i === 1 ? 300 : 100; // Adjusted width for the merged cell
          }
          y -= 72; // Adjusted for two lines of text and QR code
        }

        return { page, width, height, y };
      };

      const drawFooter = (page: any) => {
        // const pageCount = pdfDoc.getPageCount();
        // page.drawText(`Page ${pageCount} of ${pageCount}`, {
        //   x: 50,
        //   y: 30,
        //   font: robotoFont,
        //   size: smallFontSize,
        // });
        // page.drawText(`${new Date().toLocaleString()}`, {
        //   x: 450,
        //   y: 30,
        //   font: robotoFont,
        //   size: smallFontSize,
        // });
      };

      let { page, width, height, y } = addPage();

      const checkValue = (value: any): string => {
        if (
          value === undefined ||
          value === null ||
          String(value).trim() === ''
        ) {
          return 'N/A';
        }
        return String(value);
      };
      const cellDataNRC2 = [
        {
          label: 'Station',
          label1: 'Произв. база',
          value: checkValue(task.station, 'MSQ'),
        },
        {
          label: '',
          label1: 'ATA ',
          value: checkValue(task.ata),
        },
        {
          label: 'Zone',
          label1: 'Зона',
          value: checkValue(task.zones),
        },
        {
          label: 'AC Area',
          label1: 'Область',
          value: checkValue(task.taskArea),
        },
      ];

      const cellDataNRC3 = [
        {
          label: 'Work Pack',
          label1: 'Пакет Работ',
          value: checkValue(task.WPNumber),
        },
        {
          label: 'Customer WO',
          label1: 'Заявка Заказчика',
          value: checkValue(task.custumerWO),
        },
        {
          label: 'Internal WO',
          label1: 'Заказ-Наряд',
          value: checkValue(task.WONumber),
        },
        {
          label: 'WP Card Seq',
          label1: 'Номер в пакете',
          value: checkValue(task.taskWONumber),
        },
      ];

      const cellData = [
        {
          label: 'A/C Type',
          label1: 'Тип ВС',
          value: truncateValue(checkValue(task.acType), 20),
          value1: '',
        },
        {
          label: 'Work Pack',
          label1: 'Пакет Работ',
          value1: '',
          value: truncateValue(checkValue(task.WPNumber), 20),
        },
        {
          label: 'Customer WO',
          label1: 'Заявка Заказчика',
          value: '',
          value1: truncateValue(checkValue(task.custumerWO), 38),
        },
        {
          label: 'Card No',
          label1: 'Карта №',
          value1: '',
          value: truncateValue(checkValue(task.cardNumber), 20),
        },
      ];

      const cellData3 = [
        {
          label: 'MSN',
          label1: 'Заводской номер',
          value: checkValue(task.ACMSN),
        },
        {
          label: 'Reference',
          label1: 'Ссылка на ЭТД',
          value: checkValue(task.amtoss),
        },
        {
          label: 'Raised Date',
          label1: 'Дата Создания',
          value: checkValue(task.createDate),
        },
      ];

      const cellData4 = [
        {
          label: 'Customer',
          label1: 'Заказчик',
          value: checkValue(task.customerCode),
        },
        {
          label: 'Access',
          label1: 'Доступ',
          value: checkValue(task.access),
        },
        {
          label: 'Raised By',
          label1: 'Подготовлено',
          value: checkValue(task.createBySing),
        },
      ];

      const cellData5 = [
        {
          label: 'Cust. ID Code',
          label1: 'Код Заказчика',
          value: checkValue(task.customerCodeID),
        },
        {
          label: 'Zone',
          label1: 'Зона',
          value: checkValue(task.zones),
        },
        {
          label: 'AC Area',
          label1: 'Область',
          value: checkValue(task.taskArea),
        },
        {
          label: 'Internal WO',
          label1: 'Заказ-Наряд',
          value: checkValue(task.WONumber),
        },
      ];

      const cellData6 = [
        {
          label: 'Station',
          label1: 'Произв. база',
          value: checkValue(task.station, 'MSQ'),
        },
        {
          label: 'Inspection',
          label1: 'Тип Инспекции',
          value: checkValue(task.taskCode),
        },
        {
          label: 'Skill',
          label1: 'Специализация',
          value: checkValue(task.skills),
        },
        {
          label: 'Mhrs',
          label1: 'Трудозатраты',
          value: checkValue(task.mainWorkTime),
        },
        {
          label: 'WP Card Seq',
          label1: 'Номер в пакете',
          value: checkValue(task.taskWONumber),
        },
      ];

      const cellData7 = [
        {
          label: 'Related documents and references',
          label1: 'Сопутствующие документы и ссылки',
          value: '',
        },
      ];

      const cellHeight = 25;
      const cellHeightSmall = 20;
      const cellWidth = 100;

      const cellWidths = [100, 100, 200, 100]; // Ширина первой ячейки 50, второй ячейки 200
      const totalCellWidth = cellWidths.reduce((sum, width) => sum + width, 0);

      if (task.projectItemType == 'NRC') {
        const cellWidthsNRC2 = [100, 100, 200, 100];
        for (let i = 0; i < cellData5.length; i++) {
          const cell = cellDataNRC2[i];
          const horizontalPadding = [45, 20, 25, 45];
          const truncatedValue = truncateText(
            cell.value,
            cellWidthsNRC2[i] - 20, // Use the adjusted width for truncation
            robotoFont,
            fontSize
          );
          const cellX =
            50 +
            cellWidthsNRC2.slice(0, i).reduce((sum, width) => sum + width, 0);
          const cellWidth1 = cellWidthsNRC2[i];

          // Draw the cell border
          page.drawRectangle({
            x: cellX,
            y: y - cellHeight,
            width: cellWidth1,
            height: cellHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });

          // Draw the label
          page.drawText(cell.label, {
            x: cellX + 5,
            y: y - 18,
            font: robotoFont,
            size: smallFontSize,
          });

          page.drawText(cell.label1, {
            x: cellX + 5,
            y: y - 23,
            font: robotoFont,
            size: smallFontSize,
          });

          // Draw the value
          page.drawText(truncatedValue, {
            x: cellX + horizontalPadding[i],
            y: y - 15,
            font: robotoFont,
            size: fontSize,
          });
        }
        y -= cellHeight;

        y -= 0;
        const cellWidthsNRC3 = [100, 200, 100, 100];
        for (let i = 0; i < cellData5.length; i++) {
          const cell = cellDataNRC3[i];
          const horizontalPadding = [45, 10, 45, 45];
          const truncatedValue = truncateText(
            cell.value,
            cellWidthsNRC3[i] - 10, // Use the adjusted width for truncation
            robotoFont,
            fontSize
          );
          const cellX =
            50 +
            cellWidthsNRC3.slice(0, i).reduce((sum, width) => sum + width, 0);
          const cellWidth1 = cellWidthsNRC3[i];

          // Draw the cell border
          page.drawRectangle({
            x: cellX,
            y: y - cellHeight,
            width: cellWidth1,
            height: cellHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });

          // Draw the label
          page.drawText(cell.label, {
            x: cellX + 5,
            y: y - 18,
            font: robotoFont,
            size: smallFontSize,
          });

          page.drawText(cell.label1, {
            x: cellX + 5,
            y: y - 23,
            font: robotoFont,
            size: smallFontSize,
          });

          // Draw the value
          page.drawText(truncatedValue, {
            x: cellX + horizontalPadding[i],
            y: y - 10,
            font: robotoFont,
            size: fontSize,
          });
        }
        y -= cellHeight;

        y -= 5; // / Space between the previous content and the new cells// / Space between the previous content and the new cells
      }
      if (task.projectItemType !== 'NRC') {
        for (let i = 0; i < cellData.length; i++) {
          const cell = cellData[i];
          const cellX =
            50 + cellWidths.slice(0, i).reduce((sum, width) => sum + width, 0);
          const cellWidth1 = cellWidths[i];

          // Draw the cell border
          page.drawRectangle({
            x: cellX,
            y: y - cellHeight,
            width: cellWidth1,
            height: cellHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });

          // Draw the label
          page.drawText(cell.label, {
            x: cellX + 5,
            y: y - 18,
            font: robotoFont,
            size: smallFontSize,
          });

          page.drawText(cell.label1, {
            x: cellX + 5,
            y: y - 23,
            font: robotoFont,
            size: smallFontSize,
          });

          // Draw the value
          page.drawText(cell.value, {
            x: cellX + 50,
            y: y - 20,
            font: robotoFont,
            size: fontSize,
          });

          page.drawText(cell.value1, {
            x: cellX + 5,
            y: y - 10,
            font: robotoFont,
            size: fontSize,
          });
        }
        y -= cellHeight;

        for (let i = 0; i < cellData3.length; i++) {
          const cell = cellData3[i];
          const cellX = 50 + (i > 0 ? 100 : 0) + (i > 1 ? 300 : 0); // Adjust x position for the cells after the first one
          const cellWidthAdjusted = cell.label === 'Reference' ? 300 : 100; // Adjust width for the "Cust. ID Code" cell

          // Draw the cell border
          page.drawRectangle({
            x: cellX,
            y: y - cellHeight,
            width: cellWidthAdjusted,
            height: cellHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });

          // Draw the label
          page.drawText(cell.label, {
            x: cellX + 5,
            y: y - 17,
            font: robotoFont,
            size: smallFontSize,
          });

          page.drawText(cell.label1, {
            x: cellX + 5,
            y: y - 22,
            font: robotoFont,
            size: smallFontSize,
          });
          // Draw the value
          const truncatedValue = truncateText(
            cell.value,
            cellWidthAdjusted - 40, // Use the adjusted width for truncation
            robotoFont,
            fontSize
          );

          page.drawText(truncatedValue, {
            x: cellX + 45,
            y: y - 15,
            font: robotoFont,
            size: fontSize,
          });
        }
        y -= cellHeight;

        y -= 0; // Space between the first and second tables

        for (let i = 0; i < cellData4.length; i++) {
          const cell = cellData4[i];
          const cellX = 50 + (i > 0 ? 100 : 0) + (i > 1 ? 300 : 0); // Adjust x position for the cells after the first one
          const cellWidthAdjusted = cell.label === 'Access' ? 300 : 100; // Adjust width for the "Cust. ID Code" cell

          // Draw the cell border
          page.drawRectangle({
            x: cellX,
            y: y - cellHeight,
            width: cellWidthAdjusted,
            height: cellHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });

          // Draw the label
          page.drawText(cell.label, {
            x: cellX + 5,
            y: y - 18,
            font: robotoFont,
            size: smallFontSize,
          });

          page.drawText(cell.label1, {
            x: cellX + 5,
            y: y - 23,
            font: robotoFont,
            size: smallFontSize,
          });

          // Draw the value
          const truncatedValue = truncateText(
            cell.value,
            cellWidthAdjusted - 40, // Use the adjusted width for truncation
            robotoFont,
            fontSize
          );

          page.drawText(truncatedValue, {
            x: cellX + 45,
            y: y - 15,
            font: robotoFont,
            size: fontSize,
          });
        }
        y -= cellHeight;

        y -= 0; // / Space between the previous content and the new cells
        const cellWidths5 = [100, 200, 100, 100];

        const horizontalPadding = [45, 20, 25, 45];

        for (let i = 0; i < cellData5.length; i++) {
          const cell = cellData5[i];
          const truncatedValue = truncateText(
            cell.value,
            cellWidths5[i] - 20, // Use the adjusted width for truncation
            robotoFont,
            fontSize
          );
          const cellX =
            50 + cellWidths5.slice(0, i).reduce((sum, width) => sum + width, 0);
          const cellWidth1 = cellWidths5[i];

          // Draw the cell border
          page.drawRectangle({
            x: cellX,
            y: y - cellHeight,
            width: cellWidth1,
            height: cellHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });

          // Draw the label
          page.drawText(cell.label, {
            x: cellX + 5,
            y: y - 18,
            font: robotoFont,
            size: smallFontSize,
          });

          page.drawText(cell.label1, {
            x: cellX + 5,
            y: y - 23,
            font: robotoFont,
            size: smallFontSize,
          });

          // Draw the value
          page.drawText(truncatedValue, {
            x: cellX + horizontalPadding[i],
            y: y - 15,
            font: robotoFont,
            size: fontSize,
          });
        }
        y -= cellHeight;

        y -= 0; // / Space between the previous content and the new cells

        for (let i = 0; i < cellData6.length; i++) {
          const cell = cellData6[i];
          const cellX = 50 + i * cellWidth;

          // Draw the cell border
          page.drawRectangle({
            x: cellX,
            y: y - cellHeight,
            width: cellWidth,
            height: cellHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });

          // Draw the label
          page.drawText(cell.label, {
            x: cellX + 5,
            y: y - 18,
            font: robotoFont,
            size: smallFontSize,
          });

          page.drawText(cell.label1, {
            x: cellX + 5,
            y: y - 23,
            font: robotoFont,
            size: smallFontSize,
          });
          // Draw the value
          const truncatedValue = truncateText(
            cell.value,
            cellWidth - 40,
            robotoFont,
            12
          );
          page.drawText(truncatedValue, {
            x: cellX + 45,
            y: y - 15,
            font: robotoFont,
            size: fontSize,
          });
        }
        y -= cellHeight;
        y -= 5;
      }
      for (let i = 0; i < cellData7.length; i++) {
        const cell = cellData7[i];

        const cellX = 50 + (i > 0 ? 100 : 0) + (i > 1 ? 500 : 0); // Adjust x position for the cells after the first one
        const cellWidthAdjusted =
          cell.label === 'Related documents and references' ? 500 : 100; // Adjust width for the "Cust. ID Code" cell

        // Draw the cell border
        page.drawRectangle({
          x: cellX,
          y: y - cellHeightSmall,
          width: cellWidthAdjusted,
          height: cellHeightSmall,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
          color: rgb(0.8, 0.8, 0.8), // Gray color
        });

        // Draw the label
        page.drawText(cell.label, {
          x: cellX + 5,
          y: y - 10,
          font: robotoFont,
          size: fontSize,
        });

        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 17,
          font: robotoFont,
          size: smallFontSize,
        });
        // Draw the value
        page.drawText(cell.value, {
          x: cellX + 55,
          y: y - 13,
          font: robotoFont,
          size: 8,
        });
      }

      // y -= cellHeight;
      y -= cellHeightSmall;
      const referenceTable = [
        ['Type', 'Reference', 'Description'],
        ...(task.refTask ? [['TC', task.refTask, 'PARENT TASK']] : []),
        ...(task.externalNumber
          ? [['EXT', task.externalNumber, 'EXTERNAL NUMBER']]
          : []),
        // Добавляем refTask, если он существует
        ...(task.reference
          ? task.reference
              .filter((part: any) => part.printAsAttachment) // Фильтруем только файлы с printAsAttachment === true
              .map((part: any) => {
                let typeAbbreviation;
                switch (part?.referenceType) {
                  case 'TASK_CARD':
                    typeAbbreviation = 'TC';
                    break;
                  case 'REPORT':
                    typeAbbreviation = 'R';
                    break;
                  case 'WO':
                    typeAbbreviation = 'WO';
                    break;
                  case 'AMM':
                    typeAbbreviation = 'AMM';
                    break;
                  case 'EXT':
                    typeAbbreviation = 'EXT';
                    break;
                  default:
                    typeAbbreviation = 'F';
                }
                return [typeAbbreviation, part?.filename, part?.description];
              })
          : []),
      ];
      const referenceColumnWidths = [50, 200, 250]; // Widths for PART_NUMBER, DESCRIPTION, QUANTITY columns
      const referenceRowHeight = 15; // Height for each row in the part numbers table

      for (const row of referenceTable) {
        let x = 50;
        for (let i = 0; i < row.length; i++) {
          const cell = row[i];
          if (cell !== undefined) {
            page.drawText(cell, {
              x: x + 5,
              y: y - 10,
              font: robotoFont,
              size: 8,
            });
          }
          // Draw border around the cell
          page.drawRectangle({
            x,
            y: y - referenceRowHeight,
            width: referenceColumnWidths[i],
            height: referenceRowHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });
          x += referenceColumnWidths[i];
        }
        y -= referenceRowHeight;
      }
      y -= 5; // Space between

      // Part Numbers Table
      const cellData8 = [
        {
          label: 'Materials',
          label1: 'Расходные матриалы',
          value: '',
        },
      ];

      if (task.projectItemType !== 'NRC') {
        for (let i = 0; i < cellData8.length; i++) {
          const cell = cellData8[i];

          const cellX = 50 + (i > 0 ? 100 : 0) + (i > 1 ? 500 : 0); // Adjust x position for the cells after the first one
          const cellWidthAdjusted = cell.label === 'Materials' ? 500 : 100; // Adjust width for the "Cust. ID Code" cell

          // Draw the cell border
          page.drawRectangle({
            x: cellX,
            y: y - cellHeightSmall,
            width: cellWidthAdjusted,
            height: cellHeightSmall,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
            color: rgb(0.8, 0.8, 0.8), // Gray color
          });

          // Draw the label
          page.drawText(cell.label, {
            x: cellX + 5,
            y: y - 10,
            font: robotoFont,
            size: fontSize,
          });

          page.drawText(cell.label1, {
            x: cellX + 5,
            y: y - 17,
            font: robotoFont,
            size: smallFontSize,
          });
          // Draw the value
          page.drawText(cell.value, {
            x: cellX + 55,
            y: y - 13,
            font: robotoFont,
            size: fontSize,
          });
        }
        // y -= cellHeight;
        y -= cellHeightSmall;
      }

      const partNumbersTable = [
        ['Code', 'Part number', 'Description', 'Qty', 'Unit'],
        ...(task.parts && task.parts.length > 0
          ? task.parts
              .filter(
                (part: any) =>
                  part?.partNumberID?.GROUP &&
                  ['ROT', 'CONS', 'CHEM'].includes(part.partNumberID.GROUP)
              )
              .map((part: any) => [
                String(part?.partNumberID?.CODE || ''),
                String(part?.partNumberID?.PART_NUMBER || ''),
                String(part?.partNumberID?.DESCRIPTION || ''),
                String(part?.quantity || ''), // quantity should come from part, not partNumberID
                String(part?.partNumberID?.UNIT_OF_MEASURE || ''),
              ])
          : [
              // ['', '', '', '', ''],
              // ['', '', '', '', ''],
            ]),
      ];

      const partNumbersColumnWidths = [50, 150, 200, 50, 50]; // Ширина колонок
      const partNumbersRowHeight = 15; // Высота строки
      if (task.projectItemType !== 'NRC') {
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

              page.drawText(truncatedCell, {
                x: x + 5,
                y: y - 10,
                font: robotoFont,
                size: fontSize,
              });
            }
            // Рисуем границу вокруг ячейки
            page.drawRectangle({
              x,
              y: y - 15,
              width: partNumbersColumnWidths[i],
              height: partNumbersRowHeight,
              borderColor: rgb(0, 0, 0),
              borderWidth: 1,
            });
            x += partNumbersColumnWidths[i];
          }
          y -= partNumbersRowHeight;
        }
      }
      // Add the new row of cells below the existing content
      const cellData9 = [
        {
          label:
            'NOTE: EQUIVALENT OR ALTERNATIVE PART NUMBERS CAN BE USED IAW TECHNICAL DOCUMENTATION',
          label1:
            'ПРИМЕЧАНИЕ: Эквивалентные или альтернативные материалы могут быть использованы в соответствии с тех. документацией',
          value: '',
        },
      ];
      if (task.projectItemType !== 'NRC') {
        for (let i = 0; i < cellData9.length; i++) {
          const cell = cellData9[i];

          const cellX = 50 + (i > 0 ? 100 : 0) + (i > 1 ? 500 : 0); // Adjust x position for the cells after the first one
          const cellWidthAdjusted =
            cell.label ===
            'NOTE: EQUIVALENT OR ALTERNATIVE PART NUMBERS CAN BE USED IAW TECHNICAL DOCUMENTATION'
              ? 500
              : 100; // Adjust width for the "Cust. ID Code" cell

          // Draw the cell border
          page.drawRectangle({
            x: cellX,
            y: y - partNumbersRowHeight,
            width: cellWidthAdjusted,
            height: partNumbersRowHeight,
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
            y: y - 13,
            font: robotoFont,
            size: smallFontSize,
          });
          // Draw the value
          page.drawText(cell.value, {
            x: cellX + 55,
            y: y - 13,
            font: robotoFont,
            size: fontSize,
          });
          y -= partNumbersRowHeight;
        }
        y -= 5; // Space between
      }
      ///tooll
      const cellData11 = [
        {
          label: 'Tools and Equipment',
          label1: 'Инструмент И Оборудование',
          value: '',
        },
      ];
      if (task.projectItemType !== 'NRC') {
        for (let i = 0; i < cellData11.length; i++) {
          const cell = cellData11[i];

          const cellX = 50 + (i > 0 ? 100 : 0) + (i > 1 ? 500 : 0); // Adjust x position for the cells after the first one
          const cellWidthAdjusted =
            cell.label === 'Tools and Equipment' ? 500 : 100; // Adjust width for the "Cust. ID Code" cell

          // Draw the cell border
          page.drawRectangle({
            x: cellX,
            y: y - cellHeightSmall,
            width: cellWidthAdjusted,
            height: cellHeightSmall,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
            color: rgb(0.8, 0.8, 0.8), // Gray color
          });

          // Draw the label
          page.drawText(cell.label, {
            x: cellX + 5,
            y: y - 10,
            font: robotoFont,
            size: fontSize,
          });

          page.drawText(cell.label1, {
            x: cellX + 5,
            y: y - 17,
            font: robotoFont,
            size: smallFontSize,
          });
          // Draw the value
          page.drawText(cell.value, {
            x: cellX + 55,
            y: y - 13,
            font: robotoFont,
            size: fontSize,
          });
          y -= 20;
        }
      }
      // y -= 5; // Space between header and part numbers table
      // const toolTable = [
      //   ['Code', 'Part number', 'Description', 'Qty'],
      //   ...(task.tools
      //     ? task.tools.map((part: any) => [
      //         String(part.CODE),
      //         String(part.PART_NUMBER),
      //         String(part.DESCRIPTION),
      //         String(part.QUANTITY),
      //       ])
      //     : []),
      // ];

      const toolTable = [
        ['Code', 'Part number', 'Description', 'Qty'],
        ...(task.parts && task.parts.length > 0
          ? task.parts
              .filter(
                (part: any) =>
                  part?.partNumberID?.GROUP &&
                  ['GSE', 'TOOL'].includes(part.partNumberID.GROUP)
              )
              .map((part: any) => [
                String(part?.partNumberID?.CODE || ''),
                String(part?.partNumberID?.PART_NUMBER || ''),
                String(part?.partNumberID?.DESCRIPTION || ''),
                String(part?.quantity || ''), // quantity should come from part, not partNumberID
              ])
          : [
              // ['', '', '', ''],
              // ['
            ]),
      ];
      const toolColumnWidths = [50, 150, 240, 60]; // Widths for PART_NUMBER, DESCRIPTION, QUANTITY columns
      const toolRowHeight = 15; // Height for each row in the part numbers table

      y -= 0; // Space between header and part numbers table

      if (task.projectItemType !== 'NRC') {
        for (const row of toolTable) {
          let x = 50;
          for (let i = 0; i < row.length; i++) {
            const cell = row[i];
            // if (cell !== undefined) {
            //   page.drawText(cell, {
            //     x: x + 5,
            //     y: y - 15,
            //     font: robotoFont,
            //     size: fontSize,
            //   });
            // }
            // // Draw border around the cell
            // page.drawRectangle({
            //   x,
            //   y: y - 20,
            //   width: toolColumnWidths[i],
            //   height: 20,
            //   borderColor: rgb(0, 0, 0),
            //   borderWidth: 1,
            // });
            // x += toolColumnWidths[i];
            if (cell !== undefined) {
              const cellWidth = toolColumnWidths[i];
              const truncatedCell = truncateText(
                cell,
                cellWidth - 10,
                robotoFont,
                fontSize
              );

              page.drawText(truncatedCell, {
                x: x + 5,
                y: y - 10,
                font: robotoFont,
                size: fontSize,
              });
            }
            // Рисуем границу вокруг ячейки
            page.drawRectangle({
              x,
              y: y - toolRowHeight,
              width: toolColumnWidths[i],
              height: partNumbersRowHeight,
              borderColor: rgb(0, 0, 0),
              borderWidth: 1,
            });
            x += toolColumnWidths[i];
          }
          y -= toolRowHeight;
        }
      }
      if (task.projectItemType !== 'NRC') {
        for (let i = 0; i < cellData9.length; i++) {
          const cell = cellData9[i];

          const cellX = 50 + (i > 0 ? 100 : 0) + (i > 1 ? 500 : 0); // Adjust x position for the cells after the first one
          const cellWidthAdjusted =
            cell.label ===
            'NOTE: EQUIVALENT OR ALTERNATIVE PART NUMBERS CAN BE USED IAW TECHNICAL DOCUMENTATION'
              ? 500
              : 100; // Adjust width for the "Cust. ID Code" cell

          // Draw the cell border
          page.drawRectangle({
            x: cellX,
            y: y - toolRowHeight,
            width: cellWidthAdjusted,
            height: toolRowHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });

          // Draw the label
          page.drawText(cell.label, {
            x: cellX + 6,
            y: y - 5,
            font: robotoFont,
            size: smallFontSize,
          });

          page.drawText(cell.label1, {
            x: cellX + 5,
            y: y - 13,
            font: robotoFont,
            size: smallFontSize,
          });
          // Draw the value
          page.drawText(cell.value, {
            x: cellX + 55,
            y: y - 13,
            font: robotoFont,
            size: fontSize,
          });
          y -= partNumbersRowHeight;
        }
        y -= 5; // Space between
      }
      ////Instructions
      const cellData10 = [
        {
          label: 'Accomplishment Instructions',
          label1: 'Инструкции по выполнению',
          value: '',
        },
      ];
      // for (let i = 0; i < cellData10.length; i++) {
      //   const cell = cellData10[i];

      //   const cellX = 50 + (i > 0 ? 100 : 0) + (i > 1 ? 500 : 0); // Adjust x position for the cells after the first one
      //   const cellWidthAdjusted =
      //     cell.label === 'Accomplishment Instructions' ? 500 : 100; // Adjust width for the "Cust. ID Code" cell

      //   // Draw the cell border
      //   page.drawRectangle({
      //     x: cellX,
      //     y: y - cellHeightSmall,
      //     width: cellWidthAdjusted,
      //     height: cellHeightSmall,
      //     borderColor: rgb(0, 0, 0),
      //     borderWidth: 1,
      //     color: rgb(0.8, 0.8, 0.8), // Gray color
      //   });

      //   // Draw the label
      //   page.drawText(cell.label, {
      //     x: cellX + 5,
      //     y: y - 10,
      //     font: robotoFont,
      //     size: fontSize,
      //   });

      //   page.drawText(cell.label1, {
      //     x: cellX + 5,
      //     y: y - 17,
      //     font: robotoFont,
      //     size: smallFontSize,
      //   });
      //   // Draw the value
      //   page.drawText(cell.value, {
      //     x: cellX + 55,
      //     y: y - 13,
      //     font: robotoFont,
      //     size: fontSize,
      //   });
      //   y -= partNumbersRowHeight;
      // }
      // y -= 5; // Space between
      // }

      // STEPS
      function splitTextIntoLines(
        text: string,
        font: PDFFont,
        size: number,
        maxWidth: number
      ) {
        const lines = text
          .split('\n')
          .map((line: string) => {
            const words = line.split(' ');
            let currentLine = '';
            let resultLines = [];

            words.forEach((word: string) => {
              const testLine = currentLine + word + ' ';
              const testWidth = font.widthOfTextAtSize(testLine, size);
              if (testWidth > maxWidth && currentLine.length > 0) {
                resultLines.push(currentLine.trim());
                currentLine = word + ' ';
              } else {
                currentLine = testLine;
              }
            });

            if (currentLine.length > 0) {
              resultLines.push(currentLine.trim());
            }

            return resultLines;
          })
          .flat();

        return lines;
      }

      // function getTextHeight(
      //   text: any,
      //   font: PDFFont,
      //   size: number,
      //   maxWidth: number
      // ) {
      //   const lines = splitTextIntoLines(text, font, size, maxWidth);
      //   const lineHeight = font.heightAtSize(size);
      //   return lines.length * lineHeight + 5;
      // }

      // for (let i = 0; i < task.steps?.length; i++) {
      //   const step = task.steps[i];
      //   const cellData12 = {
      //     label: 'Work Step Description',
      //     label1: 'Описание шага рабочей операции',
      //     label2: 'Raised',
      //     label3: 'Подготовлено',
      //     label4: 'Описание шага рабочей операции',
      //     value1:
      //       step?.stepNumber !== undefined ? String(step.stepNumber) : 'N/A',
      //     value2:
      //       step?.createDate !== undefined
      //         ? String(new Date(step?.createDate).toLocaleDateString('en-US'))
      //         : 'N/A',
      //     value3:
      //       step?.createUserID !== undefined
      //         ? step.createUserID?.singNumber
      //         : 'N/A',
      //     value4:
      //       step?.stepDescription !== undefined ? step.stepDescription : 'N/A',
      //   };

      //   const cellX = 50;
      //   const cellWidthAdjusted = 500;

      //   const descriptionHeight = getTextHeight(
      //     cellData12.value4,
      //     robotoFont,
      //     12,
      //     cellWidthAdjusted - 10 // Adjust for padding
      //   );

      //   const cellHeight = 20; // Base height for the top part

      //   if (y - descriptionHeight - cellHeight < 50) {
      //     // Check if there is enough space for the step
      //     // drawFooter(page);
      //     ({ page, width, height, y } = addPage());
      //   }

      //   page.drawRectangle({
      //     x: cellX,
      //     y: y - cellHeight,
      //     width: cellWidthAdjusted,
      //     height: cellHeight,
      //     borderColor: rgb(0, 0, 0),
      //     borderWidth: 1,
      //   });
      //   page.drawRectangle({
      //     x: cellX,
      //     y: y - cellHeight - descriptionHeight,
      //     width: cellWidthAdjusted,
      //     height: descriptionHeight,
      //     borderColor: rgb(0, 0, 0),
      //     borderWidth: 1,
      //   });

      //   // Draw the label
      //   page.drawText(cellData12.value1, {
      //     x: cellX + 5,
      //     y: y - 10,
      //     font: robotoFont,
      //     size: fontSize,
      //   });
      //   page.drawText(cellData12.value3, {
      //     x: cellX + 380,
      //     y: y - 15,
      //     font: robotoFont,
      //     size: fontSize,
      //   });

      //   const descriptionLines = splitTextIntoLines(
      //     cellData12.value4,
      //     robotoFont,
      //     12,
      //     cellWidthAdjusted - 10 // Adjust for padding
      //   );

      //   let textY = y - cellHeight - 15;
      //   descriptionLines.forEach((line: string) => {
      //     page.drawText(line, {
      //       x: cellX + 5,
      //       y: textY,
      //       font: robotoFont,
      //       size: fontSize,
      //     });
      //     textY -= robotoFont.heightAtSize(12);
      //   });

      //   page.drawText(cellData12.label, {
      //     x: cellX + 30,
      //     y: y - 10,
      //     font: robotoFont,
      //     size: fontSize,
      //   });

      //   page.drawText(cellData12.label1, {
      //     x: cellX + 30,
      //     y: y - 17,
      //     font: robotoFont,
      //     size: smallFontSize,
      //   });
      //   page.drawText(cellData12.label2, {
      //     x: cellX + 300,
      //     y: y - 10,
      //     font: robotoFont,
      //     size: smallFontSize,
      //   });
      //   page.drawText(cellData12.label3, {
      //     x: cellX + 300,
      //     y: y - 17,
      //     font: robotoFont,
      //     size: smallFontSize,
      //   });

      //   // Draw the value
      //   page.drawText(cellData12.value2, {
      //     x: cellX + 450,
      //     y: y - 13,
      //     font: robotoFont,
      //     size: smallFontSize,
      //   });

      //   y -= descriptionHeight + cellHeight;
      // }

      function getTextHeight(
        text: any,
        font: PDFFont,
        size: number,
        maxWidth: number
      ) {
        const lines = splitTextIntoLines(text, font, size, maxWidth);
        const lineHeight = font.heightAtSize(size);
        return lines.length * lineHeight + 5;
      }
      const drawComponentChangeTable = (page, y, actions) => {
        // / Function to get text height
        const getTextHeight = (text, font, fontSize, maxWidth) => {
          const lines = splitTextIntoLines(text, font, fontSize, maxWidth);
          return lines.length * font.heightAtSize(fontSize);
        };

        // Function to split text into lines
        const splitTextIntoLines = (text, font, fontSize, maxWidth) => {
          const lines = [];
          let currentLine = '';
          const words = text.split(' ');
          for (const word of words) {
            const testLine = currentLine + ' ' + word;
            const testWidth = font.widthOfTextAtSize(testLine, fontSize);
            if (testWidth < maxWidth) {
              currentLine = testLine;
            } else {
              lines.push(currentLine);
              currentLine = word;
            }
          }
          lines.push(currentLine);
          return lines;
        };

        // Function to truncate text to fit within a given width
        const truncateText = (text, font, fontSize, maxWidth) => {
          let truncatedText = text;
          while (
            font.widthOfTextAtSize(truncatedText + '...', fontSize) >
              maxWidth &&
            truncatedText.length > 0
          ) {
            truncatedText = truncatedText.slice(0, -1);
          }
          return (
            truncatedText + (truncatedText.length < text.length ? '...' : '')
          );
        };
        const cellData15 = [
          {
            label: 'Item Change List',
            label1: 'Перечень ЗаменённыхПозиций',
            value: '',
          },
        ];

        for (let i = 0; i < cellData15.length; i++) {
          const cell = cellData15[i];

          const cellX = 50 + (i > 0 ? 100 : 0) + (i > 1 ? 500 : 0); // Adjust x position for the cells after the first one
          const cellWidthAdjusted =
            cell.label === 'Item Change List' ? 500 : 100; // Adjust width for the "Cust. ID Code" cell

          // Draw the cell border
          if (y - cellHeightSmall - cellHeightSmall < 50) {
            // Check if there is enough space for the step
            // drawFooter(page);
            ({ page, width, height, y } = addPage());
          }
          page.drawRectangle({
            x: cellX,
            y: y - cellHeightSmall,
            width: cellWidthAdjusted,
            height: cellHeightSmall,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
            color: rgb(0.8, 0.8, 0.8), // Gray color
          });

          // Draw the label
          page.drawText(cell.label, {
            x: cellX + 5,
            y: y - 10,
            font: robotoFont,
            size: fontSize,
          });

          page.drawText(cell.label1, {
            x: cellX + 5,
            y: y - 17,
            font: robotoFont,
            size: smallFontSize,
          });
          // Draw the value
          page.drawText(cell.value, {
            x: cellX + 55,
            y: y - 13,
            font: robotoFont,
            size: fontSize,
          });
          y -= partNumbersRowHeight;
        }
        y -= 5; // Space between header and part numbers table

        const componentTable = [
          [
            'P/N Off',
            'S/N Off',
            'P/N On',
            'S/N On',
            'Description',
            'Certificate',
            'Position',
          ],
          ...(actions && actions.length > 0
            ? actions.map((action) => [
                String(
                  action.componentChange?.removeAction?.partNumberID
                    ?.PART_NUMBER || ''
                ),
                String(
                  action.componentChange?.removeAction?.serialNumberOf || ''
                ),
                String(
                  action.componentChange?.installAction?.partNumberID
                    ?.PART_NUMBER || ''
                ),
                String(
                  action.componentChange?.installAction?.serialOnNumber || ''
                ),
                String(
                  action.componentChange?.removeAction?.partNumberID
                    ?.DESCRIPTION || ''
                ),
                String(
                  action.componentChange?.installAction?.certificateNumber || ''
                ),
                String(action.componentChange?.removeAction?.position || ''),
              ])
            : [
                ['', '', '', '', '', '', ''],
                ['', '', '', '', '', '', ''],
              ]),
        ];

        const componentColumnWidths = [80, 70, 70, 70, 70, 70, 70]; // Widths for PART_NUMBER, DESCRIPTION, QUANTITY columns
        const componentRowHeight = 15; // Height for each row in the part numbers table

        y -= 0; // Space between header and part numbers table
        for (const row of componentTable) {
          let x = 50;
          for (let i = 0; i < row.length; i++) {
            const cell = row[i];
            const truncatedCell = truncateText(
              cell,
              robotoFont,
              7,
              componentColumnWidths[i] - 10
            ); // Adjust for padding
            if (truncatedCell !== undefined) {
              page.drawText(truncatedCell, {
                x: x + 5,
                y: y - 10,
                font: robotoFont,
                size: 7,
              });
            }
            // Draw border around the cell
            page.drawRectangle({
              x,
              y: y - componentRowHeight,
              width: componentColumnWidths[i],
              height: componentRowHeight,
              borderColor: rgb(0, 0, 0),
              borderWidth: 1,
            });
            x += componentColumnWidths[i];
          }
          y -= componentRowHeight;
        }
        y -= 5; // Space between header and part numbers table

        return y;
      };

      if (
        task.projectItemType !== 'NRC' &&
        task.projectItemType !== 'NRC_ADD' &&
        task.projectItemType !== 'HARD_ACCESS'
      ) {
        for (let i = 0; i < task.steps?.length; i++) {
          const step = task.steps[i];
          const cellData12 = {
            label: 'Work Step Description',
            label1: 'Описание шага рабочей операции',
            label2: 'Raised',
            label3: 'Подготовлено',
            label4: 'Описание шага рабочей операции',
            value1:
              step?.stepNumber !== undefined ? String(step.stepNumber) : 'N/A',
            value2:
              step?.createDate !== undefined
                ? String(new Date(step?.createDate).toLocaleDateString('ru-RU'))
                : 'N/A',
            value3: `${step?.createUserID?.firstNameEnglish} ${
              step?.createUserID?.lastNameEnglish
            } ${new Date(step?.createDate).toLocaleDateString('ru-RU')}`,
            value4:
              step?.stepDescription !== undefined
                ? step.stepDescription
                : 'N/A',
          };

          const cellX = 50;
          const cellWidthAdjusted = 500;

          const descriptionHeight = getTextHeight(
            cellData12.value4,
            robotoFont,
            12,
            cellWidthAdjusted - 10 // Adjust for padding
          );

          const cellHeight = 20; // Base height for the top part

          if (y - descriptionHeight - cellHeight < 50) {
            // Check if there is enough space for the step
            // drawFooter(page);
            ({ page, width, height, y } = addPage());
          }

          page.drawRectangle({
            x: cellX,
            y: y - cellHeight,
            width: cellWidthAdjusted,
            height: cellHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
            color: rgb(0.8, 0.8, 0.8), // Gray color
          });
          // Draw the main rectangle for the step
          const totalHeight = cellHeight + descriptionHeight + 30; // 30 is the height of the rectangles
          page.drawRectangle({
            x: cellX,
            y: y - totalHeight,
            width: cellWidthAdjusted,
            height: totalHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });

          // Draw the label
          page.drawText(cellData12.value1, {
            x: cellX + 5,
            y: y - 10,
            font: robotoFont,
            size: fontSize,
          });
          page.drawText(cellData12.value3, {
            x: cellX + 390,
            y: y - 15,
            font: robotoFont,
            size: 6,
          });

          const descriptionLines = splitTextIntoLines(
            cellData12.value4,
            robotoFont,
            12,
            cellWidthAdjusted - 10 // Adjust for padding
          );

          let textY = y - cellHeight - 15;
          descriptionLines.forEach((line: string) => {
            page.drawText(line, {
              x: cellX + 5,
              y: textY,
              font: robotoFont,
              size: fontSize,
            });
            textY -= robotoFont.heightAtSize(12);
          });

          page.drawText(cellData12.label, {
            x: cellX + 30,
            y: y - 10,
            font: robotoFont,
            size: fontSize,
          });

          page.drawText(cellData12.label1, {
            x: cellX + 30,
            y: y - 17,
            font: robotoFont,
            size: smallFontSize,
          });
          // page.drawText(cellData12.label2, {
          //   x: cellX + 300,
          //   y: y - 10,
          //   font: robotoFont,
          //   size: smallFontSize,
          // });
          // page.drawText(cellData12.label3, {
          //   x: cellX + 300,
          //   y: y - 17,
          //   font: robotoFont,
          //   size: smallFontSize,
          // });

          // Draw the value
          // page.drawText(cellData12.value2, {
          //   x: cellX + 450,
          //   y: y - 13,
          //   font: robotoFont,
          //   size: fontSize,
          // });

          // Draw two rectangles side by side at the right edge
          const rectangleWidth = 100;
          const rectangleHeight = 30;
          const rectangleX1 = cellX + cellWidthAdjusted - 2 * rectangleWidth;
          const rectangleX2 = cellX + cellWidthAdjusted - rectangleWidth;
          const rectangleY =
            y - cellHeight - descriptionHeight - rectangleHeight;

          page.drawRectangle({
            x: rectangleX1,
            y: rectangleY,
            width: rectangleWidth,
            height: rectangleHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });

          page.drawRectangle({
            x: rectangleX2,
            y: rectangleY,
            width: rectangleWidth,
            height: rectangleHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });

          // Draw text in the rectangles
          page.drawText('Perform', {
            x: rectangleX1 + 5,
            y: rectangleY + 10,
            font: robotoFont,
            size: 6,
          });
          page.drawText('Выполнил', {
            x: rectangleX1 + 5,
            y: rectangleY + 4,
            font: robotoFont,
            size: 6,
          });
          page.drawText('Inspected', {
            x: rectangleX2 + 5,
            y: rectangleY + 10,
            font: robotoFont,
            size: 6,
          });
          page.drawText('Проверил', {
            x: rectangleX2 + 5,
            y: rectangleY + 4,
            font: robotoFont,
            size: 6,
          });

          y -= totalHeight;
          const actionsChance = step.actions.filter(
            (action) => action.isComponentChangeAction
          );
          if (actionsChance.length > 0) {
            y = drawComponentChangeTable(page, y, actionsChance);
          }
          y -= 5;
        }
      }
      if (
        task.projectItemType == 'NRC' ||
        task.projectItemType == 'NRC_ADD' ||
        task.projectItemType == 'HARD_ACCESS'
      ) {
        for (let i = 0; i < task.steps?.length; i++) {
          const step = task.steps[i];
          const cellData12 = {
            label: 'Work Step Description',
            label1: 'Описание шага рабочей операции',
            label2: 'Raised',
            label3: 'Подготовлено',
            label4: 'Описание шага рабочей операции',
            value1:
              step?.stepNumber !== undefined ? String(step.stepNumber) : 'N/A',
            value2:
              step?.createDate !== undefined
                ? String(new Date(step?.createDate).toLocaleDateString('ru-RU'))
                : 'N/A',
            value3: `${step?.createUserID?.firstNameEnglish} ${
              step?.createUserID?.lastNameEnglish
            } ${new Date(step?.createDate).toLocaleDateString('ru-RU')}`,
            value4:
              step?.stepDescription !== undefined
                ? step.stepDescription
                : 'N/A',
          };

          const cellX = 50;
          const cellWidthAdjusted = 500;

          const descriptionHeight = getTextHeight(
            cellData12.value4,
            robotoFont,
            12,
            cellWidthAdjusted - 10 // Adjust for padding
          );

          const cellHeight = 20; // Base height for the top part

          if (y - descriptionHeight - cellHeight < 50) {
            // Check if there is enough space for the step
            // drawFooter(page);
            ({ page, width, height, y } = addPage());
          }

          page.drawRectangle({
            x: cellX,
            y: y - cellHeight,
            width: cellWidthAdjusted,
            height: cellHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
            color: rgb(0.8, 0.8, 0.8), // Gray color
          });
          // Draw the main rectangle for the step
          const totalHeight = cellHeight + descriptionHeight; // 30 is the height of the rectangles
          page.drawRectangle({
            x: cellX,
            y: y - totalHeight,
            width: cellWidthAdjusted,
            height: totalHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });

          // Draw the label
          page.drawText(cellData12.value1, {
            x: cellX + 5,
            y: y - 10,
            font: robotoFont,
            size: fontSize,
          });
          page.drawText(cellData12.value3, {
            x: cellX + 390,
            y: y - 15,
            font: robotoFont,
            size: 6,
          });

          const descriptionLines = splitTextIntoLines(
            cellData12.value4,
            robotoFont,
            12,
            cellWidthAdjusted - 10 // Adjust for padding
          );

          let textY = y - cellHeight - 15;
          descriptionLines.forEach((line: string) => {
            page.drawText(line, {
              x: cellX + 5,
              y: textY,
              font: robotoFont,
              size: fontSize,
            });
            textY -= robotoFont.heightAtSize(12);
          });

          page.drawText(cellData12.label, {
            x: cellX + 30,
            y: y - 10,
            font: robotoFont,
            size: fontSize,
          });

          page.drawText(cellData12.label1, {
            x: cellX + 30,
            y: y - 17,
            font: robotoFont,
            size: smallFontSize,
          });
          // page.drawText(cellData12.label2, {
          //   x: cellX + 300,
          //   y: y - 10,
          //   font: robotoFont,
          //   size: smallFontSize,
          // });
          // page.drawText(cellData12.label3, {
          //   x: cellX + 300,
          //   y: y - 17,
          //   font: robotoFont,
          //   size: smallFontSize,
          // });

          // Draw the value
          // page.drawText(cellData12.value2, {
          //   x: cellX + 450,
          //   y: y - 13,
          //   font: robotoFont,
          //   size: fontSize,
          // });

          // Draw two rectangles side by side at the right edge
          const rectangleWidth = 100;
          const rectangleHeight = 30;
          const rectangleX1 = cellX + cellWidthAdjusted - 2 * rectangleWidth;
          const rectangleX2 = cellX + cellWidthAdjusted - rectangleWidth;
          const rectangleY =
            y - cellHeight - descriptionHeight - rectangleHeight;

          // page.drawRectangle({
          //   x: rectangleX1,
          //   y: rectangleY,
          //   width: rectangleWidth,
          //   height: rectangleHeight,
          //   borderColor: rgb(0, 0, 0),
          //   borderWidth: 1,
          // });

          // page.drawRectangle({
          //   x: rectangleX2,
          //   y: rectangleY,
          //   width: rectangleWidth,
          //   height: rectangleHeight,
          //   borderColor: rgb(0, 0, 0),
          //   borderWidth: 1,
          // });

          // Draw text in the rectangles
          // page.drawText('Perform', {
          //   x: rectangleX1 + 5,
          //   y: rectangleY + 10,
          //   font: robotoFont,
          //   size: 6,
          // });
          // page.drawText('Выполнил', {
          //   x: rectangleX1 + 5,
          //   y: rectangleY + 4,
          //   font: robotoFont,
          //   size: 6,
          // });
          // page.drawText('Inspected', {
          //   x: rectangleX2 + 5,
          //   y: rectangleY + 10,
          //   font: robotoFont,
          //   size: 6,
          // });
          // page.drawText('Проверил', {
          //   x: rectangleX2 + 5,
          //   y: rectangleY + 4,
          //   font: robotoFont,
          //   size: 6,
          // });

          y -= totalHeight;

          // Add actions to the step
          const actions = step.actions.filter(
            (action) =>
              !action.isComponentChangeAction && action.type !== 'closed'
          );

          // console.log(step);
          if (actions.length > 0) {
            const actionsHeight = actions.reduce((totalHeight, action) => {
              const actionDescriptionHeight = getTextHeight(
                action.description,
                robotoFont,
                12,
                cellWidthAdjusted - 10 // Adjust for padding
              );
              return totalHeight + actionDescriptionHeight + 50; // 50 is the height of the header and rectangles
            }, 0);

            if (y - actionsHeight < 50) {
              // Check if there is enough space for the actions
              ({ page, width, height, y } = addPage());
            }

            actions.forEach((action, index) => {
              const actionDescriptionHeight = getTextHeight(
                action.description,
                robotoFont,
                12,
                cellWidthAdjusted - 10 // Adjust for padding
              );
              const actionY = y - actionDescriptionHeight - 50; // 50 is the height of the header and rectangles

              // Draw the header for the action
              page.drawRectangle({
                x: cellX,
                y: actionY + actionDescriptionHeight + 35,
                width: cellWidthAdjusted,
                height: 15,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
                color: rgb(0.8, 0.8, 0.8), // Gray color
              });

              if (action.type === 'pfmd') {
                page.drawText(`Action-step ${step.stepNumber}-${index + 1}`, {
                  x: cellX + 5,
                  y: actionY + actionDescriptionHeight + 40,
                  font: robotoFont,
                  size: fontSize,
                });

                page.drawText(
                  `${action?.createUserID?.firstNameEnglish} ${
                    action?.createUserID?.lastNameEnglish
                  } ${new Date(action?.createDate).toLocaleDateString(
                    'ru-RU'
                  )}`,
                  {
                    x: cellX + 390,
                    y: actionY + actionDescriptionHeight + 40,
                    font: robotoFont,
                    size: 6,
                  }
                );
              }
              if (action.type === 'inspect') {
                page.drawText(
                  `Inspection-step ${step.stepNumber}-${index + 1}`,
                  {
                    x: cellX + 5,
                    y: actionY + actionDescriptionHeight + 40,
                    font: robotoFont,
                    size: fontSize,
                  }
                );
                page.drawText(
                  `${action?.createUserID?.firstNameEnglish} ${
                    action?.createUserID?.lastNameEnglish
                  } ${new Date(action?.createDate).toLocaleDateString(
                    'ru-RU'
                  )}`,
                  {
                    x: cellX + 390,
                    y: actionY + actionDescriptionHeight + 40,
                    font: robotoFont,
                    size: 6,
                  }
                );
              }

              if (action.type === 'diClosed') {
                page.drawText(
                  `Inspection-step ${step.stepNumber}-${index + 1}`,
                  {
                    x: cellX + 5,
                    y: actionY + actionDescriptionHeight + 40,
                    font: robotoFont,
                    size: fontSize,
                  }
                );
                page.drawText(
                  `${action?.createUserID?.firstNameEnglish} ${
                    action?.createUserID?.lastNameEnglish
                  } ${new Date(action?.createDate).toLocaleDateString(
                    'ru-RU'
                  )}`,
                  {
                    x: cellX + 390,
                    y: actionY + actionDescriptionHeight + 40,
                    font: robotoFont,
                    size: 6,
                  }
                );
              }

              // Draw the description of the action
              page.drawRectangle({
                x: cellX,
                y: actionY,
                width: cellWidthAdjusted,
                height: actionDescriptionHeight + 50,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
              });

              const descriptionLines = splitTextIntoLines(
                action.description,
                robotoFont,
                12,
                cellWidthAdjusted - 10 // Adjust for padding
              );

              let textY = actionY + actionDescriptionHeight + 15;
              descriptionLines.forEach((line: string) => {
                page.drawText(line, {
                  x: cellX + 5,
                  y: textY,
                  font: robotoFont,
                  size: fontSize,
                });
                textY -= robotoFont.heightAtSize(12);
              });

              // Draw rectangles based on action type
              const rectangleWidth = 100;
              const rectangleHeight = 30;
              const rectangleX1 =
                cellX + cellWidthAdjusted - 2 * rectangleWidth;
              const rectangleX2 = cellX + cellWidthAdjusted - rectangleWidth;
              const rectangleY = actionY + 10;

              if (action.type === 'pfmd') {
                page.drawRectangle({
                  x: rectangleX2,
                  y: actionY,
                  width: rectangleWidth,
                  height: rectangleHeight,
                  borderColor: rgb(0, 0, 0),
                  borderWidth: 1,
                });

                page.drawText('Performed', {
                  x: rectangleX2 + 5,
                  y: actionY + 8,
                  font: robotoFont,
                  size: 6,
                });
                page.drawText('Выполнил', {
                  x: rectangleX2 + 5,
                  y: actionY + 2,
                  font: robotoFont,
                  size: 6,
                });
                page.drawText(
                  `${
                    action?.userDurations[0]?.userID
                      ?.organizationAuthorization ||
                    action?.userDurations[0]?.userID?.singNumber
                  } (${action?.userDurations[0]?.userID?.firstNameEnglish} ${
                    action?.userDurations[0]?.userID?.lastNameEnglish
                  }) `,
                  {
                    x: rectangleX2 + 5,
                    y: actionY + 23,
                    font: robotoFont,
                    size: 5,
                  }
                );
              } else if (action.type === 'inspect') {
                page.drawRectangle({
                  x: rectangleX2 + 20,
                  y: actionY,
                  width: rectangleWidth - 20,
                  height: rectangleHeight,
                  borderColor: rgb(0, 0, 0),
                  borderWidth: 1,
                });

                page.drawText('Performed', {
                  x: rectangleX2 + 5 + 20,
                  y: actionY + 8,
                  font: robotoFont,
                  size: 6,
                });
                page.drawText('Выполнил', {
                  x: rectangleX2 + 5 + 20,
                  y: actionY + 2,
                  font: robotoFont,
                  size: 6,
                });
                page.drawText(
                  `${
                    action?.userDurations[0]?.userID
                      ?.organizationAuthorization ||
                    action?.userDurations[0]?.userID?.singNumber
                  } (${action?.userDurations[0]?.userID?.firstNameEnglish} ${
                    action?.userDurations[0]?.userID?.lastNameEnglish
                  }) `,
                  {
                    x: rectangleX2 + 5 + 20,
                    y: actionY + 23,
                    font: robotoFont,
                    size: 5,
                  }
                );
              } else if (action.type === 'diClosed') {
                page.drawRectangle({
                  x: rectangleX2 + 20,
                  y: actionY,
                  width: rectangleWidth - 20,
                  height: rectangleHeight,
                  borderColor: rgb(0, 0, 0),
                  borderWidth: 1,
                });

                page.drawText('Performed', {
                  x: rectangleX2 + 5 + 20,
                  y: actionY + 8,
                  font: robotoFont,
                  size: 6,
                });
                page.drawText('Выполнил', {
                  x: rectangleX2 + 5 + 20,
                  y: actionY + 2,
                  font: robotoFont,
                  size: 6,
                });
                page.drawText(
                  `${
                    action?.userDurations[0]?.userID
                      ?.organizationAuthorization ||
                    action?.userDurations[0]?.userID?.singNumber
                  } (${action?.userDurations[0]?.userID?.firstNameEnglish} ${
                    action?.userDurations[0]?.userID?.lastNameEnglish
                  }) `,
                  {
                    x: rectangleX2 + 5 + 20,
                    y: actionY + 23,
                    font: robotoFont,
                    size: 5,
                  }
                );
              }

              y -= actionDescriptionHeight + 50; // 50 is the height of the header and rectangles
            });
          }

          const actionsChance = step.actions.filter(
            (action) => action.isComponentChangeAction
          );
          if (actionsChance.length > 0) {
            y = drawComponentChangeTable(page, y, actionsChance);
          }
          y -= 5;
        }
      }

      ///ITEMS
      // const cellData15 = [
      //   {
      //     label: 'Item Change List',
      //     label1: 'Перечень ЗаменённыхПозиций',
      //     value: '',
      //   },
      // ];

      // for (let i = 0; i < cellData15.length; i++) {
      //   const cell = cellData15[i];

      //   const cellX = 50 + (i > 0 ? 100 : 0) + (i > 1 ? 500 : 0); // Adjust x position for the cells after the first one
      //   const cellWidthAdjusted = cell.label === 'Item Change List' ? 500 : 100; // Adjust width for the "Cust. ID Code" cell

      //   // Draw the cell border
      //   if (y - cellHeightSmall - cellHeightSmall < 50) {
      //     // Check if there is enough space for the step
      //     // drawFooter(page);
      //     ({ page, width, height, y } = addPage());
      //   }
      //   page.drawRectangle({
      //     x: cellX,
      //     y: y - cellHeightSmall,
      //     width: cellWidthAdjusted,
      //     height: cellHeightSmall,
      //     borderColor: rgb(0, 0, 0),
      //     borderWidth: 1,
      //   });

      //   // Draw the label
      //   page.drawText(cell.label, {
      //     x: cellX + 5,
      //     y: y - 10,
      //     font: robotoFont,
      //     size: fontSize,
      //   });

      //   page.drawText(cell.label1, {
      //     x: cellX + 5,
      //     y: y - 17,
      //     font: robotoFont,
      //     size: smallFontSize,
      //   });
      //   // Draw the value
      //   page.drawText(cell.value, {
      //     x: cellX + 55,
      //     y: y - 13,
      //     font: robotoFont,
      //     size: fontSize,
      //   });
      //   y -= partNumbersRowHeight;
      // }
      // y -= 5; // Space between header and part numbers table
      // const componentTable = [
      //   [
      //     'P/N Off',
      //     'S/N Off',
      //     'P/N On',
      //     'S/N On',
      //     'Qty',
      //     'Certificate',
      //     'Performed',
      //   ],
      //   ...(actions && actions.length > 0
      //     ? actions.map((action) => [
      //         String(
      //           action.componentChange?.removeAction?.partNumberID
      //             ?.partNumber || ''
      //         ),
      //         String(action.componentChange?.removeAction?.serialNumber || ''),
      //         String(
      //           action.componentChange?.installAction?.partNumberID
      //             ?.partNumber || ''
      //         ),
      //         String(action.componentChange?.installAction?.serialNumber || ''),
      //         String(action.componentChange?.quantity || ''),
      //         String(action.componentChange?.certificateNumber || ''),
      //         String(action.componentChange?.performed || ''),
      //       ])
      //     : [
      //         ['', '', '', '', '', '', ''],
      //         ['', '', '', '', '', '', ''],
      //       ]),
      // ];
      // const componentColumnWidths = [80, 80, 80, 80, 40, 70, 70]; // Widths for PART_NUMBER, DESCRIPTION, QUANTITY columns
      // const componentRowHeight = 15; // Height for each row in the part numbers table

      // y -= 0; // Space between header and part numbers table
      // for (const row of componentTable) {
      //   let x = 50;
      //   for (let i = 0; i < row.length; i++) {
      //     const cell = row[i];
      //     if (cell !== undefined) {
      //       page.drawText(cell, {
      //         x: x + 5,
      //         y: y - 10,
      //         font: robotoFont,
      //         size: fontSize,
      //       });
      //     }
      //     // Draw border around the cell
      //     page.drawRectangle({
      //       x,
      //       y: y - componentRowHeight,
      //       width: componentColumnWidths[i],
      //       height: componentRowHeight,
      //       borderColor: rgb(0, 0, 0),
      //       borderWidth: 1,
      //     });
      //     x += componentColumnWidths[i];
      //   }
      //   y -= componentRowHeight;
      // }

      // Main code to process tasks
      // for (const task of tasks) {
      // if (task.steps && task.steps.length > 0) {
      //   for (const step of task.steps) {
      //     const actions = step.actions.filter(
      //       (action) => action.isComponentChangeAction
      //     );
      //     if (actions.length > 0) {
      //       y = drawComponentChangeTable(page, y, actions);
      //     }
      //   }
      // }
      // }
      // y -= 5; //
      ///ITEMS
      const cellData25 = [
        {
          label: 'Findings',
          label1: 'Выявленные отклонения',
          value: '',
        },
      ];
      const cellDataRemark = [
        {
          label: 'Remarks',
          label1: 'Заметки',
          value: '',
        },
      ];

      if (task.projectItemType !== 'NRC') {
        for (let i = 0; i < cellData25.length; i++) {
          const cell = cellData25[i];

          const cellX = 50 + (i > 0 ? 100 : 0) + (i > 1 ? 500 : 0); // Adjust x position for the cells after the first one
          const cellWidthAdjusted = cell.label === 'Findings' ? 500 : 100; // Adjust width for the "Cust. ID Code" cell

          // Draw the cell border
          page.drawRectangle({
            x: cellX,
            y: y - cellHeightSmall,
            width: cellWidthAdjusted,
            height: cellHeightSmall,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
            color: rgb(0.8, 0.8, 0.8), // Gray color
          });

          // Draw the label
          page.drawText(cell.label, {
            x: cellX + 5,
            y: y - 10,
            font: robotoFont,
            size: fontSize,
          });

          page.drawText(cell.label1, {
            x: cellX + 5,
            y: y - 17,
            font: robotoFont,
            size: smallFontSize,
          });
          // Draw the value
          page.drawText(cell.value, {
            x: cellX + 55,
            y: y - 13,
            font: robotoFont,
            size: fontSize,
          });
          y -= partNumbersRowHeight;
          if (y - cellHeight < 50) {
            // Check if there is enough space for the step
            // drawFooter(page);
            ({ page, width, height, y } = addPage());
          }
        }
        y -= 5;
        const findingsTable = [
          ['Defect found', 'Reference', 'Reference', 'Reference'],
          ...(task.defects && task.defects.length > 0
            ? task.defects.map((part: any) => [
                String(`YES____            NO__________`),
                String(part.NRC_REFERENCE || ''),
                String(part.NRC_REFERENCE || ''),
                String(part.NRC_REFERENCE || ''),
              ])
            : [[String(`   YES       /       NO`), '', '', '']]),
        ];
        const findingsColumnWidths = [100, 140, 120, 140]; // Widths for PART_NUMBER, DESCRIPTION, QUANTITY columns
        const findingsRowHeight = 15; // Height for each row in the part numbers table

        y -= 0; // Space between header and part numbers table
        for (const row of findingsTable) {
          let x = 50;
          for (let i = 0; i < row.length; i++) {
            const cell = row[i];
            if (cell !== undefined) {
              page.drawText(cell, {
                x: x + 5,
                y: y - 10,
                font: robotoFont,
                size: fontSize,
              });
            }
            // Draw border around the cell
            if (y - cellHeight < 50) {
              // Check if there is enough space for the step
              // drawFooter(page);
              ({ page, width, height, y } = addPage());
            }
            page.drawRectangle({
              x,
              y: y - findingsRowHeight,
              width: findingsColumnWidths[i],
              height: findingsRowHeight,
              borderColor: rgb(0, 0, 0),
              borderWidth: 1,
            });
            x += findingsColumnWidths[i];
          }
          y -= toolRowHeight;
        }
      }

      ///release

      if (task.projectItemType !== 'NRC') {
        y -= 5; //
        for (let i = 0; i < cellDataRemark.length; i++) {
          const cell = cellDataRemark[i];

          const cellX = 50 + (i > 0 ? 100 : 0) + (i > 1 ? 500 : 0); // Adjust x position for the cells after the first one
          const cellWidthAdjusted = cell.label === 'Remarks' ? 500 : 100; // Adjust width for the "Cust. ID Code" cell

          // Draw the cell border
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
            y: y - 10,
            font: robotoFont,
            size: fontSize,
          });

          page.drawText(cell.label1, {
            x: cellX + 5,
            y: y - 17,
            font: robotoFont,
            size: smallFontSize,
          });
          // Draw the value
          page.drawText(cell.value, {
            x: cellX + 55,
            y: y - 13,
            font: robotoFont,
            size: fontSize,
          });
          y -= partNumbersRowHeight;
          if (y - cellHeight < 50) {
            // Check if there is enough space for the step
            // drawFooter(page);
            ({ page, width, height, y } = addPage());
          }
        }
        y -= 40;
      }
      const cellData16 = [
        {
          label: 'Release to Service',
          label1: 'Допуск к эксплуатации',
          value: '',
        },
      ];
      for (let i = 0; i < cellData16.length; i++) {
        const cell = cellData16[i];

        const cellX = 50 + (i > 0 ? 100 : 0) + (i > 1 ? 500 : 0); // Adjust x position for the cells after the first one
        const cellWidthAdjusted =
          cell.label === 'Release to Service' ? 500 : 100; // Adjust width for the "Cust. ID Code" cell

        // Draw the cell border
        if (y - cellHeight - cellHeight < 60) {
          // Check if there is enough space for the step
          // drawFooter(page);
          ({ page, width, height, y } = addPage());
        }

        page.drawRectangle({
          x: cellX,
          y: y - 20,
          width: cellWidthAdjusted,
          height: 20,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
          color: rgb(0.8, 0.8, 0.8), // Gray color
        });

        // Draw the label
        page.drawText(cell.label, {
          x: cellX + 5,
          y: y - 10,
          font: robotoFont,
          size: fontSize,
        });

        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 17,
          font: robotoFont,
          size: smallFontSize,
        });
        // Draw the value
        page.drawText(cell.value, {
          x: cellX + 55,
          y: y - 10,
          font: robotoFont,
          size: fontSize,
        });
        // y -= partNumbersRowHeight;
      }
      const cellData1234 = {
        value1:
          wo?.projectID?.WOReferenceID?.certificateId !== undefined
            ? String(wo?.projectID?.WOReferenceID?.certificateId?.description)
            : 'N/A',
      };

      const cellX = 50;
      const cellWidthAdjusted = 500;
      const certificateHeight = getTextHeight(
        cellData1234.value1,
        robotoFont,
        fontSizeM,
        cellWidthAdjusted - 10 // Adjust for padding
      );

      // const cellHeight = 20; // Base height for the top part

      if (y - certificateHeight - cellHeight < 50) {
        // Check if there is enough space for the step
        // drawFooter(page);
        ({ page, width, height, y } = addPage());
      }

      const descriptionHeight = getTextHeight(
        cellData1234.value1,
        robotoFont,
        fontSizeM,
        cellWidthAdjusted - 10 // Adjust for padding
      );

      const descriptionLines = splitTextIntoLines(
        cellData1234.value1,
        robotoFont,
        fontSizeM,
        cellWidthAdjusted - 10 // Adjust for padding
      );

      let textY = y - 20 - 10;
      descriptionLines.forEach((line: string) => {
        page.drawText(line, {
          x: cellX + 5,
          y: textY,
          font: robotoFont,
          size: fontSizeM,
        });
        textY -= robotoFont.heightAtSize(fontSizeM);
      });

      // page.drawRectangle({
      //   x: cellX,
      //   y: y - cellHeight,
      //   width: cellWidthAdjusted,
      //   height: cellHeight,
      //   borderColor: rgb(0, 0, 0),
      //   borderWidth: 1,
      // });
      page.drawRectangle({
        x: cellX,
        y: y - 20 - descriptionHeight,
        width: cellWidthAdjusted,
        height: descriptionHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      y -= descriptionHeight + 20;

      // y -= 30; // Space between header and part numbers table
      // const cellData18 = [
      //   {
      //     label: '',
      //     label1: '',
      //     label2: '',
      //     value: '',
      //   },
      //   {
      //     label: 'Date',
      //     label1: 'Дата',
      //     value: task.closeDate !== undefined ? task.closeDate : 'N/A',
      //   },
      //   {
      //     label: 'Inspected',
      //     label1: 'Проверено',
      //     label2: 'Staff Identification',
      //     value: task.WPNumber !== undefined ? task.WPNumber : 'N/A',
      //   },
      //   {
      //     label: 'Double Inspected',
      //     label1: 'Независимо проверено',
      //     label2: 'Staff Identification',
      //     value: task.diCloseBy !== undefined ? task.diCloseBy : 'N/A',
      //   },
      // ];

      const closeAction = task.steps
        .flatMap((step) => step.actions)
        .find((action) => action.type === 'closed');
      const diCloseAction = task.steps
        .flatMap((step) => step.actions)
        .find((action) => action.type === 'diClosed');

      const closeUser = closeAction?.userDurations[0]?.userID
        ? `${
            closeAction.userDurations[0].userID.organizationAuthorization ??
            closeAction.userDurations[0].userID.singNumber ??
            ''
          } (${closeAction.userDurations[0].userID.firstNameEnglish ?? ''} ${
            closeAction.userDurations[0].userID.lastNameEnglish ?? ''
          })`
        : '';

      const closedDate = closeAction?.createDate
        ? new Date(closeAction.createDate).toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',

            timeZone: 'UTC',
          })
        : '';

      console.log(closeAction);
      const diCloseUser = diCloseAction?.userDurations[0].userID
        ? `${
            diCloseAction?.userDurations[0].userID?.organizationAuthorization ??
            diCloseAction?.userDurations[0].userID?.singNumber ??
            ''
          } (${
            diCloseAction?.userDurations[0].userID?.firstNameEnglish ?? ''
          } ${diCloseAction?.userDurations[0].userID?.lastNameEnglish ?? ''}) `
        : '';
      const cellDataNotCritical = [
        {
          label: 'Form',
          label1: 'Форма',
          value: '060',
          value2: '01',
          label2: 'Revision №',
          label3: 'Изменение №',
          label4: 'Rev. Date',
          label41: 'Дата Изм.',
          label5: 'Approval №',
          label6: 'Одобрение №',
          value5:
            wo?.projectID?.WOReferenceID?.certificateId !== undefined
              ? String(wo?.projectID?.WOReferenceID?.certificateId?.code)
              : 'N/A',
          label7: 'Unitary Enterprise «407 Technics»',
          label8: 'Унитарное предприятие «407 Техникс»',
          value8: '23/11/2022',
          value9: '',
          value10: '',
        },

        {
          label: 'Date',
          label1: 'Дата',
          value: '',
          value2: '',
          label2: '',
          label3: '',
          label4: '',
          label41: '',
          label5: '',
          label6: '',
          value5: '',
          label7: '',
          label8: '',
          value8: '',
          value9: '',
          value10: closedDate || '',
        },
        {
          label: 'Closing Sign/Stamp',
          label1: 'Закрыто Подпись/Штамп',
          value: '',
          value2: '',
          label2: '',
          label3: '',
          label4: '',
          label41: '',
          label5: '',
          label6: '',
          value5: '',
          label7: '',
          label8: '',
          value8: '',
          value9: closeUser || '',
          value10: '',
        },
      ];

      const cellData18 = [
        {
          label: 'Form',
          label1: 'Форма',
          value: '060',
          value2: '01',
          label2: 'Revision №',
          label3: 'Изменение №',
          label4: 'Rev. Date',
          label41: 'Дата Изм.',
          label5: 'Approval №',
          label6: 'Одобрение №',
          value5:
            wo?.projectID?.WOReferenceID?.certificateId !== undefined
              ? String(wo?.projectID?.WOReferenceID?.certificateId?.code)
              : 'N/A',
          label7: 'Unitary Enterprise «407 Technics»',
          label8: 'Унитарное предприятие «407 Техникс»',
          value8: '23.11.2022',
          value9: '',
          value10: '',
        },
        {
          label: 'Date',
          label1: 'Дата',
          value: '',
          value2: '',
          label2: '',
          label3: '',
          label4: '',
          label41: '',
          label5: '',
          label6: '',
          value5: '',
          label7: '',
          label8: '',
          value8: '',
          value9: '',
          value10: closedDate || '',
        },
        {
          label: 'Closing Sign/Stamp',
          label1: 'Закрыто Подпись/Штамп',
          value: '',
          value2: '',
          label2: '',
          label3: '',
          label4: '',
          label41: '',
          label5: '',
          label6: '',
          value5: '',
          label7: '',
          label8: '',
          value8: '',
          value9: closeUser || '',
          value10: '',
        },
        {
          label: 'Double Inspected',
          label1: 'Независимо проверено',
          value: '',
          value2: '',
          label2: '',
          label3: '',
          label4: '',
          label41: '',
          label5: '',
          label6: '',
          value5: '',
          label7: '',
          label8: '',
          value8: '',
          value9: diCloseUser || '',
          value10: '',
        },
      ];

      const cellWidthsNotCritical = [300, 100, 100]; // Ширина первой ячейки и остальных ячеек для не isCriticalTask
      const cellWidthsCritical = [200, 100, 100, 100]; // Ширина первой ячейки и остальных ячеек для isCriticalTask

      const drawCell = (cell, cellX, cellWidthAdjusted, y, isFirstCell) => {
        // Draw the cell border
        page.drawRectangle({
          x: cellX,
          y: y - 40,
          width: cellWidthAdjusted,
          height: 40,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
        // Draw the horizontal line in the middle of the first cell
        if (cellWidthAdjusted == 200 || cellWidthAdjusted == 300) {
          page.drawLine({
            start: { x: cellX, y: y - 20 },
            end: { x: cellX + cellWidthAdjusted, y: y - 20 },
            thickness: 1,
            color: rgb(0, 0, 0),
          });
        }

        // Draw the label
        page.drawText(cell.label, {
          x: cellX + 5,
          y: y - 30,
          font: robotoFont,
          size: smallFontSize,
        });
        page.drawText(cell.value9, {
          x: cellX + 5,
          y: y - 7,
          font: robotoFont,
          size: smallFontSize,
        });

        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 36,
          font: robotoFont,
          size: smallFontSize,
        });
        page.drawText(cell.value10, {
          x: cellX + 4,
          y: y - 20,
          font: robotoFont,
          size: 12,
        });

        // Draw the value
        page.drawText(cell.value, {
          x: cellX + 23,
          y: y - 35,
          font: robotoFont,
          size: fontSizeM,
        });
        page.drawText(cell.label2, {
          x: cellX + 50,
          y: y - 30,
          font: robotoFont,
          size: smallFontSize,
        });
        page.drawText(cell.label3, {
          x: cellX + 50,
          y: y - 36,
          font: robotoFont,
          size: smallFontSize,
        });
        page.drawText(cell.value2, {
          x: cellX + 90,
          y: y - 35,
          font: robotoFont,
          size: fontSizeM,
        });
        page.drawText(cell.label4, {
          x: cellX + 110,
          y: y - 30,
          font: robotoFont,
          size: smallFontSize,
        });
        page.drawText(cell.label41, {
          x: cellX + 110,
          y: y - 36,
          font: robotoFont,
          size: smallFontSize,
        });
        page.drawText(cell.value8, {
          x: cellX + 150,
          y: y - 35,
          font: robotoFont,
          size: fontSizeM,
        });
        page.drawText(cell.label5, {
          x: cellX + 5,
          y: y - 7,
          font: robotoFont,
          size: smallFontSize,
        });

        page.drawText(cell.label6, {
          x: cellX + 5,
          y: y - 13,
          font: robotoFont,
          size: smallFontSize,
        });
        page.drawText(cell.value5, {
          x: cellX + 50,
          y: y - 10,
          font: robotoFont,
          size: fontSizeM,
        });
        page.drawText(cell.label7, {
          x: cellX + 100,
          y: y - 7,
          font: robotoFont,
          size: smallFontSize,
        });

        page.drawText(cell.label8, {
          x: cellX + 100,
          y: y - 13,
          font: robotoFont,
          size: smallFontSize,
        });
      };

      const currentCellData = task?.isCriticalTask
        ? cellData18
        : cellDataNotCritical;
      const currentCellWidths = task?.isCriticalTask
        ? cellWidthsCritical
        : cellWidthsNotCritical;

      for (let i = 0; i < currentCellData.length; i++) {
        const cell = currentCellData[i];
        const cellX = currentCellWidths
          .slice(0, i)
          .reduce((sum, width) => sum + width, 50); // Суммируем ширину предыдущих ячеек для вычисления x-координаты
        const cellWidthAdjusted = currentCellWidths[i]; // Ширина текущей ячейки

        drawCell(cell, cellX, cellWidthAdjusted, y);
      }

      y -= cellHeight;

      y -= 0; // / Space betwe
      // drawFooter(page);
      let additionalPdfs: Uint8Array[] = [];
      try {
        additionalPdfs = await Promise.all(
          task.reference
            .filter((ref) => ref.printAsAttachment) // Фильтруем только файлы с printAsAttachment === true
            .map(async (ref) => {
              try {
                const pdfBytes = await getFileFromServer(
                  COMPANY_ID,
                  ref.fileId,
                  'uploads'
                );
                return pdfBytes;
              } catch (error) {
                console.error(
                  `Ошибка при загрузке PDF-документа для fileId ${ref.fileId}:`,
                  error
                );
                return new Uint8Array(); // Возвращаем пустой Uint8Array, чтобы не прерывать процесс
              }
            })
        );
      } catch (error) {
        console.error(
          'Ошибка при загрузке дополнительных PDF-документов:',
          error
        );
      }
      // Объединение основного PDF-документа с дополнительными PDF-документами
      let taskPdfDoc: PDFDocument;
      try {
        taskPdfDoc = await PDFDocument.create();
        const embeddedPages = await Promise.all(
          additionalPdfs.map(async (pdfBytes) => {
            const srcDoc = await PDFDocument.load(pdfBytes);
            const pages = await taskPdfDoc.copyPages(
              srcDoc,
              srcDoc.getPageIndices()
            );
            return pages;
          })
        );
        embeddedPages.forEach((pages) =>
          pages.forEach((page) => taskPdfDoc.addPage(page))
        );
      } catch (error) {
        console.error('Ошибка при объединении PDF-документов:', error);
        continue; // Пропускаем эту задачу и переходим к следующей
      }

      // Функция для добавления новых страниц и обновления состояния

      // Копирование страниц из taskPdfDoc в основной pdfDoc
      const taskPages = await pdfDoc.copyPages(
        taskPdfDoc,
        taskPdfDoc.getPageIndices()
      );
      taskPages.forEach((page) => pdfDoc.addPage(page));

      // Добавление нумерации страниц для текущего блока
      const blockPages = [...pages, ...taskPages];
      const blockTotalPages = blockPages.length;

      pages.forEach((page, index) => {
        const pageNumber = index + 1;
        // const firstPage = pdfDoc.getPage(0);
        const { width: widthCr, height: hightCr } = page.getSize();
        if (task?.projectItemType === 'CR_TASK' || task?.isCriticalTask) {
          page.drawText('CRITICAL TASK', {
            x: widthCr / 5.0,
            y: hightCr / 3.6,
            font: robotoFontB,
            size: 80,
            color: rgb(1, 0, 0), // Красный цвет
            rotate: degrees(45), // Поворот на 45 градусов против часовой стрелки
            opacity: 0.2, // Полупрозрачность
          });
        }
        addMainPageText(page, robotoFont);
        addMainPageNumber(page, pageNumber, blockTotalPages);
      });

      taskPages.forEach((page, index) => {
        const pageNumber = pages.length && pages.length + index + 1;
        if (isAddTextVisible) {
          addAdditionalPageText(page, robotoFont);
          addAdditionalPageNumber(page, pageNumber, blockTotalPages);
        }
      });
    }

    // Создание и открытие финального PDF-документа
    const finalPdfBytes = await pdfDoc.save({
      updateMetadata: true, // Убедимся, что метаданные обновлены
    });
    return finalPdfBytes;
  };

  const addMainPageNumber = async (
    page: PDFPage,
    pageNumber: number,
    totalPages: number
  ) => {
    const { width, height } = page.getSize();
    const font = await page.doc.embedFont(StandardFonts.Helvetica);

    // Добавление нумерации страниц внизу страницы для основной страницы
    page.drawText(`Page ${pageNumber} of ${totalPages}`, {
      x: width - 100,
      y: 15, // Размещение внизу страницы
      size: 8,
      font,
      color: rgb(0, 0, 0),
    });
  };

  const addAdditionalPageNumber = async (
    page: PDFPage,
    pageNumber: number,
    totalPages: number
  ) => {
    const { width, height } = page.getSize();
    const font = await page.doc.embedFont(StandardFonts.Helvetica);

    // Добавление нумерации страниц внизу страницы для дополнительных страниц
    page.drawText(`Page ${pageNumber} of ${totalPages}`, {
      x: width - 107,
      y: page.getHeight() - 50,
      size: 8,
      font,
      color: rgb(0, 0, 0),
    });
  };

  const addMainPageText = (page: PDFPage, font: PDFFont) => {
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

    const documentType = isOriginal ? 'ORIGINAL' : 'COPY';

    page.drawText(`${documentType} print by ${SING} ${formattedDate}`, {
      x: 50,
      y: 15, // Размещение внизу страницы
      size: 8,
      font,
      color: rgb(0, 0, 0),
    });
  };

  const addAdditionalPageText = (page: PDFPage, font: PDFFont) => {
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
    page.drawText(
      `    Work Order: ${wo?.projectID?.WOReferenceID?.WONumber}                               Aircraft: ${wo?.projectID?.WOReferenceID?.planeId?.regNbr}                                                                                   Station: MSQ`,
      {
        x: 50,
        y: page.getHeight() - 50,
        size: 8,
        font,
        color: rgb(0, 0, 0),
      }
    );
  };
  useEffect(() => {
    if (isPdfRequested && !isLoading && projectTasks) {
      const generatePdfDocument = async () => {
        try {
          const pdfBytes = await createPdfDocument();
          const firstTask = transformedTasks[0];
          const fileName = `TASK-${firstTask?.taskNumber || 'unknown'}.pdf`;

          // Создаем Blob с именем файла
          const blob = new Blob([pdfBytes], {
            type: 'application/pdf',
          });

          if (pdfAction === 'view') {
            try {
              const fileName = `TASK-${firstTask?.taskNumber || 'unknown'}.pdf`;
              await window.electronAPI.openPdf(pdfBytes, fileName);
            } catch (error) {
              console.error('Error opening PDF:', error);
            }
          } else if (pdfAction === 'save') {
            // Оставляем как есть, так как работает корректно
            const fileURL = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = fileURL;
            link.download = `${fileName}.pdf`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(fileURL);
          }
        } catch (error) {
          console.error('Error generating PDF:', error);
        } finally {
          setIsViewLoading(false);
          setIsSaveLoading(false);
          setIsPdfRequested(false);
          setPdfAction(null);
          setShouldFetchData(false);
        }
      };

      generatePdfDocument();
    }
  }, [isPdfRequested, isLoading, projectTasks]);
  return (
    <div className="flex gap-2">
      <Button
        loading={isViewLoading}
        disabled={disabled || isViewLoading || isSaveLoading}
        size="small"
        onClick={generatePdf}
      >
        {t(buttonText || 'View')}
      </Button>
      <Button
        icon={<SaveOutlined />}
        loading={isSaveLoading}
        disabled={disabled || isViewLoading || isSaveLoading}
        size="small"
        onClick={generateAndSavePdf}
      >
        {/* {t('Download')} */}
      </Button>
    </div>
  );
};

export default PdfGenerator;
