//@ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Button, Modal, notification } from 'antd';
import Handlebars from 'handlebars';
import {
  PDFDocument,
  PDFFont,
  PDFPage,
  rgb,
  StandardFonts,
  degrees,
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

const PdfGeneratorWP: React.FC<{
  wo?: any;
  htmlTemplate?: string;
  data?: any;
  ids?: any;
  disabled?: any;
  onClick: (key: string) => void;
}> = ({ htmlTemplate, data, ids, disabled, wo, onClick }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false); // Состояние загрузки
  console.log(wo);
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
      skip: !ids?.length,
      refetchOnMountOrArgChange: true,
    }
  );
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
  const transformedTasks = useMemo(() => {
    return projectTasks || [];
  }, [projectTasks]);

  const addPageNumber = async (
    page: PDFPage,
    pageNumber: number,
    totalPages: number
  ) => {
    const { width, height } = page.getSize();
    const font = await page.doc.embedFont(StandardFonts.Helvetica);

    // Добавление нумерации страниц
    page.drawText(`Page ${pageNumber} of ${totalPages}`, {
      x: width - 107,
      y: height - 50,
      size: 8,
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

  const generatePdf = async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    setLoading(true);
    // console.log(task.ACMSN);
    // Загрузка шрифтов и изображений
    const fontBytes = await fetch(robotoFontt).then((res) => res.arrayBuffer());
    const robotoFont = await pdfDoc.embedFont(fontBytes);
    const fontBytesB = await fetch(robotoBoldFont).then((res) =>
      res.arrayBuffer()
    );
    const fontSize = 9;
    const fontSizeM = 7;
    const smallFontSize = 5;
    const lageFontSize = 13;
    const extraLageFontSize = 16;
    const robotoFontB = await pdfDoc.embedFont(fontBytesB);
    const logoBytes = await fetch(logoImage).then((res) => res.arrayBuffer());
    const logoImageEmbed = await pdfDoc.embedPng(logoBytes);
    let totalPages = 0;
    let blockStartIndex = 0;
    for (const task of transformedTasks) {
      const pages = [];
      const qrCodeData = await QRCode.toDataURL(`${task?.taskWO}`);
      const qrCodeImage = await pdfDoc.embedPng(qrCodeData);

      const addPage = () => {
        const page = pdfDoc.addPage([595.28, 841.89]);
        pages.push(page);
        // A4 size in points (width, height)
        const { width, height } = page.getSize();

        // Header
        const headerTable = [['logo', 'title', 'QR Code']];

        let y = height - 30;
        for (const row of headerTable) {
          let x = 50;
          for (let i = 0; i < row.length; i++) {
            const cell = row[i];
            if (cell === 'title') {
              page.drawText('ROUTINE CARD', {
                x: x + 75,
                y: y - 15,
                font: robotoFontB,
                size: 14,
              });
              page.drawText('КАРТА НА ВЫПОЛНЕНИЕ РЕГЛАМЕНТНЫХ РАБОТ', {
                x: x + 5,
                y: y - 30,
                font: robotoFontB,
                size: fontSize,
              });
              page.drawLine({
                start: { x: x, y: y - 36.8 },
                end: { x: x + 300, y: y - 36.8 },
                thickness: 1,
                color: rgb(0, 0, 0),
              });
              page.drawText('Job Title', {
                x: x + 5,
                y: y - 60,
                font: robotoFont,
                size: smallFontSize,
              });
              const taskNumberText =
                task?.taskNumber !== undefined ? task.taskNumber : 'N/A';
              const truncatedTaskNumberText = truncateText(
                taskNumberText,
                260,
                robotoFont,
                16
              );

              // Смещение влево на 20 единиц
              page.drawText(truncatedTaskNumberText, {
                x: x + 35, // Изменено с x + 85 на x + 65
                y: y - 60,
                font: robotoFont,
                size: 16,
              });
              // const taskNumberText =
              //   task?.taskNumber !== undefined ? task.taskNumber : 'N/A';
              // page.drawText(taskNumberText, {
              //   x: x + 85,
              //   y: y - 60,
              //   font: robotoFont,
              //   size: 16,
              // });
              page.drawText('Наименование', {
                x: x + 5,
                y: y - 70,
                font: robotoFont,
                size: smallFontSize,
              });
            } else if (cell === 'QR Code') {
              page.drawImage(qrCodeImage, {
                x: x + 20, // Adjusted x position for QR code
                y: y - 50, // Adjusted y position for QR code
                width: 50,
                height: 50,
              });
              page.drawText('Trace №', {
                x: x + 5,
                y: y - 60,
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
                size: fontSize,
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
              page.drawText('Card №', {
                x: x + 5,
                y: y - 60,
                font: robotoFont,
                size: smallFontSize,
              });
              page.drawText('Карта №', {
                x: x + 5,
                y: y - 70,
                font: robotoFont,
                size: smallFontSize,
              });
              // Add taskCardNumber or N/A to the right
              const taskCardNumberText =
                task?.cardNumber !== undefined
                  ? String(task.cardNumber)
                  : 'N/A';
              page.drawText(taskCardNumberText, {
                x: x + 50,
                y: y - 65,
                font: robotoFont,
                size: fontSize,
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

      const cellData = [
        {
          label: 'WP Card Seq',
          label1: 'Номер в пакете',
          value:
            task.taskWONumber !== undefined ? String(task.taskWONumber) : 'N/A',
        },
        {
          label: 'Cust. ID Code',
          label1: 'Код Заказчика',
          value:
            task.custumerIDCode !== undefined ? task.custumerIDCode : 'N/A',
        },
        {
          label: 'Index',
          label1: 'Индекс',
          value: task.index !== undefined ? task.index : 'N/A',
        },
        {
          label: 'Inspection',
          label1: 'Тип Инспекции',
          value: task.taskCode !== undefined ? task.taskCode : 'N/A',
        },
        {
          label: 'Job Status',
          label1: 'Статус работы',
          value: task.jobStatus !== undefined ? task.jobStatus : 'N/A',
        },
      ];
      const cellData3 = [
        {
          label: '',
          label1: 'ATA ',
          value: task.ata !== undefined ? task.ata : 'N/A',
        },
        {
          label: 'Reference',
          label1: 'Ссылка на ЭТД',
          value: task.amtoss !== undefined ? task.amtoss : 'N/A',
        },
        {
          label: 'Raised Date',
          label1: 'Дата Создания',
          value: task.createDate !== undefined ? task.createDate : 'N/A',
        },
      ];
      const cellData4 = [
        {
          label: 'Zone',
          label1: 'Зона ',
          value: task.zones !== undefined ? task.zones : 'N/A',
        },
        {
          label: 'Access',
          label1: 'Доступ',
          value: task.access !== undefined ? task.access : 'N/A',
        },
        {
          label: 'Raised By',
          label1: 'Подготовлено',
          value: task.createBySing !== undefined ? task.createBySing : 'N/A',
        },
      ];
      const cellData5 = [
        {
          label: 'Work Pack',
          label1: 'Пакет Работ',
          value: task.WPNumber !== undefined ? String(task.WPNumber) : 'N/A',
        },
        {
          label: 'Customer WO',
          label1: 'Заявка Заказчика',
          value:
            task.custumerWO !== undefined ? String(task.custumerWO) : 'N/A',
        },
        {
          label: 'Internal WO',
          label1: 'Заказ-Наряд',
          value: task.WONumber !== undefined ? String(task.WONumber) : 'N/A',
        },
        {
          label: 'Customer',
          label1: 'Заказчик',
          value: task.customerCode !== undefined ? task.customerCode : 'N/A',
        },
        {
          label: 'Station',
          label1: 'Произв. база',
          value: task.station !== undefined ? task.station : 'MSQ',
        },
      ];
      const cellData6 = [
        {
          label: 'A/C Reg.',
          label1: 'Рег. Номер ВС',
          value:
            task.ACRegistration !== undefined ? task.ACRegistration : 'N/A',
        },
        {
          label: 'A/C Data',
          label1: 'Данные ВС',
          value: task.ACMSN !== undefined ? String(task.ACMSN) : 'N/A',
        },
        {
          label: 'A/C Type',
          label1: 'Тип ВС',
          value: task.acType !== undefined ? String(task.acType) : 'N/A',
        },
        {
          label: 'Skill',
          label1: 'Специализация',
          value: task.skills !== undefined ? task.skills : 'N/A',
        },
        {
          label: 'Act. Labor',
          label1: 'Трудозатраты',
          value:
            task.mainWorkTime !== undefined ? String(task.mainWorkTime) : 'N/A',
        },
      ];
      const cellData7 = [
        {
          label: 'Related documents and references',
          label1: 'Сопутствующие документы и ссылки',
          value: '',
        },
      ];

      // const truncateText = (
      //   text: any,
      //   maxWidth: number,
      //   font: PDFFont,
      //   fontSize: number
      // ) => {
      //   let truncated = text;
      //   let width = font.widthOfTextAtSize(truncated, fontSize);

      //   if (width <= maxWidth) {
      //     return truncated;
      //   }

      //   while (width > maxWidth && truncated.length > 0) {
      //     truncated = truncated.slice(0, -1);
      //     width = font.widthOfTextAtSize(truncated + '...', fontSize);
      //   }

      //   return truncated + '...';
      // };
      const cellHeight = 25;
      const cellHeightSmall = 20;
      const cellWidth = 100;

      for (let i = 0; i < cellData.length; i++) {
        const cell = cellData[i];
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
          y: y - 14,
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
        page.drawText(cell.value, {
          x: cellX + 65,
          y: y - 20,
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
          y: y - 15,
          font: robotoFont,
          size: smallFontSize,
        });

        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 21,
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
          x: cellX + 40,
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
          y: y - 15,
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
          x: cellX + 40,
          y: y - 15,
          font: robotoFont,
          size: fontSize,
        });
      }
      y -= cellHeight;

      y -= 0; // / Space between the previous content and the new cells

      for (let i = 0; i < cellData5.length; i++) {
        const cell = cellData5[i];
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
          y: y - 15,
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
          x: cellX + 45,
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
          y: y - 15,
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
          x: cellX + 35,
          y: y - 15,
          font: robotoFont,
          size: fontSize,
        });
      }
      y -= cellHeight;

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
          label1: 'Расходные материалы',
          value: '',
        },
      ];

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

      ///tooll
      const cellData11 = [
        {
          label: 'Tools and Equipment',
          label1: 'Инструмент И Оборудование',
          value: '',
        },
      ];
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
              // ['', '', '', ''],
            ]),
      ];
      const toolColumnWidths = [50, 150, 240, 60]; // Widths for PART_NUMBER, DESCRIPTION, QUANTITY columns
      const toolRowHeight = 15; // Height for each row in the part numbers table

      y -= 0; // Space between header and part numbers table
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
      ////Instructions
      const cellData10 = [
        {
          label: 'Accomplishment Instructions',
          label1: 'Инструкции по выполнению',
          value: '',
        },
      ];
      for (let i = 0; i < cellData10.length; i++) {
        const cell = cellData10[i];

        const cellX = 50 + (i > 0 ? 100 : 0) + (i > 1 ? 500 : 0); // Adjust x position for the cells after the first one
        const cellWidthAdjusted =
          cell.label === 'Accomplishment Instructions' ? 500 : 100; // Adjust width for the "Cust. ID Code" cell

        // Draw the cell border
        page.drawRectangle({
          x: cellX,
          y: y - cellHeightSmall,
          width: cellWidthAdjusted,
          height: cellHeightSmall,
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
      }
      y -= 5; // Space between
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
              ? String(new Date(step?.createDate).toLocaleDateString('en-US'))
              : 'N/A',
          value3:
            step?.createUserID !== undefined
              ? step.createUserID?.singNumber
              : 'N/A',
          value4:
            step?.stepDescription !== undefined ? step.stepDescription : 'N/A',
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
          drawFooter(page);
          ({ page, width, height, y } = addPage());
        }

        page.drawRectangle({
          x: cellX,
          y: y - cellHeight,
          width: cellWidthAdjusted,
          height: cellHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
        page.drawRectangle({
          x: cellX,
          y: y - cellHeight - descriptionHeight,
          width: cellWidthAdjusted,
          height: descriptionHeight,
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
          x: cellX + 380,
          y: y - 15,
          font: robotoFont,
          size: fontSize,
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
        page.drawText(cellData12.label2, {
          x: cellX + 300,
          y: y - 10,
          font: robotoFont,
          size: smallFontSize,
        });
        page.drawText(cellData12.label3, {
          x: cellX + 300,
          y: y - 17,
          font: robotoFont,
          size: smallFontSize,
        });

        // Draw the value
        page.drawText(cellData12.value2, {
          x: cellX + 450,
          y: y - 13,
          font: robotoFont,
          size: smallFontSize,
        });

        y -= descriptionHeight + cellHeight;
      }
      y -= 5;

      ///ITEMS
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
        const cellWidthAdjusted = cell.label === 'Item Change List' ? 500 : 100; // Adjust width for the "Cust. ID Code" cell

        // Draw the cell border
        if (y - cellHeightSmall - cellHeightSmall < 50) {
          // Check if there is enough space for the step
          drawFooter(page);
          ({ page, width, height, y } = addPage());
        }
        page.drawRectangle({
          x: cellX,
          y: y - cellHeightSmall,
          width: cellWidthAdjusted,
          height: cellHeightSmall,
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
      }
      y -= 5; // Space between header and part numbers table
      const componentTable = [
        [
          'P/N Off',
          'S/N Off',
          'P/N On',
          'S/N On',
          'Qty',
          'Certificate',
          'Performed',
        ],
        ...(task.componens && task.componens.length > 0
          ? task.componens.map((part: any) => [
              String(part.PART_NUMBER_OFF || ''),
              String(part.SN_OFF || ''),
              String(part.PART_NUMBER_ON || ''),
              String(part.SN_ON || ''),
              String(part.QUANTITY || ''),
              String(part.CERTIFICATE_NUMBER || ''),
              String(part.PERFORMED || ''),
            ])
          : [
              ['', '', '', '', '', '', ''],
              ['', '', '', '', '', '', ''],
            ]),
      ];
      const componentColumnWidths = [80, 80, 80, 80, 40, 70, 70]; // Widths for PART_NUMBER, DESCRIPTION, QUANTITY columns
      const componentRowHeight = 15; // Height for each row in the part numbers table

      y -= 0; // Space between header and part numbers table
      for (const row of componentTable) {
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
      y -= 5; //
      ///ITEMS
      const cellData25 = [
        {
          label: 'Findings',
          label1: 'Выявленные отклонения',
          value: '',
        },
      ];

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
      y -= 5;
      const findingsTable = [
        ['Defect', 'Reference', 'Deferred', 'Reference'],
        ...(task.defects && task.defects.length > 0
          ? task.defects.map((part: any) => [
              String(part.NRC_REFERENCE || ''),
              String(part.NRC_REFERENCE || ''),
              String(part.NRC_REFERENCE || ''),
              String(part.NRC_REFERENCE || ''),
            ])
          : [['', '', '', '']]),
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
              size: smallFontSize,
            });
          }
          // Draw border around the cell
          if (y - cellHeight - cellHeight < 50) {
            // Check if there is enough space for the step
            drawFooter(page);
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
      ///release
      y -= 5; //

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
        if (y - cellHeight - cellHeight < 50) {
          // Check if there is enough space for the step
          drawFooter(page);
          ({ page, width, height, y } = addPage());
        }

        page.drawRectangle({
          x: cellX,
          y: y - 20,
          width: cellWidthAdjusted,
          height: 20,
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
          y: y - 10,
          font: robotoFont,
          size: fontSize,
        });
        // y -= partNumbersRowHeight;
      }
      const cellData1234 = {
        value1:
          wo?.certificateId !== undefined
            ? String(wo?.certificateId?.description)
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
        drawFooter(page);
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

      // const cellData17 = [
      //   {
      //     label:
      //       'CERTIFIES THAT THIS WORK HAS BEEN ACCOMPLISHED IN ACCORDANCE WITH REQUIREMENTS OF AVIATION LEGISLATION OF RUSSIAN FEDERATION.',
      //     label1: 'ADMISSION TO OPERATION IN RELATION OF THIS WORK.',
      //     value: `РАБОТА ВЫПОЛНЕНА В СООТВЕТСТВИИ С ТРЕБОВАНИЯМИ АВИАЦИОННОГО ЗАКОНОДАТЕЛЬСТВА РОССИЙСКОЙ ФЕДЕРАЦИИ В ОБЛАСТИ ГРАЖДАНСКОЙ АВИАЦИИ, В ОТНОШЕНИИ ДАННОЙ РАБОТЫ`,
      //     value2: `ВОЗДУШНОЕ СУДНО ПРИГОДНО ДЛЯ ДОПУСКА К ЭКСПЛУАТАЦИИ.`,
      //     value3: ``,
      //   },
      // ];
      // y -= 5; //
      // for (let i = 0; i < cellData17.length; i++) {
      //   const cell = cellData17[i];

      //   const cellX = 50 + (i > 0 ? 100 : 0) + (i > 1 ? 500 : 0); // Adjust x position for the cells after the first one
      //   const cellWidthAdjusted =
      //     cell.label ===
      //     'CERTIFIES THAT THIS WORK HAS BEEN ACCOMPLISHED IN ACCORDANCE WITH REQUIREMENTS OF AVIATION LEGISLATION OF RUSSIAN FEDERATION.'
      //       ? 500
      //       : 100; // Adjust width for the "Cust. ID Code" cell

      //   // Draw the cell border
      //   if (y - 45 < 50) {
      //     // Check if there is enough space for the step
      //     drawFooter(page);
      //     ({ page, width, height, y } = addPage());
      //   }
      //   page.drawRectangle({
      //     x: cellX,
      //     y: y - 45,
      //     width: cellWidthAdjusted,
      //     height: 45,
      //     borderColor: rgb(0, 0, 0),
      //     borderWidth: 1,
      //   });

      //   // Draw the label
      //   page.drawText(cell.label, {
      //     x: cellX + 5,
      //     y: y - 10,
      //     font: robotoFont,
      //     size: smallFontSize,
      //   });

      //   page.drawText(cell.label1, {
      //     x: cellX + 5,
      //     y: y - 20,
      //     font: robotoFont,
      //     size: smallFontSize,
      //   });
      //   // Draw the value
      //   page.drawText(cell.value, {
      //     x: cellX + 5,
      //     y: y - 30,
      //     font: robotoFont,
      //     size: smallFontSize,
      //   });
      //   page.drawText(cell.value2, {
      //     x: cellX + 5,
      //     y: y - 40,
      //     font: robotoFont,
      //     size: smallFontSize,
      //   });
      //   page.drawText(cell.value3, {
      //     x: cellX + 5,
      //     y: y - 50,
      //     font: robotoFont,
      //     size: smallFontSize,
      //   });
      //   y -= partNumbersRowHeight;
      // }
      // y -= 30;
      // Space between header and part numbers table
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
      const cellDataNotCritical = [
        { label: '', label1: ' ', value: '' },

        {
          label: 'Date',
          label1: 'Дата',
          value: task.closeDate !== undefined ? task.closeDate : '',
        },
        {
          label: 'Inspected',
          label1: 'Проверено',
          value: task.inspectBY !== undefined ? task.closeBy : '',
        },
      ];

      const cellData18 = [
        { label: '', label1: ' ', value: '' },
        {
          label: 'Date',
          label1: 'Дата',
          value: task.closeDate !== undefined ? task.closeDate : '',
        },
        {
          label: 'Inspected',
          label1: 'Проверено',
          value: task.inspectBY !== undefined ? task.closeBy : '',
        },
        {
          label: 'Double Inspected',
          label1: 'Независимо проверено',
          value: task.DICLOSE !== undefined ? task.DICLOSE : '',
        },
      ];

      const cellWidthsNotCritical = [300, 100, 100]; // Ширина первой ячейки и остальных ячеек для не isCriticalTask
      const cellWidthsCritical = [200, 100, 100, 100]; // Ширина первой ячейки и остальных ячеек для isCriticalTask

      const drawCell = (cell, cellX, cellWidthAdjusted, y) => {
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
          y: y - 28,
          font: robotoFont,
          size: smallFontSize,
        });

        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 36,
          font: robotoFont,
          size: smallFontSize,
        });

        // Draw the value
        page.drawText(cell.value, {
          x: cellX + 42,
          y: y - 45,
          font: robotoFont,
          size: fontSize,
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
      drawFooter(page);
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
            opacity: 0.3, // Полупрозрачность
          });
        }
        addMainPageText(page, robotoFont);
        addMainPageNumber(page, pageNumber, blockTotalPages);
      });

      taskPages.forEach((page, index) => {
        const pageNumber = pages.length && pages.length + index + 1;

        addAdditionalPageText(page, robotoFont);
        addAdditionalPageNumber(page, pageNumber, blockTotalPages);
        // // }
      });
    }

    // Создание и открытие финального PDF-документа
    // const finalPdfBytes = await pdfDoc.save();
    // const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
    // const fileURL = URL.createObjectURL(blob);
    // window.open(fileURL, '_blank');
    // URL.revokeObjectURL(fileURL);

    // console.log('PDF успешно создан');
    // setLoading(false);

    const formattedDate = `${new Date()
      .getDate()
      .toString()
      .padStart(2, '0')}.${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, '0')}.${new Date().getFullYear()} ${new Date()
      .getHours()
      .toString()
      .padStart(2, '0')}:${new Date().getMinutes()}`;
    const finalPdfBytes = await pdfDoc.save();
    const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(blob);

    // Создаем ссылку для скачивания
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = `WP-DATA-${wo.WOName}-${formattedDate}.pdf`; // Указываем имя файла
    link.style.display = 'none';
    document.body.appendChild(link);

    // Кликаем по ссылке для скачивания
    link.click();

    // Удаляем ссылку после скачивания
    document.body.removeChild(link);
    URL.revokeObjectURL(fileURL);

    console.log('PDF успешно создан');
    setLoading(false);
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
      y: 6, // Размещение внизу страницы
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
      x: width - 100,
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

    // Добавление текста на дополнительные страницы
    page.drawText(`ORIGINAL print by ${SING} ${formattedDate}`, {
      x: 50,
      y: 6, // Размещение внизу страницы
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
      `    Work Order: ${wo?.WONumber}                               Aircraft: ${wo?.planeId?.regNbr}                                                                                   Station: MSQ`,
      {
        x: 50,
        y: page.getHeight() - 50,
        size: 8,
        font,
        color: rgb(0, 0, 0),
      }
    );
    setLoading(false);
  };

  const handleGeneratePdf = async () => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO GENERATE PDF?'),
      onOk: async () => {
        // await generatePdf();
        try {
          await generatePdf();
          Modal.destroyAll();
          onClick('generateTaskCard');
        } catch {
          notification.error({
            message: t('FAILED '),
            description: 'There was an error generate PDF.',
          });
        }
      },
    });
  };

  return (
    <div className="ml-4">
      <Button
        // type=""
        disabled={disabled || ids === null || ids === ''}
        size="small"
        onClick={handleGeneratePdf}
      >
        {`${t('GENERATE PDF AND SAVE')}`}
      </Button>
    </div>
  );
};

export default PdfGeneratorWP;
