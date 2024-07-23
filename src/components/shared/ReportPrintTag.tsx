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
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import robotoFont from '../../fonts/Roboto-Regular.ttf'; // Путь к вашему шрифту Roboto

interface ReportGeneratorProps {
  xmlTemplate: string;
  data: any[];
  isDisabled?: boolean;
  ids?: any;
}

const ReportPrintTag: React.FC<ReportGeneratorProps> = ({
  xmlTemplate,
  data,
  isDisabled,
  ids,
}) => {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();
  const {
    data: accesses,
    isLoading,
    refetch,
  } = useGetProjectPanelsQuery({ accessIds: ids });

  const generatePdfFile = async () => {
    setLoading(true);

    try {
      console.log('Начало генерации PDF');
      console.log('xmlTemplate:', xmlTemplate);

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

      const fontBytes = await fetch(robotoFont).then((res) =>
        res.arrayBuffer()
      );
      const font = await pdfDoc.embedFont(fontBytes);

      for (const product of accesses) {
        const page = pdfDoc.addPage([174, 285]);
        const { width, height } = page.getSize();

        page.drawText(
          product?.companyID?.companyName || product?.COMPANY_ID?.title,
          {
            x: 5,
            y: height - 15,
            font,
            size: 9,
            color: rgb(0, 0, 0),
          }
        );

        const barcodeImage = await pdfDoc.embedPng(
          generateBarcode(product.accessProjectNumber)
        );
        page.drawImage(barcodeImage, {
          x: 5,
          y: height - 30,
          width: 60,
          height: 12,
        });

        page.drawText(`L: ${product.accessProjectNumber}`, {
          x: 5,
          y: height - 45,
          font,
          size: 8,
          color: rgb(0, 0, 0),
        });

        page.drawText(
          `${
            product.restriction === 'standart'
              ? 'IDENTIFICATION TAG'
              : 'IDENTIFICATION TAG'
          }`,
          {
            x: 5,
            y: height - 60,
            font,
            size: 12,
            color: rgb(0, 0, 0),
            bold: true,
          }
        );

        page.drawText(
          `${t('AC TYPE')}: ${String(product?.acTypeID?.code).toUpperCase()}`,
          {
            x: 5,
            y: height - 75,
            font,
            size: 9,
            color: rgb(0, 0, 0),
            bold: true,
          }
        );

        page.drawText(
          `${t('AC REG. No')}: ${product?.projectID?.planeId.regNbr}`,
          {
            x: 5,
            y: height - 90,
            font,
            size: 9,
            color: rgb(0, 0, 0),
            bold: true,
          }
        );

        page.drawText(`${t('WO No')}: ${product?.projectID?.projectWO}`, {
          x: 5,
          y: height - 105,
          font,
          size: 9,
          color: rgb(0, 0, 0),
          bold: true,
        });

        page.drawText(
          `${t('TRACE No')}: ${product?.projectTaskIds?.map(
            (item: any) => item?.taskWO
          )}`,
          {
            x: 5,
            y: height - 120,
            font,
            size: 9,
            color: rgb(0, 0, 0),
            bold: true,
          }
        );

        page.drawText(`${t('ACCESS No')}: ${product?.accessNbr}`, {
          x: 5,
          y: height - 135,
          font,
          size: 9,
          color: rgb(0, 0, 0),
        });

        page.drawText(
          `${t('ACCESS DESC.')}: ${
            product?.accessDescription && product.accessDescription.length > 40
              ? product.accessDescription.substring(0, 40) + '...'
              : product?.accessDescription
          }`,
          {
            x: 5,
            y: height - 150,
            font,
            size: 9,
            color: rgb(0, 0, 0),
          }
        );

        page.drawText(
          `${t('AREA DESC.')}: ${
            product?.areaCodeID?.areaDescription &&
            product.areaCodeID.areaDescription.length > 40
              ? product.areaCodeID.areaDescription.substring(0, 40) + '...'
              : product?.areaCodeID?.areaDescription
          }`,
          {
            x: 5,
            y: height - 165,
            font,
            size: 9,
            color: rgb(0, 0, 0),
          }
        );

        page.drawText(
          `${t('SUB ZONE DESC.')}: ${
            product?.areaCodeID?.subZoneDescription &&
            product.areaCodeID.subZoneDescription.length > 40
              ? product.areaCodeID.subZoneDescription.substring(0, 40) + '...'
              : product?.areaCodeID?.subZoneDescription
          }`,
          {
            x: 5,
            y: height - 180,
            font,
            size: 9,
            color: rgb(0, 0, 0),
          }
        );

        page.drawText(
          `${t('ZONE No')}: ${product?.areaCodeID?.majoreZoneNbr}`,
          {
            x: 5,
            y: height - 195,
            font,
            size: 9,
            color: rgb(0, 0, 0),
          }
        );

        page.drawText(
          `${t('ZONE DESC.')}: ${
            product?.areaCodeID?.majoreZoneDescription &&
            product.areaCodeID.majoreZoneDescription.length > 40
              ? product.areaCodeID.majoreZoneDescription.substring(0, 40) +
                '...'
              : product?.areaCodeID?.majoreZoneDescription
          }`,
          {
            x: 5,
            y: height - 210,
            font,
            size: 9,
            color: rgb(0, 0, 0),
          }
        );

        page.drawRectangle({
          x: 5,
          y: height - 262,
          width: 165,
          height: 32,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        page.drawText(
          `${t('OPEN')}: ${String(product?.createUserID?.name).toUpperCase()}`,
          {
            x: 7,
            y: height - 240,
            font,
            size: 8,
            color: rgb(0, 0, 0),
            bold: true,
          }
        );

        page.drawText(
          `${t('DATE')}: ${
            product.createDate &&
            moment(product?.createDate).format('Do. MMM. YYYY')
          }`,
          {
            x: 7,
            y: height - 258,
            font,
            size: 8,
            color: rgb(0, 0, 0),
          }
        );

        page.drawText(
          `Printed by ${SING} ${new Date().toLocaleString('ru-RU')}`,
          {
            x: 5,
            y: 5,
            font,
            size: 6,
            color: rgb(0, 0, 0),
          }
        );
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
        {loading ? 'Processing' : ` ${t('PRINT TAG')}`}
      </Button>
    </div>
  );
};

export default ReportPrintTag;
