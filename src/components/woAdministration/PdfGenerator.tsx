import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import Handlebars from 'handlebars';
import { PDFDocument, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import fontkit from '@pdf-lib/fontkit';
import robotoBoldFont from '../../fonts/Roboto-Bold.ttf';
import robotoFontt from '../../fonts/Roboto-Regular.ttf'; // Путь к вашему шрифту
import logoImage from '../../assets/img/407Technics_logo.png'; // Путь к вашему логотипу

const PdfGenerator: React.FC<{ htmlTemplate: string; data: any }> = ({
  htmlTemplate,
  data,
}) => {
  const generatePdf = async () => {
    // Компилируем шаблон с помощью Handlebars
    const template = Handlebars.compile(htmlTemplate);
    const renderedHtml = template(data);

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // Загрузка шрифта
    const fontBytes = await fetch(robotoFontt).then((res) => res.arrayBuffer());
    const robotoFont = await pdfDoc.embedFont(fontBytes);
    const fontBytesB = await fetch(robotoBoldFont).then((res) =>
      res.arrayBuffer()
    );
    const robotoFontB = await pdfDoc.embedFont(fontBytesB);
    // Загрузка изображения
    const logoBytes = await fetch(logoImage).then((res) => res.arrayBuffer());
    const logoImageEmbed = await pdfDoc.embedPng(logoBytes);

    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points (width, height)
    const { width, height } = page.getSize();
    const fontSize = 12;
    const smallFontSize = 8;
    const lageFontSize = 14;

    // Header
    const headerTable = [
      ['logo', 'title', 'QR Code'],
      // [data.acType, ''],
    ];

    const qrCodeData = await QRCode.toDataURL('Random Data');
    const qrCodeImage = await pdfDoc.embedPng(qrCodeData);

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
            data.taskCardNumber !== undefined ? data.taskCardNumber : 'N/A';
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
            // if (i === 1) {
            //   // Draw horizontal line
            //   page.drawLine({
            //     start: { x: x, y: y - 36.8 },
            //     end: { x: x + 300, y: y - 36.8 },
            //     thickness: 1,
            //     color: rgb(0, 0, 0),
            //   });
            //   // Add text below the line
            //   page.drawText('Job Title', {
            //     x: x + 5,
            //     y: y - 60,
            //     font: robotoFont,
            //     size: smallFontSize,
            //   });
            //   page.drawText('Наименование', {
            //     x: x + 5,
            //     y: y - 70,
            //     font: robotoFont,
            //     size: smallFontSize,
            //   });
            //   // Add taskDescription or N/A to the right
            //   const taskDescriptionText =
            //     data.taskDescription !== undefined
            //       ? data.taskDescription
            //       : 'N/A';
            //   page.drawText(taskDescriptionText, {
            //     x: x + 100,
            //     y: y - 65,
            //     font: robotoFont,
            //     size: fontSize,
            //   });
            // }
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
      const cellHeight = 30;
      const cellWidth = 100;
      const cellData = [
        {
          label: 'WP Card Seq',
          label1: 'Номер в пакете',
          value: data.taskWPNumber !== undefined ? data.taskWPNumber : 'N/A',
        },
        {
          label: 'Cust. ID Code',
          label1: 'Код Заказчика',
          value: data.custCode !== undefined ? data.custCode : 'N/A',
        },
        {
          label: 'Index',
          label1: 'Индекс',
          value: data.index !== undefined ? data.index : 'N/A',
        },
        {
          label: 'Inspection',
          label1: 'Тип Инспекции',
          value:
            data.inspectionType !== undefined ? data.inspectionType : 'N/A',
        },
        {
          label: 'Job Status',
          label1: 'Статус работы',
          value: data.jobStatus !== undefined ? data.jobStatus : 'N/A',
        },
      ];
      const cellData3 = [
        {
          label: '',
          label1: 'ATA ',
          value: data.ata !== undefined ? data.ata : 'N/A',
        },
        {
          label: 'Reference',
          label1: 'Ссылка на ЭТД',
          value: data.amm !== undefined ? data.amm : 'N/A',
        },
        {
          label: 'Raised Date',
          label1: 'Дата Создания',
          value: data.createDate !== undefined ? data.createDate : 'N/A',
        },
      ];
      const cellData4 = [
        {
          label: 'Zone',
          label1: 'Зона ',
          value: data.zones !== undefined ? data.zones : 'N/A',
        },
        {
          label: 'Access',
          label1: 'Доступ',
          value: data.amm !== undefined ? data.amm : 'N/A',
        },
        {
          label: 'Raised By',
          label1: 'Подготовлено',
          value: data.createBy !== undefined ? data.create : 'N/A',
        },
      ];
      const cellData5 = [
        {
          label: 'Work Pack',
          label1: 'Пакет Работ',
          value: data.WPNumber !== undefined ? data.WPNumber : 'N/A',
        },
        {
          label: 'Customer WO',
          label1: 'Заявка Заказчика',
          value: data.custumerWO !== undefined ? data.custumerWO : 'N/A',
        },
        {
          label: 'Internal WO',
          label1: 'Заказ-Наряд',
          value: data.woNumber !== undefined ? data.woNumber : 'N/A',
        },
        {
          label: 'Customer',
          label1: 'Заказчик',
          value: data.customer !== undefined ? data.customer : 'N/A',
        },
        {
          label: 'Station',
          label1: 'Произв. база',
          value: data.station !== undefined ? data.station : 'N/A',
        },
      ];
      const cellData6 = [
        {
          label: 'A/C Reg.',
          label1: 'Рег. Номер ВС',
          value: data.WPNumber !== undefined ? data.WPNumber : 'N/A',
        },
        {
          label: 'A/C Data',
          label1: 'Данные ВС',
          value: data.custumerWO !== undefined ? data.custumerWO : 'N/A',
        },
        {
          label: 'A/C Type',
          label1: 'Тип ВС',
          value: data.woNumber !== undefined ? data.woNumber : 'N/A',
        },
        {
          label: 'Skill',
          label1: 'Специализация',
          value: data.customer !== undefined ? data.customer : 'N/A',
        },
        {
          label: 'Act. Labor',
          label1: 'Трудозатраты',
          value: data.station !== undefined ? data.station : 'N/A',
        },
      ];

      y -= 0; // Space between the previous content and the new cells

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
          y: y - 20,
          font: robotoFont,
          size: smallFontSize,
        });

        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 28,
          font: robotoFont,
          size: smallFontSize,
        });
        // Draw the value
        page.drawText(cell.value, {
          x: cellX + 55,
          y: y - 20,
          font: robotoFont,
          size: fontSize,
        });
      }

      y -= cellHeight;

      y -= 0; // Space between the first and second tables

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
          y: y - 20,
          font: robotoFont,
          size: smallFontSize,
        });

        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 28,
          font: robotoFont,
          size: smallFontSize,
        });
        // Draw the value
        page.drawText(cell.value, {
          x: cellX + 55,
          y: y - 20,
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
          y: y - 20,
          font: robotoFont,
          size: smallFontSize,
        });

        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 28,
          font: robotoFont,
          size: smallFontSize,
        });
        // Draw the value
        page.drawText(cell.value, {
          x: cellX + 55,
          y: y - 20,
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
          y: y - 20,
          font: robotoFont,
          size: smallFontSize,
        });

        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 28,
          font: robotoFont,
          size: smallFontSize,
        });
        // Draw the value
        page.drawText(cell.value, {
          x: cellX + 55,
          y: y - 20,
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
          y: y - 20,
          font: robotoFont,
          size: smallFontSize,
        });

        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 28,
          font: robotoFont,
          size: smallFontSize,
        });
        // Draw the value
        page.drawText(cell.value, {
          x: cellX + 55,
          y: y - 20,
          font: robotoFont,
          size: fontSize,
        });
      }
      y -= cellHeight;
      y -= 5; // Space between

      // Adjust y for the height of the new cells
    }
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

    // reference Table
    const referenceTable = [
      ['Type', 'Reference', 'Description'],
      ...(data.reference
        ? data.reference.map((part: any) => [
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
        ? data.partNumbers.map((part: any) => [
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
        ? data.partNumbers.map((part: any) => [
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
    }

    // Footer
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

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL, '_blank');
    URL.revokeObjectURL(fileURL);
    console.log('PDF успешно создан');
  };

  return (
    <div>
      <Button size="small" onClick={generatePdf}>
        TASK PRINT
      </Button>
    </div>
  );
};

export default PdfGenerator;
