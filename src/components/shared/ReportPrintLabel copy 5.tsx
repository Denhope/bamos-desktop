//@ts-nocheck
import React, { useState, useCallback, useEffect } from 'react';
import xml2js from 'xml2js';
import JsBarcode from 'jsbarcode';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import moment from 'moment';
import { SING } from '@/utils/api/http';
import { useLazyGetStorePartsQuery } from '@/features/storeAdministration/PartsApi';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import robotoFont from '../../fonts/Roboto-Regular.ttf';

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
  const [trigger] = useLazyGetStorePartsQuery();
  const { t } = useTranslation();
  const [fontCache, setFontCache] = useState<ArrayBuffer | null>(null);

  // Кэширование шрифта при монтировании компонента
  useEffect(() => {
    let isMounted = true;

    const loadFont = async () => {
      try {
        const response = await fetch(robotoFont);
        const fontBuffer = await response.arrayBuffer();
        if (isMounted) {
          setFontCache(fontBuffer);
        }
      } catch (error) {
        console.error('Ошибка загрузки шрифта:', error);
      }
    };

    loadFont();

    return () => {
      isMounted = false;
    };
  }, []);

  const generateBarcode = useCallback((data: any) => {
    const canvas = document.createElement('canvas');
    try {
      JsBarcode(canvas, data, {
        format: 'CODE128',
        displayValue: false,
        width: 1,
        height: 15,
        margin: 0,
      });
      return canvas.toDataURL();
    } catch (error) {
      console.error('Ошибка генерации штрих-кода:', error);
      return '';
    } finally {
      // Очистка canvas
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const formatDate = useCallback((date?: string) => {
    return date ? moment(date).format('DD.MM.YYYY') : 'N/A';
  }, []);

  const drawText = useCallback(
    (page: any, text: string, y: number, options = {}) => {
      // Если текст описания слишком длинный, разбиваем его на две строки
      if (text.startsWith(`${t('DESCRIPTION')}: `)) {
        const descriptionPrefix = `${t('DESCRIPTION')}: `;
        const description = text.substring(descriptionPrefix.length);

        const maxLength = 16;

        if (description.length > maxLength) {
          // Первая строка описания
          page.drawText(
            `${descriptionPrefix}${description.substring(0, maxLength)}`,
            {
              x: 5,
              y,
              size: 9,
              color: rgb(0, 0, 0),
              ...options,
            }
          );

          // Вторая строка описания
          page.drawText(description.substring(maxLength), {
            x: 5,
            y: y - 10, // Уменьшаем отступ между строками описания
            size: 9,
            color: rgb(0, 0, 0),
            ...options,
          });

          return true;
        }
      }

      // Обычный текст
      page.drawText(text, {
        x: 5,
        y,
        size: 9,
        color: rgb(0, 0, 0),
        ...options,
      });

      return false;
    },
    [t]
  );

  const generatePdfFile = async () => {
    if (!fontCache) {
      console.error('Шрифт не загружен');
      return;
    }

    setLoading(true);
    let pdfDoc = null;
    let fileURL = null;

    try {
      console.log('Начало генерации PDF');
      const jsonTemplate = await xml2js.parseStringPromise(xmlTemplate);

      const filledTemplate = JSON.parse(
        JSON.stringify(jsonTemplate),
        (key, value) => {
          if (typeof value === 'string') {
            return value.replace(
              /\${data\[(\d+)\]\.(\w+)}/g,
              (_, index, prop) => data[index]?.[prop] || ''
            );
          }
          return value;
        }
      );

      const result = await trigger({ ids });
      const usedData = data.length > 0 ? data : result.data;

      pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      const font = await pdfDoc.embedFont(fontCache);

      for (const product of usedData) {
        const page = pdfDoc.addPage([174, 280]);
        const { height } = page.getSize();

        // Генерация и добавление штрих-кода
        const barcodeImage = await pdfDoc.embedPng(
          generateBarcode(product?.LOCAL_ID || product?.locationID?.LOCAL_ID)
        );
        page.drawImage(barcodeImage, {
          x: 5,
          y: height - 20,
          width: 60,
          height: 15,
        });

        // Заголовок компании
        drawText(
          page,
          product?.COMPANY_ID?.title || product?.storeItemID?.COMPANY_ID?.title,
          height - 15,
          { size: 14, x: 70 }
        );

        // Локальный ID
        drawText(
          page,
          `L: ${
            product.LOCAL_ID || product?.storeItemID?.locationID?.LOCAL_ID
          }`,
          height - 30,
          { size: 8 }
        );

        // Определение типа тега
        const tagType =
          product?.locationID?.description === 'LOCATION_FOR_PARTS_TO_SCRAP'
            ? t('SCRAPED TAG')
            : product?.locationID?.restrictionID === 'standart' ||
              product?.storeItemID?.locationID?.restrictionID === 'standart' ||
              product?.storeItemID?.locationID?.locationType === 'reservation'
            ? t('SERVICABLE TAG')
            : t('UNSERVICEABLE TAG');

        drawText(page, tagType, height - 45, { size: 13 });

        // Детали продукта
        const details = [
          [
            `${t('PART No')}: ${
              product?.PART_NUMBER || product?.storeItemID?.PART_NUMBER
            }`,
            60,
          ],
          [
            `${t('BATCH No')}: ${
              product?.SUPPLIER_BATCH_NUMBER ||
              product?.storeItemID?.SUPPLIER_BATCH_NUMBER ||
              'N/A'
            }`,
            75,
          ],
          [
            `${t('MC/QTY')}: ${
              product?.GROUP || product?.storeItemID?.GROUP
            } / ${product?.QUANTITY || product?.bookedQty}/${
              product.UNIT_OF_MEASURE || product?.storeItemID?.UNIT_OF_MEASURE
            }`,
            90,
          ],
          [
            `${t('CONDITION')}: ${
              product?.CONDITION || product?.storeItemID?.CONDITION || 'N/A'
            }`,
            105,
          ],
          [
            `${t('EXP.DATE')}: ${formatDate(
              product.PRODUCT_EXPIRATION_DATE ||
                product?.storeItemID?.PRODUCT_EXPIRATION_DATE
            )}`,
            120,
          ],
          [
            `${t('DESCRIPTION')}: ${String(
              product?.NAME_OF_MATERIAL ||
                product?.storeItemID?.NAME_OF_MATERIAL
            ).toUpperCase()}`,
            135,
          ],
          [
            `${t('CERT No')}: ${
              product?.APPROVED_CERT ||
              product?.storeItemID?.APPROVED_CERT ||
              'N/A'
            }`,
            150,
          ], // Уменьшаем отступ
          [
            `${t('ORDER No')}: ${
              product?.ORDER_NUMBER ||
              product?.storeItemID?.ORDER_NUMBER ||
              'N/A'
            }`,
            165,
          ], // Уменьшаем отступ
          [
            `${t('REC.DATE')}: ${formatDate(
              product.RECEIVED_DATE || product?.storeItemID?.RECEIVED_DATE
            )}`,
            180,
          ], // Уменьшаем отступ
        ];

        let additionalOffset = 0;

        details.forEach(([text, y]) => {
          const isDescriptionSplit = drawText(
            page,
            text,
            height - y - additionalOffset
          );
          if (isDescriptionSplit) {
            additionalOffset += 10; // Уменьшаем дополнительный отступ после описания
          }
        });

        // Обновляем позиции остальных элементов
        page.drawRectangle({
          x: 5,
          y: height - (235 + additionalOffset), // Уменьшаем базовый отступ
          width: 165,
          height: 30,
          borderWidth: 1,
          borderColor: rgb(0, 0, 0),
        });

        drawText(
          page,
          t('MATERIAL INCOMING INSPECTION'),
          height - (217 + additionalOffset), // Корректируем отступ
          {
            x: 7,
          }
        );
        drawText(page, SING, height - (232 + additionalOffset), { x: 7 }); // Корректируем отступ

        drawText(
          page,
          `${String(
            product?.storeID?.storeShortName ||
              product?.storeItemID?.storeID?.storeShortName
          ).toUpperCase()}/${
            product?.locationID?.locationName ||
            product?.storeItemID?.locationID?.locationName ||
            'N/A'
          }`,
          height - (252 + additionalOffset) // Корректируем отступ
        );

        drawText(
          page,
          `${t('PRINT BY')} ${SING} ${new Date().toLocaleString('ru-RU')}`,
          height - (264 + additionalOffset), // Корректируем отступ
          { size: 6 }
        );
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      fileURL = URL.createObjectURL(blob);

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

      console.log('PDF успешно создан');
    } catch (error) {
      console.error('Ошибка при генерации PDF:', error);
    } finally {
      if (fileURL) {
        URL.revokeObjectURL(fileURL);
      }
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        icon={<PrinterOutlined />}
        size="small"
        onClick={generatePdfFile}
        disabled={loading || isDisabled || !fontCache}
      >
        {loading ? 'Processing' : ` ${t('PRINT LABEL')}`}
      </Button>
    </div>
  );
};

export default ReportGenerator;
