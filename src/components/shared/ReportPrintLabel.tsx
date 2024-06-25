//@ts-nocheck
import React, { useState } from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import xml2js from 'xml2js';
import JsBarcode from 'jsbarcode';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

import moment from 'moment';
import { SING } from '@/utils/api/http';
import { useGetStorePartsQuery } from '@/features/storeAdministration/PartsApi';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface ReportGeneratorProps {
  xmlTemplate: string; // XML-шаблон для генерации PDF
  data?: any[]; // Массив данных для заполнения шаблона, по умолчанию пустой массив
  isDisabled?: boolean;
  ids?: any; // Перечень ID для получения данных о частях, если `data` не передано
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  xmlTemplate,
  data = [], // По умолчанию, data – пустой массив
  isDisabled,
  ids,
}) => {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Получение данных о частях
  const { data: parts, isLoading: partsLoading } = useGetStorePartsQuery(
    ids ? { ids: ids } : {}, // Выполнение запроса только если переданы ID
    {
      skip: !ids || data.length > 0, // Пропуск запроса, если нет ID или если переданы данные `data`
    }
  );

  const { t } = useTranslation();

  // Функция для генерации штрихкода из строки данных
  const generateBarcode = (data: any) => {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, data, {
      format: 'CODE128', // Формат штрихкода
      displayValue: false, // Показывать значения рядом с штрихкодом
      width: 1, // Ширина линий штрихкода
      height: 15, // Высота штрихкода
      margin: 0, // Отступы
    });
    return canvas.toDataURL(); // Возвращает URL изображения штрихкода
  };

  // Генерация PDF
  const generatePdfFile = async () => {
    setLoading(true);

    try {
      console.log('Начало генерации PDF');
      console.log('xmlTemplate:', xmlTemplate);

      // Преобразование XML в JSON
      console.log('Преобразование XML в JSON');
      const jsonTemplate = await xml2js.parseStringPromise(xmlTemplate);

      // Заменяем ${data[i].prop} на фактические данные
      console.log('Вставка данных в шаблон');
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

      // Создание PDF
      console.log('Создание PDF');
      const docDefinition = {
        pageMargins: [5, 5, 5, 5], // Установка отступов: верх, право, низ, лево
        defaultStyle: {
          fontSize: 10, // Установка размера шрифта 10 для всего документа
        },
        pageSize: {
          width: 174,
          height: 280,
          unit: 'mm', // Установка единиц измерения в миллиметрах
        },
        content:
          usedData &&
          usedData.map((product: any, index: number) => ({
            pageBreak: index < usedData.length - 1 ? 'after' : '',
            columns: [
              {
                stack: [
                  [
                    {
                      columns: [
                        {
                          image: generateBarcode(
                            product.LOCAL_ID || product?.locationID?.LOCAL_ID
                          ),
                          width: 60,
                          height: 15,
                          alignment: 'left',
                          margin: [0, 0, 0, 1],
                        },
                        {
                          text:
                            product.COMPANY_ID?.title ||
                            product?.storeItemID?.COMPANY_ID?.title,
                          fontSize: 15,
                          bold: true,
                          alignment: 'right',
                          width: '62%',
                        },
                      ],
                    },
                    {
                      text: `L: ${
                        product.LOCAL_ID ||
                        product?.storeItemID?.locationID?.LOCAL_ID
                      }`,
                      fontSize: 8,
                      alignment: 'left',
                      margin: [0, 0, 0, 5],
                    },
                  ],
                  {
                    text: `${
                      product?.locationID?.restrictionID === 'standart' ||
                      product?.storeItemID?.locationID?.restrictionID ===
                        'standart'
                        ? `${t('SERVICABLE TAG')}`
                        : `${t('UNSERVICEABLE TAG')}`
                    }`,
                    fontSize: 13,
                    bold: true,
                    margin: [0, 0, 0, 5],
                  },
                  {
                    text: `${t('PART No')}: ${
                      product?.PART_NUMBER || product?.storeItemID?.PART_NUMBER
                    }`,
                    margin: [0, 0, 0, 2],
                  },
                  {
                    text: `${t('BATCH No')}: ${
                      product?.SUPPLIER_BATCH_NUMBER ||
                      product?.storeItemID?.SUPPLIER_BATCH_NUMBER ||
                      'N/A'
                    }`,
                    margin: [0, 0, 0, 2],
                  },
                  {
                    text: `${t('MC/QTY')}: ${
                      product?.GROUP || product?.storeItemID?.GROUP
                    } / ${product?.QUANTITY || product?.bookedQty}/${
                      product.UNIT_OF_MEASURE ||
                      product?.storeItemID?.UNIT_OF_MEASURE
                    }`,
                    margin: [0, 0, 0, 2],
                  },
                  {
                    text: `${t('CONDITION')}: ${
                      product?.CONDITION ||
                      product?.storeItemID?.CONDITION ||
                      'N/A'
                    } `,
                    margin: [0, 0, 0, 2],
                  },
                  {
                    text: `${t('EXP.DATE')}: ${
                      product.PRODUCT_EXPIRATION_DATE ||
                      (product?.storeItemID?.PRODUCT_EXPIRATION_DATE &&
                        moment(
                          product.PRODUCT_EXPIRATION_DATE ||
                            product?.storeItemID?.PRODUCT_EXPIRATION_DATE
                        ).format('Do. MMM. YYYY')) ||
                      'N/A'
                    }`,
                    margin: [0, 0, 0, 2],
                  },
                  {
                    text: `${t('DESCRIPTION')}: ${String(
                      product?.NAME_OF_MATERIAL ||
                        product?.storeItemID?.NAME_OF_MATERIAL
                    ).toUpperCase()}`,
                    margin: [0, 0, 0, 2],
                  },
                  {
                    text: `${t('CERT No')}: ${
                      product?.APPROVED_CERT ||
                      product?.storeItemID?.APPROVED_CERT ||
                      'N/A'
                    }`,
                    margin: [0, 0, 0, 2],
                  },
                  {
                    text: `${t('ORDER No')}: ${
                      product?.ORDER_NUMBER ||
                      product?.storeItemID?.ORDER_NUMBER ||
                      'N/A'
                    }`,
                    margin: [0, 0, 0, 2],
                  },
                  {
                    text: `${t('REC.DATE')}: ${
                      product.RECEIVED_DATE ||
                      (product?.storeItemID?.RECEIVED_DATE &&
                        moment(
                          product.RECEIVED_DATE ||
                            product?.storeItemID?.RECEIVED_DATE
                        ).format('DD. MM. YYYY')) ||
                      'N/A'
                    }`,
                    margin: [0, 0, 0, 2],
                  },
                  {
                    canvas: [
                      {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        w: 165,
                        h: 30,
                        border: [true, true, true, true], // Установите границу для всех сторон
                        alignment: 'left',
                      },
                    ],
                  },
                  {
                    stack: [
                      {
                        text: `${t('MATERIAL INCOMING INSPECTION')}`,
                        bold: true,
                        border: [true, true, true, false],
                        margin: [2, -30, 2, 2],
                      },
                      {
                        text: '1799',
                        bold: true,
                        margin: [5, 0, 5, 5],
                      },
                    ],
                    margin: [0, 0, 0, 5],
                  },
                  {
                    text: `${String(
                      product?.storeID?.storeShortName ||
                        product?.storeItemID?.storeID?.storeShortName
                    ).toUpperCase()}/${
                      product?.locationID?.locationName ||
                      product?.storeItemID?.locationID?.locationName ||
                      'N/A'
                    }`,
                    bold: true,
                  },
                  {
                    text: `${t('PRINT BY')} ${SING} ${new Date().toLocaleString(
                      'ru-RU'
                    )}`,
                    alignment: 'left',
                    fontSize: 6,
                    margin: [0, 5, 0, 0],
                  },
                ],
                alignment: 'left',
              },
            ],
          })),
        styles: {
          header: {
            fontSize: 8,
            bold: true,
            margin: [0, 0, 0, 5],
          },
        },
      };

      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.getBlob((blob: Blob) => {
        const fileURL = window.URL.createObjectURL(blob);
        const newWindow = window.open(fileURL, '_blank');

        // Если браузер блокирует открытие файла, предлагаем сохранить его
        if (
          !newWindow ||
          newWindow.closed ||
          typeof newWindow.closed === 'undefined'
        ) {
          alert('Заблокировано открытие файла. Пожалуйста, сохраните файл.');
        } else {
          newWindow.focus();
        }

        // Не забываем очищать URL после открытия файла
        window.URL.revokeObjectURL(fileURL);
        console.log('PDF успешно создан');
        setPdfBlob(blob);
      });
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
