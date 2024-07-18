//@ts-nocheck
import React, { useState } from 'react';
import xml2js from 'xml2js';
import JsBarcode from 'jsbarcode';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import moment from 'moment';
import { SING } from '@/utils/api/http';
import { useGetStorePartsQuery } from '@/features/storeAdministration/PartsApi';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import robotoFont from '../../fonts/Roboto-Regular.ttf'; // Путь к вашему шрифту Roboto

interface ReportGeneratorProps {
  xmlTemplate: string;
  data?: any[];
  isDisabled?: boolean;
  ids?: any;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  xmlTemplate,
  data = [],
  isDisabled,
  ids,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const { data: parts, isLoading: partsLoading } = useGetStorePartsQuery(
    ids ? { ids: ids } : {},
    {
      skip: !ids || data?.length > 0,
    }
  );

  const { t } = useTranslation();

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
              (_, index, prop) => (data[index] && data[index][prop]) || ''
            );
          }
          return value;
        }
      );

      const usedData = data.length > 0 ? data : parts;

      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);

      // Загрузка шрифта Roboto
      const fontBytes = await fetch(robotoFont).then((res) =>
        res.arrayBuffer()
      );
      const font = await pdfDoc.embedFont(fontBytes);

      for (const product of usedData) {
        const page = pdfDoc.addPage([174, 280]);
        const { width, height } = page.getSize();

        const barcodeImage = await pdfDoc.embedPng(
          generateBarcode(product?.LOCAL_ID || product?.locationID?.LOCAL_ID)
        );
        page.drawImage(barcodeImage, {
          x: 5,
          y: height - 20,
          width: 60,
          height: 15,
        });

        page.drawText(
          product.COMPANY_ID?.title || product?.storeItemID?.COMPANY_ID?.title,
          {
            x: 70,
            y: height - 15,
            size: 14,
            font,
            color: rgb(0, 0, 0),
          }
        );

        page.drawText(
          `L: ${
            product.LOCAL_ID || product?.storeItemID?.locationID?.LOCAL_ID
          }`,
          {
            x: 5,
            y: height - 30,
            size: 8,
            font,
            color: rgb(0, 0, 0),
          }
        );

        page.drawText(
          `${
            product?.locationID?.restrictionID === 'standart' ||
            product?.storeItemID?.locationID?.restrictionID === 'standart' ||
            product?.storeItemID?.locationID?.locationType === 'reservation'
              ? `${t('SERVICABLE TAG')}`
              : `${t('UNSERVICEABLE TAG')}`
          }`,
          {
            x: 5,
            y: height - 45,
            size: 13,
            font,
            color: rgb(0, 0, 0),
          }
        );

        page.drawText(
          `${t('PART No')}: ${
            product?.PART_NUMBER || product?.storeItemID?.PART_NUMBER
          }`,
          {
            x: 5,
            y: height - 60,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          }
        );

        page.drawText(
          `${t('BATCH No')}: ${
            product?.SUPPLIER_BATCH_NUMBER ||
            product?.storeItemID?.SUPPLIER_BATCH_NUMBER ||
            'N/A'
          }`,
          {
            x: 5,
            y: height - 75,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          }
        );

        page.drawText(
          `${t('MC/QTY')}: ${product?.GROUP || product?.storeItemID?.GROUP} / ${
            product?.QUANTITY || product?.bookedQty
          }/${
            product.UNIT_OF_MEASURE || product?.storeItemID?.UNIT_OF_MEASURE
          }`,
          {
            x: 5,
            y: height - 90,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          }
        );

        page.drawText(
          `${t('CONDITION')}: ${
            product?.CONDITION || product?.storeItemID?.CONDITION || 'N/A'
          }`,
          {
            x: 5,
            y: height - 105,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          }
        );

        page.drawText(
          `${t('EXP.DATE')}: ${
            product.PRODUCT_EXPIRATION_DATE ||
            (product?.storeItemID?.PRODUCT_EXPIRATION_DATE &&
              moment(
                product.PRODUCT_EXPIRATION_DATE ||
                  product?.storeItemID?.PRODUCT_EXPIRATION_DATE
              ).format('Do. MMM. YYYY')) ||
            'N/A'
          }`,
          {
            x: 5,
            y: height - 120,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          }
        );

        page.drawText(
          `${t('DESCRIPTION')}: ${String(
            product?.NAME_OF_MATERIAL || product?.storeItemID?.NAME_OF_MATERIAL
          ).toUpperCase()}`,
          {
            x: 5,
            y: height - 135,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          }
        );

        page.drawText(
          `${t('CERT No')}: ${
            product?.APPROVED_CERT ||
            product?.storeItemID?.APPROVED_CERT ||
            'N/A'
          }`,
          {
            x: 5,
            y: height - 150,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          }
        );

        page.drawText(
          `${t('ORDER No')}: ${
            product?.ORDER_NUMBER || product?.storeItemID?.ORDER_NUMBER || 'N/A'
          }`,
          {
            x: 5,
            y: height - 165,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          }
        );

        page.drawText(
          `${t('REC.DATE')}: ${
            product.RECEIVED_DATE || product?.storeItemID?.RECEIVED_DATE
              ? moment(
                  product.RECEIVED_DATE || product?.storeItemID?.RECEIVED_DATE
                )
                  .locale('en')
                  .format('DD.MM.YYYY')
              : 'N/A'
          }`,
          {
            x: 5,
            y: height - 180,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          }
        );

        page.drawRectangle({
          x: 5,
          y: height - 248,
          width: 165,
          height: 30,
          borderWidth: 1,
          borderColor: rgb(0, 0, 0),
        });

        page.drawText(`${t('MATERIAL INCOMING INSPECTION')}`, {
          x: 7,
          y: height - 230,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });

        page.drawText(SING, {
          x: 7,
          y: height - 245,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });

        page.drawText(
          `${String(
            product?.storeID?.storeShortName ||
              product?.storeItemID?.storeID?.storeShortName
          ).toUpperCase()}/${
            product?.locationID?.locationName ||
            product?.storeItemID?.locationID?.locationName ||
            'N/A'
          }`,
          {
            x: 5,
            y: height - 265,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          }
        );

        page.drawText(
          `${t('PRINT BY')} ${SING} ${new Date().toLocaleString('ru-RU')}`,
          {
            x: 5,
            y: height - 277,
            size: 6,
            font,
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

      URL.revokeObjectURL(fileURL);
      console.log('PDF успешно создан');
    } catch (error) {
      console.error('Ошибка при генерации PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        icon={<PrinterOutlined />}
        size="small"
        onClick={generatePdfFile}
        disabled={loading || isDisabled}
      >
        {loading ? 'Processing' : ` ${t('PRINT LABEL')}`}
      </Button>
    </div>
  );
};

export default ReportGenerator;
