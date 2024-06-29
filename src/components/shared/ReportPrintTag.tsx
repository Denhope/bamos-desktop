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
import { createPdf } from '@/services/createPdf';

interface ReportGeneratorProps {
  xmlTemplate: string; // XML-шаблон для генерации PDF
  data: any[]; // Массив данных для заполнения шаблона
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

      // Преобразуем XML в JSON
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
              (_, index, prop) => data[index][prop]
            );
          }
          return value;
        }
      );
      // Функция для генерации штрихкода из строки данных
      const generateBarcode = (data: any) => {
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, data, {
          format: 'CODE128', // Укажите формат вашего штрихкода, например, 'CODE128'
          displayValue: false, // Установите true, если вы хотите, чтобы значения отображались рядом с штрихкодом
          width: 1, // Ширина линий штрихкода
          height: 15, // Высота штрихкода
          margin: 0,
        });
        return canvas.toDataURL(); // Возвращает данные URL изображения штрихкода
      };
      // Создаем PDF
      console.log('Создание PDF');
      const docDefinition = {
        pageMargins: [5, 5, 5, 5],

        // Установка отступов: верх, право, низ, лево
        defaultStyle: {
          fontSize: 9, // Установка размера шрифта 10 для всего документа
        },

        pageSize: {
          // height: 174,
          // width: 285,
          width: 174,
          height: 285,
          unit: 'mm', // Установка единиц измерения в миллиметрах
        },
        content:
          accesses &&
          accesses?.map((product) => ({
            pageBreak: 'after',
            columns: [
              {
                stack: [
                  [
                    {
                      text:
                        product?.companyID?.companyName ||
                        product?.COMPANY_ID?.title,
                      bold: true,
                      alignment: 'right',
                    }, // Выравнивание текста по левому краю
                    // Пустая строка для создания отступа между текстом и штрихкодом
                    {
                      image: generateBarcode(product.accessProjectNumber),
                      width: 60,
                      height: 12,
                      alignment: 'left',
                      margin: [0, 0, 0, 1], // Отступ от нижнего края страницы
                    }, // Генерация штрихкода
                    {
                      text: `L: ${product.accessProjectNumber}`,
                      fontSize: 8,
                      alignment: 'left',
                      margin: [0, 0, 0, 2],
                    },
                  ],
                  {
                    text: `${
                      product.restriction === 'standart'
                        ? 'IDENTIFICATION TAG'
                        : 'IDENTIFICATION TAG'
                    }`,
                    fontSize: 12,
                    bold: true,
                    margin: [0, 0, 0, 2],
                  },
                  {
                    text: `${t('AC TYPE No')}: ${String(
                      product?.acTypeID?.code
                    ).toUpperCase()}`,
                    margin: [0, 0, 0, 3],
                    bold: true,
                  },
                  {
                    text: `${t('AC REG. No')}: ${
                      product?.projectID?.planeId.regNbr
                    }`,
                    margin: [0, 0, 0, 3],
                    bold: true,
                  },
                  {
                    text: `${t('W/O No')}: ${product?.projectID?.projectWO}`,
                    margin: [0, 0, 0, 3],
                    bold: true,
                  },
                  {
                    text: `${t('TASK W/O No')}: ${product?.projectTaskIds?.map(
                      (item: any) => item?.taskWO
                    )}`,
                    margin: [0, 0, 0, 3],
                    bold: true,
                  },
                  {
                    text: `${t('ACCESS No')}: ${product?.accessNbr}`,
                    margin: [0, 0, 0, 3],
                  },
                  {
                    text: `${t('ACCESS DESC.')}: ${
                      product?.accessDescription &&
                      product.accessDescription.length > 40
                        ? product.accessDescription.substring(0, 40) + '...'
                        : product?.accessDescription
                    }`,
                    margin: [0, 0, 0, 3],
                  },
                  {
                    text: `${t('AREA DESC.')}: ${
                      product?.areaCodeID?.areaDescription &&
                      product.areaCodeID.areaDescription.length > 40
                        ? product.areaCodeID.areaDescription.substring(0, 40) +
                          '...'
                        : product?.areaCodeID?.areaDescription
                    }`,
                    margin: [0, 0, 0, 3],
                  },
                  {
                    text: `${t('SUB ZONE DESC.')}: ${
                      product?.areaCodeID?.subZoneDescription &&
                      product.areaCodeID.subZoneDescription.length > 40
                        ? product.areaCodeID.subZoneDescription.substring(
                            0,
                            40
                          ) + '...'
                        : product?.areaCodeID?.subZoneDescription
                    }`,
                    margin: [0, 0, 0, 3],
                  },
                  {
                    text: `${t('ZONE No')}: ${
                      product?.areaCodeID?.majoreZoneNbr
                    }`,
                    margin: [0, 0, 0, 3],
                  },
                  {
                    text: `${t('ZONE DESC.')}: ${
                      product?.areaCodeID?.majoreZoneDescription &&
                      product.areaCodeID.majoreZoneDescription.length > 40
                        ? product.areaCodeID.majoreZoneDescription.substring(
                            0,
                            40
                          ) + '...'
                        : product?.areaCodeID?.majoreZoneDescription
                    }`,
                    margin: [0, 0, 0, 3],
                  },

                  {
                    canvas: [
                      {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        w: 165,
                        h: 32,

                        border: [true, true, true, true], // Установите границу для всех сторон
                        alignment: 'left',
                      },
                    ],
                  },
                  {
                    stack: [
                      {
                        text: `${t('OPEN')}: ${String(
                          product?.createUserID?.name
                        ).toUpperCase()}`,
                        bold: true,
                        // decoration: 'underline',
                        border: [true, true, true, false],
                        margin: [2, -28, 2, 2],
                        fontSize: 8,
                      },
                      {
                        text: `  ${t('DATE')}:${
                          product.createDate &&
                          moment(product?.createDate).format('Do. MMM. YYYY')
                        }`,
                        margin: [2, 0, 0, 1],
                        fontSize: 8,
                      },
                    ],
                    margin: [0, 0, 0, 3],
                  },
                  // { text: `${product.store}/${product.location}`, bold: true },
                  {
                    text: `Printed by ${SING} ${new Date().toLocaleString(
                      'ru-RU'
                    )}`,
                    alignment: 'left',
                    fontSize: 6,
                    margin: [0, 5, 0, 0],
                  }, // Выравнивание текста по правому краю и установка отступа от нижнего края страницы
                ],
                alignment: 'left', // Выравнивание текста по центру
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

      const pdfDoc = createPdf(docDefinition);
      (await pdfDoc).getBlob((blob: Blob) => {
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
