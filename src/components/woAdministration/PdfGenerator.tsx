import React, { useState, useEffect, useMemo } from 'react';
import { Button } from 'antd';
import Handlebars from 'handlebars';
import { PDFDocument, PDFFont, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import fontkit from '@pdf-lib/fontkit';
import robotoBoldFont from '../../fonts/Roboto-Bold.ttf';
import robotoFontt from '../../fonts/Roboto-Regular.ttf'; // Путь к вашему шрифту
import logoImage from '../../assets/img/407Technics_logo.png'; // Путь к вашему логотипу
import { useGetProjectItemsWOQuery } from '@/features/projectItemWO/projectItemWOApi';
import { useTranslation } from 'react-i18next';
import { transformToIProjectTask } from '@/services/utilites';
const PdfGenerator: React.FC<{
  htmlTemplate: string;
  data: any;
  ids?: any;
  disabled?: any;
}> = ({ htmlTemplate, data, ids, disabled }) => {
  const { t } = useTranslation();
  const {
    data: projectTasks,
    isLoading,
    isFetching,
    refetch,
  } = useGetProjectItemsWOQuery(
    {
      ids: ids,
    },
    {
      skip: !ids.length,
      refetchOnMountOrArgChange: true,
    }
  );

  const transformedTasks = useMemo(() => {
    return transformToIProjectTask(projectTasks || []);
  }, [projectTasks]);

  const generatePdf = async () => {
    // // Компилируем шаблон с помощью Handlebars
    // const template = Handlebars.compile(htmlTemplate);
    // const renderedHtml = template(data);

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // const taskData =
    //   projectTasks && projectTasks?.length > 0 ? data : projectTasks;
    // // Загрузка шрифта
    const fontBytes = await fetch(robotoFontt).then((res) => res.arrayBuffer());
    const robotoFont = await pdfDoc.embedFont(fontBytes);
    const fontBytesB = await fetch(robotoBoldFont).then((res) =>
      res.arrayBuffer()
    );
    const robotoFontB = await pdfDoc.embedFont(fontBytesB);
    const logoBytes = await fetch(logoImage).then((res) => res.arrayBuffer());
    const logoImageEmbed = await pdfDoc.embedPng(logoBytes);

    for (const task of transformedTasks) {
      // Загрузка изображения

      const fontSize = 12;
      const smallFontSize = 8;
      const lageFontSize = 14;
      const qrCodeData = await QRCode.toDataURL(`${task?.taskWO}`);
      const qrCodeImage = await pdfDoc.embedPng(qrCodeData);

      const addPage = () => {
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points (width, height)
        const { width, height } = page.getSize();

        // Header
        const headerTable = [
          ['logo', 'title', 'QR Code'],
          // [data.acType, ''],
        ];

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
                size: lageFontSize,
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
              page.drawText(taskNumberText, {
                x: x + 125,
                y: y - 60,
                font: robotoFont,
                size: lageFontSize,
              });
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
                task?.taskCardNumber !== undefined
                  ? task.taskCardNumber
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
        const pageCount = pdfDoc.getPageCount();
        page.drawText(`Page ${pageCount} of ${pageCount}`, {
          x: 50,
          y: 30,
          font: robotoFont,
          size: smallFontSize,
        });
        page.drawText(`Time: ${new Date().toLocaleString()}`, {
          x: 450,
          y: 30,
          font: robotoFont,
          size: smallFontSize,
        });
      };

      let { page, width, height, y } = addPage();

      const cellData = [
        {
          label: 'WP Card Seq',
          label1: 'Номер в пакете',
          value: task.taskWPNumber !== undefined ? task.taskWPNumber : 'N/A',
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
          value:
            task.inspectionType !== undefined ? task.inspectionType : 'N/A',
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
          value: task.amtossaa !== undefined ? task.amtossaa : 'N/A',
        },
        {
          label: 'Raised Date',
          label1: 'Дата Создания',
          value: task.createDateqq !== undefined ? task.createDateqq : 'N/A',
        },
      ];
      const cellData4 = [
        {
          label: 'Zone',
          label1: 'Зона ',
          value: task.ZONES !== undefined ? task.ZONES : 'N/A',
        },
        {
          label: 'Access',
          label1: 'Доступ',
          value: task.amm !== undefined ? task.amm : 'N/A',
        },
        {
          label: 'Raised By',
          label1: 'Подготовлено',
          value: task.createBy !== undefined ? task.createBy : 'N/A',
        },
      ];
      const cellData5 = [
        {
          label: 'Work Pack',
          label1: 'Пакет Работ',
          value: task.WPNumber !== undefined ? task.WPNumber : 'N/A',
        },
        {
          label: 'Customer WO',
          label1: 'Заявка Заказчика',
          value: task.custumerWO !== undefined ? task.custumerWO : 'N/A',
        },
        {
          label: 'Internal WO',
          label1: 'Заказ-Наряд',
          value: task.woNumber !== undefined ? task.woNumber : 'N/A',
        },
        {
          label: 'Customer',
          label1: 'Заказчик',
          value: task.customer !== undefined ? task.customer : 'N/A',
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
          value: task.WPNumber !== undefined ? task.WPNumber : 'N/A',
        },
        {
          label: 'A/C Data',
          label1: 'Данные ВС',
          value: task.custumerWO !== undefined ? task.custumerWO : 'N/A',
        },
        {
          label: 'A/C Type',
          label1: 'Тип ВС',
          value: task.woNumber !== undefined ? task.woNumber : 'N/A',
        },
        {
          label: 'Skill',
          label1: 'Специализация',
          value: task.customer !== undefined ? task.customer : 'N/A',
        },
        {
          label: 'Act. Labor',
          label1: 'Трудозатраты',
          value: task.station !== undefined ? task.station : 'N/A',
        },
      ];
      const cellData7 = [
        {
          label: 'Related documents and references',
          label1: 'Сопутствующие документы и ссылки',
          value: '',
        },
      ];
      // const cellHeight = 30;
      // const cellWidth = 100;
      const cellHeight = 25;
      const cellWidth = 100;
      // y -= 0;

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
      // y -= 0;
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
        page.drawText(cell.value, {
          x: cellX + 65,
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
        page.drawText(cell.value, {
          x: cellX + 62,
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
          x: cellX + 60,
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
        page.drawText(cell.value, {
          x: cellX + 55,
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
          y: y - cellHeight,
          width: cellWidthAdjusted,
          height: cellHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        // Draw the label
        page.drawText(cell.label, {
          x: cellX + 5,
          y: y - 13,
          font: robotoFont,
          size: fontSize,
        });

        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 23,
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
      y -= cellHeight;
      const referenceTable = [
        ['Type', 'Reference', 'Description'],
        ...(data.reference
          ? task.reference.map((part: any) => [
              part.TYPE,
              part.REFERENCE,
              part.DESCRIPTION,
            ])
          : []),
      ];
      const referenceColumnWidths = [40, 200, 260]; // Widths for PART_NUMBER, DESCRIPTION, QUANTITY columns
      const referenceRowHeight = 20; // Height for each row in the part numbers table

      for (const row of referenceTable) {
        let x = 50;
        for (let i = 0; i < row.length; i++) {
          const cell = row[i];
          if (cell !== undefined) {
            page.drawText(cell, {
              x: x + 5,
              y: y - 15,
              font: robotoFont,
              size: smallFontSize,
            });
          }
          // Draw border around the cell
          page.drawRectangle({
            x,
            y: y - 20,
            width: referenceColumnWidths[i],
            height: 20,
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
          y: y - cellHeight,
          width: cellWidthAdjusted,
          height: cellHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        // Draw the label
        page.drawText(cell.label, {
          x: cellX + 5,
          y: y - 13,
          font: robotoFont,
          size: fontSize,
        });

        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 23,
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
      y -= cellHeight;
      const partNumbersTable = [
        ['Code', 'Part number', 'Description', 'Pick slip', 'Qty', 'Unit'],
        ...(data.partNumbers
          ? task.partNumbers.map((part: any) => [
              part.CODE,
              part.PART_NUMBER,
              part.DESCRIPTION,
              part.PICK_NUMBER,
              part.QUANTITY,
              part.UNIT,
            ])
          : []),
      ];

      const partNumbersColumnWidths = [50, 150, 200, 40, 30, 30]; // Widths for PART_NUMBER, DESCRIPTION, QUANTITY columns
      const partNumbersRowHeight = 20; // Height for each row in the part numbers table

      y -= 0; // Space between header and part numbers table
      for (const row of partNumbersTable) {
        let x = 50;
        for (let i = 0; i < row.length; i++) {
          const cell = row[i];
          if (cell !== undefined) {
            page.drawText(cell, {
              x: x + 5,
              y: y - 15,
              font: robotoFont,
              size: smallFontSize,
            });
          }
          // Draw border around the cell
          page.drawRectangle({
            x,
            y: y - 20,
            width: partNumbersColumnWidths[i],
            height: 20,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });
          x += partNumbersColumnWidths[i];
        }
        y -= partNumbersRowHeight;
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
            y: y - cellHeight,
            width: cellWidthAdjusted,
            height: cellHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });

          // Draw the label
          page.drawText(cell.label, {
            x: cellX + 5,
            y: y - 13,
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
            x: cellX + 55,
            y: y - 13,
            font: robotoFont,
            size: fontSize,
          });
          y -= partNumbersRowHeight;
        }
        y -= 10; // Space between

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
            y: y - cellHeight,
            width: cellWidthAdjusted,
            height: cellHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });

          // Draw the label
          page.drawText(cell.label, {
            x: cellX + 5,
            y: y - 13,
            font: robotoFont,
            size: fontSize,
          });

          page.drawText(cell.label1, {
            x: cellX + 5,
            y: y - 23,
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
        const toolTable = [
          ['Code', 'Part number', 'Description', 'Qty'],
          ...(data.partNumbers
            ? task.partNumbers.map((part: any) => [
                part.CODE,
                part.PART_NUMBER,
                part.DESCRIPTION,
                part.PICK_NUMBER,
              ])
            : []),
        ];
        const toolColumnWidths = [50, 150, 240, 60]; // Widths for PART_NUMBER, DESCRIPTION, QUANTITY columns
        const toolRowHeight = 20; // Height for each row in the part numbers table

        y -= 0; // Space between header and part numbers table
        for (const row of toolTable) {
          let x = 50;
          for (let i = 0; i < row.length; i++) {
            const cell = row[i];
            if (cell !== undefined) {
              page.drawText(cell, {
                x: x + 5,
                y: y - 15,
                font: robotoFont,
                size: smallFontSize,
              });
            }
            // Draw border around the cell
            page.drawRectangle({
              x,
              y: y - 20,
              width: toolColumnWidths[i],
              height: 20,
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
            y: y - cellHeight,
            width: cellWidthAdjusted,
            height: cellHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });

          // Draw the label
          page.drawText(cell.label, {
            x: cellX + 5,
            y: y - 13,
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
            x: cellX + 55,
            y: y - 13,
            font: robotoFont,
            size: fontSize,
          });
          y -= partNumbersRowHeight;
        }
        y -= 10; // Space between
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
            y: y - cellHeight,
            width: cellWidthAdjusted,
            height: cellHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });

          // Draw the label
          page.drawText(cell.label, {
            x: cellX + 5,
            y: y - 13,
            font: robotoFont,
            size: fontSize,
          });

          page.drawText(cell.label1, {
            x: cellX + 5,
            y: y - 23,
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
          value1: step?.number !== undefined ? step.number : 'N/A',
          value2: step?.createDate !== undefined ? step.createDate : 'N/A',
          value3: step?.createBy !== undefined ? step.createBy : 'N/A',
          value4: step?.description !== undefined ? step.description : 'N/A',
        };

        const cellX = 50;
        const cellWidthAdjusted = 500;

        const descriptionHeight = getTextHeight(
          cellData12.value4,
          robotoFont,
          fontSize,
          cellWidthAdjusted - 10 // Adjust for padding
        );

        const cellHeight = 30; // Base height for the top part

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
          y: y - 20,
          font: robotoFont,
          size: fontSize,
        });
        page.drawText(cellData12.value3, {
          x: cellX + 380,
          y: y - 20,
          font: robotoFont,
          size: fontSize,
        });

        const descriptionLines = splitTextIntoLines(
          cellData12.value4,
          robotoFont,
          fontSize,
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
          textY -= robotoFont.heightAtSize(fontSize);
        });

        page.drawText(cellData12.label, {
          x: cellX + 30,
          y: y - 13,
          font: robotoFont,
          size: fontSize,
        });

        page.drawText(cellData12.label1, {
          x: cellX + 30,
          y: y - 23,
          font: robotoFont,
          size: smallFontSize,
        });
        page.drawText(cellData12.label2, {
          x: cellX + 300,
          y: y - 13,
          font: robotoFont,
          size: smallFontSize,
        });
        page.drawText(cellData12.label3, {
          x: cellX + 300,
          y: y - 23,
          font: robotoFont,
          size: smallFontSize,
        });

        // Draw the value
        page.drawText(cellData12.value2, {
          x: cellX + 450,
          y: y - 20,
          font: robotoFont,
          size: smallFontSize,
        });

        y -= descriptionHeight + cellHeight;
      }

      ///ITEMS
      const cellData11 = [
        {
          label: 'Item Change List',
          label1: 'Перечень ЗаменённыхПозиций',
          value: '',
        },
      ];
      for (let i = 0; i < cellData11.length; i++) {
        const cell = cellData11[i];

        const cellX = 50 + (i > 0 ? 100 : 0) + (i > 1 ? 500 : 0); // Adjust x position for the cells after the first one
        const cellWidthAdjusted = cell.label === 'Item Change List' ? 500 : 100; // Adjust width for the "Cust. ID Code" cell

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
          y: y - 13,
          font: robotoFont,
          size: fontSize,
        });

        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 23,
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
      const toolTable = [
        [
          'P/N Off',
          'S/N Off',
          'P/N On',
          'S/N On',
          'Qty',
          'Certificate Ref',
          'Performed',
        ],
        ...(data.partNumbers
          ? task.partNumbers.map((part: any) => [
              part.PART_NUMBER_OFF,
              part.SN_OFF,
              part.PART_NUMBER_ON,
              part.SN_ON,
              part.QUANTITY,
              part.CERTIFICATE_NUMBER,
              part.PERFORMED,
            ])
          : []),
      ];
      const toolColumnWidths = [80, 80, 80, 80, 40, 70, 70]; // Widths for PART_NUMBER, DESCRIPTION, QUANTITY columns
      const toolRowHeight = 20; // Height for each row in the part numbers table

      y -= 0; // Space between header and part numbers table
      for (const row of toolTable) {
        let x = 50;
        for (let i = 0; i < row.length; i++) {
          const cell = row[i];
          if (cell !== undefined) {
            page.drawText(cell, {
              x: x + 5,
              y: y - 15,
              font: robotoFont,
              size: smallFontSize,
            });
          }
          // Draw border around the cell
          page.drawRectangle({
            x,
            y: y - 20,
            width: toolColumnWidths[i],
            height: 20,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });
          x += toolColumnWidths[i];
        }
        y -= toolRowHeight;
      }
      y -= 5; //
      ///ITEMS
      const cellData15 = [
        {
          label: 'Findings',
          label1: 'Выявленные отклонения',
          value: '',
        },
      ];

      for (let i = 0; i < cellData15.length; i++) {
        const cell = cellData15[i];

        const cellX = 50 + (i > 0 ? 100 : 0) + (i > 1 ? 500 : 0); // Adjust x position for the cells after the first one
        const cellWidthAdjusted = cell.label === 'Findings' ? 500 : 100; // Adjust width for the "Cust. ID Code" cell

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
          y: y - 13,
          font: robotoFont,
          size: fontSize,
        });

        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 23,
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
      const fidingsTable = [
        ['Defect', 'Reference', 'Deffered', 'Reference'],
        ...(data.partNumbers
          ? task.nrcIds.map((part: any) => [
              part.NRC_RFFERENCE,
              part.NRC_RFFERENCE,
              part.NRC_RFFERENCE,
              part.NRC_RFFERENCE,
            ])
          : []),
      ];
      const findingsColumnWidths = [100, 140, 120, 140]; // Widths for PART_NUMBER, DESCRIPTION, QUANTITY columns
      // const findingsRowHeight = 20; // Height for each row in the part numbers table

      y -= 0; // Space between header and part numbers table
      for (const row of fidingsTable) {
        let x = 50;
        for (let i = 0; i < row.length; i++) {
          const cell = row[i];
          if (cell !== undefined) {
            page.drawText(cell, {
              x: x + 5,
              y: y - 15,
              font: robotoFont,
              size: smallFontSize,
            });
          }
          // Draw border around the cell
          page.drawRectangle({
            x,
            y: y - 20,
            width: findingsColumnWidths[i],
            height: 20,
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
          y: y - 13,
          font: robotoFont,
          size: fontSize,
        });

        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 23,
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
      const cellData17 = [
        {
          label:
            'CERTIFIES THAT THIS WORK HAS BEEN ACCOMPLISHED IN ACCORDANCE WITH REQUIREMENTS OF AVIATION LEGISLATION OF ',
          label1:
            'RUSSIAN FEDERATION. ADMISSION TO OPERATION IN RELATION OF THIS WORK.',
          value: `РАБОТА ВЫПОЛНЕНА В СООТВЕТСТВИИ С ТРЕБОВАНИЯМИ АВИАЦИОННОГО ЗАКОНОДАТЕЛЬСТВА РОССИЙСКОЙ ФЕДЕРАЦИИ `,
          value2: `В ОБЛАСТИ ГРАЖДАНСКОЙ АВИАЦИИ, В ОТНОШЕНИИ ДАННОЙ РАБОТЫ, ВОЗДУШНОЕ СУДНО ПРИГОДНО ДЛЯ ДОПУСКА`,
          value3: `К ЭКСПЛУАТАЦИИ.`,
        },
      ];
      y -= 5; //
      for (let i = 0; i < cellData17.length; i++) {
        const cell = cellData17[i];

        const cellX = 50 + (i > 0 ? 100 : 0) + (i > 1 ? 500 : 0); // Adjust x position for the cells after the first one
        const cellWidthAdjusted =
          cell.label ===
          'CERTIFIES THAT THIS WORK HAS BEEN ACCOMPLISHED IN ACCORDANCE WITH REQUIREMENTS OF AVIATION LEGISLATION OF '
            ? 500
            : 100; // Adjust width for the "Cust. ID Code" cell

        // Draw the cell border
        page.drawRectangle({
          x: cellX,
          y: y - 60,
          width: cellWidthAdjusted,
          height: 60,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        // Draw the label
        page.drawText(cell.label, {
          x: cellX + 5,
          y: y - 10,
          font: robotoFont,
          size: smallFontSize,
        });

        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 20,
          font: robotoFont,
          size: smallFontSize,
        });
        // Draw the value
        page.drawText(cell.value, {
          x: cellX + 5,
          y: y - 30,
          font: robotoFont,
          size: smallFontSize,
        });
        page.drawText(cell.value2, {
          x: cellX + 5,
          y: y - 40,
          font: robotoFont,
          size: smallFontSize,
        });
        page.drawText(cell.value3, {
          x: cellX + 5,
          y: y - 50,
          font: robotoFont,
          size: smallFontSize,
        });
        y -= partNumbersRowHeight;
      }
      y -= 40; // Space between header and part numbers table
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
      const cellData18 = [
        {
          label: '',
          label1: ' ',
          value: task.zones !== undefined ? task.zones : '',
        },
        {
          label: 'Date',
          label1: 'Дата',
          value: task.amm !== undefined ? task.amm : '',
        },
        {
          label: 'Inspected',
          label1: 'Проверено',
          value: task.createBy !== undefined ? task.create : '',
        },
        {
          label: 'Double Inspected',
          label1: 'Независимо проверено',
          value: task.anotherField !== undefined ? task.anotherField : '',
        },
      ];

      const cellWidths = [200, 100, 100, 100]; // Ширина первой ячейки и остальных ячеек

      for (let i = 0; i < cellData18.length; i++) {
        const cell = cellData18[i];
        const cellX = cellWidths
          .slice(0, i)
          .reduce((sum, width) => sum + width, 50); // Суммируем ширину предыдущих ячеек для вычисления x-координаты
        const cellWidthAdjusted = cellWidths[i]; // Ширина текущей ячейки

        // Draw the cell border
        page.drawRectangle({
          x: cellX,
          y: y - 60,
          width: cellWidthAdjusted,
          height: 60,
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
          x: cellX + 42,
          y: y - 45,
          font: robotoFont,
          size: fontSize,
        });
      }
      y -= cellHeight;

      y -= 0; // / Space betwe
      drawFooter(page);
    }
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL, '_blank');
    URL.revokeObjectURL(fileURL);
    console.log('PDF успешно создан');
  };
  return (
    <div>
      <Button
        loading={isLoading}
        disabled={disabled}
        size="small"
        onClick={generatePdf}
      >
        {`${t('PRINT WORKORDER')}`}
      </Button>
    </div>
  );
};

export default PdfGenerator;
