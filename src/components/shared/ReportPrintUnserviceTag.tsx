//@ts-nocheck
import React, { useState } from 'react';
import xml2js from 'xml2js';
import JsBarcode from 'jsbarcode';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { SING, USER_ID } from '@/utils/api/http';
import moment from 'moment';
import { useGetProjectPanelsQuery } from '@/features/projectItemWO/projectItemWOApi';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import robotoBoldFont from '../../fonts/Roboto-Bold.ttf';
import robotoFontt from '../../fonts/Roboto-Regular.ttf'; // Путь к вашему шрифту Roboto
import logoImage from '../../assets/img/407Technics_logo.png'; // Путь к вашему логотипу
interface ReportGeneratorProps {
  xmlTemplate: string;
  task?: any;
  data: any[];
  currentAction?: any;
  isDisabled?: boolean;
  ids?: any;
}

const ReportPrintUnserviceTag: React.FC<ReportGeneratorProps> = ({
  xmlTemplate,
  data,
  isDisabled,
  ids,
  currentAction,
  task,
}) => {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();
  console.log(task);
  const generatePdfFile = async () => {
    setLoading(true);

    try {
      console.log('Начало генерации PDF');

      const jsonTemplate = await xml2js.parseStringPromise(xmlTemplate);

      const filledTemplate = JSON.parse(
        JSON.stringify(jsonTemplate),
        (key, value) => {
          if (typeof value === 'string') {
            return value.replace(
              /\${data\[(\d+)\]\.(\w+)}/g,
              (_, index, prop) => data[index][prop]
            );
          }
          return value;
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
      const generateBarcode = (data: any) => {
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, data, {
          format: 'CODE128',
          displayValue: false,
          width: 1,
          height: 15,
          margin: 0,
        });
        return canvas.toDataURL();
      };

      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);

      // Загрузка шрифтов и изображений

      const fontBytes = await fetch(robotoFontt).then((res) =>
        res.arrayBuffer()
      );
      const robotoFont = await pdfDoc.embedFont(fontBytes);

      const fontBytesB = await fetch(robotoBoldFont).then((res) =>
        res.arrayBuffer()
      );

      const logoBytes = await fetch(logoImage).then((res) => res.arrayBuffer());
      const logoImageEmbed = await pdfDoc.embedPng(logoBytes);
      const robotoFontB = await pdfDoc.embedFont(fontBytesB);

      // const font = await pdfDoc.embedFont(fontBytes);

      const addPage = () => {};

      const page = pdfDoc.addPage([595.28, 841.89]);

      const { width, height } = page.getSize();
      const cellWidths1 = [70, 430, 20];
      const cellHeights1 = [225, 45, 225]; // Пример высот для ячеек
      let y = height - 30;
      const cellHeight = 30;
      const cellHeightLage = 45;
      const cellHeightSmall = 20;
      const fontSize = 9;
      const fontSizeM = 7;
      const smallFontSize = 5;
      const lageFontSize = 13;
      const extraLageFontSize = 16;
      const cellWidth = 100;
      const cellData1 = [
        {
          label: '',
          label1: '',
          label2: '',
          value: '',
        },
        {
          label:
            'Revision No: 00; Eff. Date: 20.02.2024; Form 010 / Изменение:00; Дата: 20.02.2024; Форма 010',
          label1: 'UNSERVICEABLE TAG',
          label2: 'ЯРЛЫК «НЕИСПРАВЕН»',
          value: '',
        },
        {
          label: '',
          label1: '',
          label2: '',
          value: '',
        },
      ];
      for (let i = 0; i < cellData1.length; i++) {
        const cell = cellData1[i];
        const cellX =
          50 + cellWidths1.slice(0, i).reduce((sum, width) => sum + width, 0);
        const cellWidth1 = cellWidths1[i];
        const cellHeight1 = cellHeights1[i];

        page.drawRectangle({
          x: cellX,
          y: y - cellHeight1,
          width: cellWidth1,
          height: cellHeight1,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        page.drawText(cell.label, {
          x: cellX + 210,
          y: y - 8,
          font: robotoFont,
          size: smallFontSize,
        });
        page.drawText(cell.label1, {
          x: cellX + 130,
          y: y - 22,
          font: robotoFontB,
          size: lageFontSize,
        });
        page.drawText(cell.label2, {
          x: cellX + 140,
          y: y - 34,
          font: robotoFont,
          size: fontSize,
        });
      }
      y -= cellHeightLage;
      const cellWidths2 = [230, 200];
      const taskCardNumberText =
        task?.taskNumber !== undefined ? String(task.taskNumber) : 'N/A';

      const truncatedTaskNumberText = truncateText(
        taskCardNumberText,
        117,
        robotoFont,
        12
      );
      const woName =
        task?.projectID.WOReferenceID !== undefined
          ? String(task?.projectID.WOReferenceID.WOName)
          : 'N/A';
      const companyName =
        task?.projectID.customerID !== undefined
          ? String(task?.projectID.customerID.companyName)
          : 'N/A';
      const regNbr =
        task?.projectID.WOReferenceID.planeId !== undefined
          ? String(task?.projectID.WOReferenceID.planeId.regNbr)
          : 'N/A';
      const acType =
        task?.projectID.WOReferenceID.planeId !== undefined
          ? String(task?.projectID.WOReferenceID.planeId.acTypeId[0].code)
          : 'N/A';
      const description =
        currentAction?.componentChange.removeAction.partNumberID !== undefined
          ? String(
              currentAction?.componentChange.removeAction.partNumberID
                .DESCRIPTION
            )
          : 'N/A';
      const partNumber =
        currentAction?.componentChange.removeAction.partNumberID !== undefined
          ? String(
              currentAction?.componentChange.removeAction.partNumberID
                .PART_NUMBER
            )
          : 'N/A';
      const serialNumberOf =
        currentAction?.componentChange.removeAction.serialNumberOf !== undefined
          ? String(currentAction?.componentChange.removeAction.serialNumberOf)
          : 'N/A';
      const position =
        currentAction?.componentChange.removeAction.position !== undefined
          ? String(currentAction?.componentChange.removeAction.position)
          : 'N/A';
      const reasonToRemoval =
        currentAction?.componentChange.removeAction.reasonToRemoval !==
        undefined
          ? String(currentAction?.componentChange.removeAction.reasonToRemoval)
          : 'N/A';

      const removalDate =
        currentAction?.componentChange.removeAction.removalDate !== undefined
          ? String(
              new Date(
                currentAction?.componentChange.removeAction.removalDate
              ).toLocaleDateString('ru-RU')
            )
          : 'N/A';
      const organizationAuthorization =
        currentAction?.componentChange.removeAction.userDurations !== undefined
          ? `${
              currentAction?.componentChange.removeAction.userDurations[0]
                .userID.organizationAuthorization
            } (${currentAction?.componentChange.removeAction.userDurations[0].userID.firstNameEnglish?.toUpperCase()}  ${currentAction?.componentChange.removeAction.userDurations[0].userID.lastNameEnglish?.toUpperCase()})` ||
            String(
              currentAction?.componentChange.removeAction.userDurations[0]
                .userID.singNumber
            )
          : 'N/A';
      const truncatedWOName = truncateText(woName, 167, robotoFont, 12);
      const truncatedRegNbr = truncateText(regNbr, 117, robotoFont, 12);
      const truncatedAcType = truncateText(acType, 117, robotoFont, 12);
      const truncatedCompany = truncateText(companyName, 117, robotoFont, 12);
      const truncatedPartNumber = truncateText(partNumber, 167, robotoFont, 12);
      const truncatedPosition = truncateText(position, 167, robotoFont, 12);
      const truncatedReasonToRemoval = truncateText(
        reasonToRemoval,
        187,
        robotoFont,
        12
      );
      const truncatedSerialNumberOf = truncateText(
        serialNumberOf,
        117,
        robotoFont,
        12
      );
      const truncatedDescription = truncateText(
        description,
        317,
        robotoFont,
        12
      );
      const cellData2 = [
        {
          label: 'REF. TO CORRESPONDING DOC/ ССЫЛКА НА ДОКУМЕНТ',
          label1: '(NRC/TLB/CLB/TC etc.)',
          label2: '',
          value: taskCardNumberText,
        },
        {
          label: 'WO/WPS REF/ССЫЛКА НА ПАКЕТ РАБОЧЕЙ ',
          label1: 'ДОКУМЕНТАЦИИ',
          label2: '',
          value: truncatedWOName,
        },
      ];

      for (let i = 0; i < cellData2.length; i++) {
        const cell = cellData2[i];
        const cellX =
          120 + cellWidths2.slice(0, i).reduce((sum, width) => sum + width, 0);
        const cellWidth2 = cellWidths2[i];

        page.drawRectangle({
          x: cellX,
          y: y - cellHeight,
          width: cellWidth2,
          height: cellHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        page.drawText(cell.label, {
          x: cellX + 5,
          y: y - 8,
          font: robotoFont,
          size: fontSizeM,
        });
        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 16,
          font: robotoFont,
          size: fontSizeM,
        });
        page.drawText(cell.value, {
          x: cellX + 10,
          y: y - 27,
          font: robotoFontB,
          size: lageFontSize,
        });
      }
      y -= cellHeight;
      const cellWidths3 = [130, 100, 200];
      const cellData3 = [
        {
          label: 'CUSTOMER/ЗАКАЗЧИК',
          label1: '',
          label2: '',
          value: truncatedCompany,
        },
        {
          label: 'AC TYPE/ТИП ВС',
          label1: '',
          label2: '',
          value: truncatedAcType,
        },
        {
          label: 'AC REG/ РЕГИСТРАЦИОННЫЙ НОМЕР ВС',
          label1: '',
          label2: '',
          value: truncatedRegNbr,
        },
      ];

      for (let i = 0; i < cellData3.length; i++) {
        const cell = cellData3[i];
        const cellX =
          120 + cellWidths3.slice(0, i).reduce((sum, width) => sum + width, 0);
        const cellWidth3 = cellWidths3[i];

        page.drawRectangle({
          x: cellX,
          y: y - cellHeight,
          width: cellWidth3,
          height: cellHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        page.drawText(cell.label, {
          x: cellX + 5,
          y: y - 8,
          font: robotoFont,
          size: fontSizeM,
        });
        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 16,
          font: robotoFont,
          size: fontSizeM,
        });
        page.drawText(cell.label2, {
          x: cellX + 50,
          y: y - 34,
          font: robotoFont,
          size: fontSizeM,
        });
        page.drawText(cell.value, {
          x: cellX + 10,
          y: y - 27,
          font: robotoFontB,
          size: lageFontSize,
        });
      }
      y -= cellHeight;
      const cellWidths4 = [430];

      const cellData4 = [
        {
          label: 'DESCRIPTION/ОПИСАНИЕ',
          label1: '',
          label2: '',
          value: truncatedDescription,
        },
      ];

      for (let i = 0; i < cellData4.length; i++) {
        const cell = cellData4[i];
        const cellX =
          120 + cellWidths4.slice(0, i).reduce((sum, width) => sum + width, 0);
        const cellWidth4 = cellWidths4[i];

        page.drawRectangle({
          x: cellX,
          y: y - cellHeight,
          width: cellWidth4,
          height: cellHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
        page.drawText(cell.value, {
          x: cellX + 10,
          y: y - 27,
          font: robotoFontB,
          size: lageFontSize,
        });

        page.drawText(cell.label, {
          x: cellX + 5,
          y: y - 8,
          font: robotoFont,
          size: fontSizeM,
        });
        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 16,
          font: robotoFont,
          size: fontSizeM,
        });
        page.drawText(cell.label2, {
          x: cellX + 50,
          y: y - 34,
          font: robotoFont,
          size: fontSizeM,
        });
      }

      y -= cellHeight;
      const cellWidths5 = [230, 200];
      const cellData5 = [
        {
          label: 'PART №/ЧЕРТЕЖНЫЙ НОМЕР ',
          label1: '',
          label2: '',
          value: truncatedPartNumber,
        },
        {
          label: 'SERIAL №/СЕРИЙНЫЙ №',
          label1: '',
          label2: '',
          value: truncatedSerialNumberOf,
        },
      ];

      for (let i = 0; i < cellData5.length; i++) {
        const cell = cellData5[i];
        const cellX =
          120 + cellWidths5.slice(0, i).reduce((sum, width) => sum + width, 0);
        const cellWidth5 = cellWidths5[i];

        page.drawRectangle({
          x: cellX,
          y: y - cellHeight,
          width: cellWidth5,
          height: cellHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
        page.drawText(cell.value, {
          x: cellX + 10,
          y: y - 27,
          font: robotoFontB,
          size: lageFontSize,
        });
        page.drawText(cell.label, {
          x: cellX + 5,
          y: y - 8,
          font: robotoFont,
          size: fontSizeM,
        });
        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 16,
          font: robotoFont,
          size: fontSizeM,
        });
        page.drawText(cell.label2, {
          x: cellX + 50,
          y: y - 34,
          font: robotoFont,
          size: fontSizeM,
        });
      }
      y -= cellHeight;
      const cellWidths6 = [200, 230];
      const cellData6 = [
        {
          label: 'LOCATION ON AIRCRAFT/РАСПОЛОЖЕНИЕ НА ВС',
          label1: '',
          label2: '',
          value: truncatedPosition,
        },
        {
          label: 'REASON FOR REMOVAL/ПРИЧИНА СНЯТИЯ',
          label1: '',
          label2: '',
          value: truncatedReasonToRemoval,
        },
      ];

      for (let i = 0; i < cellData6.length; i++) {
        const cell = cellData6[i];
        const cellX =
          120 + cellWidths6.slice(0, i).reduce((sum, width) => sum + width, 0);
        const cellWidth6 = cellWidths6[i];

        page.drawRectangle({
          x: cellX,
          y: y - cellHeight,
          width: cellWidth6,
          height: cellHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
        page.drawText(cell.value, {
          x: cellX + 10,
          y: y - 27,
          font: robotoFontB,
          size: lageFontSize,
        });
        page.drawText(cell.label, {
          x: cellX + 5,
          y: y - 8,
          font: robotoFont,
          size: fontSizeM,
        });
        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 16,
          font: robotoFont,
          size: fontSizeM,
        });
        page.drawText(cell.label2, {
          x: cellX + 50,
          y: y - 34,
          font: robotoFont,
          size: fontSizeM,
        });
      }
      y -= cellHeight;
      const cellWidths7 = [330, 100];
      const cellData7 = [
        {
          label: 'STAFF STAMP OR STAMP NUMBER AND SIGNATURE',
          label1: 'ШТАМП ПЕРСОНАЛА ЛИБО НОМЕР ШТАМПА И ПОДПИСЬ',
          label2: '',
          value: organizationAuthorization,
        },
        {
          label: 'DATE',
          label1: 'ДАТА',
          label2: '',
          value: removalDate,
        },
      ];

      let x = 50;
      page.drawImage(logoImageEmbed, {
        x: x + 45, // Adjusted x position for logo
        y: y + 5, // Adjusted y position for logo
        width: 170,
        height: 35,
        rotate: degrees(90), // Rotate the image by 90 degrees
      });
      for (let i = 0; i < cellData7.length; i++) {
        const cell = cellData7[i];
        const cellX =
          120 + cellWidths7.slice(0, i).reduce((sum, width) => sum + width, 0);
        const cellWidth7 = cellWidths7[i];
        page.drawText(cell.value, {
          x: cellX + 10,
          y: y - 27,
          font: robotoFontB,
          size: lageFontSize,
        });
        page.drawRectangle({
          x: cellX,
          y: y - cellHeight,
          width: cellWidth7,
          height: cellHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        page.drawText(cell.label, {
          x: cellX + 5,
          y: y - 8,
          font: robotoFont,
          size: fontSizeM,
        });
        page.drawText(cell.label1, {
          x: cellX + 5,
          y: y - 16,
          font: robotoFont,
          size: fontSizeM,
        });
        page.drawText(cell.label2, {
          x: cellX + 50,
          y: y - 34,
          font: robotoFont,
          size: fontSizeM,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(blob);
      const newWindow = window.open(fileURL, '_blank');

      if (
        !newWindow ||
        newWindow.closed ||
        typeof newWindow.closed === 'undefined'
      ) {
        alert('Заблокировано открытие файла. Пожалуйста, сохраните файл.');
      } else {
        newWindow.focus();
      }

      window.URL.revokeObjectURL(fileURL);
      setPdfBlob(blob);
    } catch (error) {
      console.error('Ошибка при генерации PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        size="small"
        icon={<PrinterOutlined />}
        onClick={generatePdfFile}
        disabled={loading || isDisabled}
      >
        {loading ? 'Processing' : ` ${t('PRINT UNSERVICEABLE TAG')}`}
      </Button>
    </div>
  );
};

export default ReportPrintUnserviceTag;
