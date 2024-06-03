//@ts-nocheck
import React, { useState } from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import xml2js from 'xml2js';
import JsBarcode from 'jsbarcode';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface ReportGeneratorProps {
  xmlTemplate: string; // XML-шаблон для генерации PDF
  data: any[]; // Массив данных для заполнения шаблона
  isDdisabled?: boolean;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  xmlTemplate,
  data,
  isDdisabled,
}) => {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();
  const productsData = [
    {
      label: 1222,
      company: '407 TECHNICS',
      nomenclature: 'HL97DU5',
      batchNumber: '123466DF',
      mcQty: 100,
      group: 'CONS',
      unit: 'EA',
      state: 'NEW',
      expDate: 'N/A',
      description: 'COLLAR',
      certNo: 'N/A',
      orderNo: 'P0000016',
      recDate: '12th. Mar. 2021',
      store: 'MSQ',
      location: 'A-54',
      printBy: '1199',
      printDate: new Date(),
      restriction: 'standart',
    },
    {
      label: 1223,
      company: '407 TECHNICS',
      nomenclature: 'HL97DU5',
      batchNumber: '123466DF',
      mcQty: 100,
      group: 'CONS',
      unit: 'EA',
      state: 'NEW',
      expDate: 'N/A',
      description: 'COLLAR',
      certNo: 'N/A',
      orderNo: 'P0000016',
      recDate: '12th. Mar. 2021',
      store: 'MSQ',
      location: 'A-54',
      printBy: '1199',
      printDate: new Date(),
      restriction: 'restricted',
    },
  ];

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
          fontSize: 10, // Установка размера шрифта 10 для всего документа
        },
        pageSize: {
          width: 174,
          height: 280,
          unit: 'mm', // Установка единиц измерения в миллиметрах
        },
        content: productsData.map((product) => ({
          pageBreak: 'after',
          columns: [
            {
              stack: [
                [
                  { text: product.company, bold: true, alignment: 'right' }, // Выравнивание текста по левому краю
                  // Пустая строка для создания отступа между текстом и штрихкодом
                  {
                    image: generateBarcode(product.label),
                    width: 60,
                    height: 15,
                    alignment: 'left',
                    margin: [0, 0, 0, 1], // Отступ от нижнего края страницы
                  }, // Генерация штрихкода
                  {
                    text: `L: ${product.LOCAL_ID}`,
                    fontSize: 8,
                    alignment: 'left',
                    margin: [0, 0, 0, 5],
                  },
                ],
                {
                  text: `${
                    product.restriction === 'standart'
                      ? 'SERVICABLE TAG'
                      : 'UNSERVICEABLE TAG'
                  }`,
                  fontSize: 13,
                  bold: true,
                  margin: [0, 0, 0, 5],
                },
                {
                  text: `${t('PART No')}: ${product.PART_NUMBER}`,
                  margin: [0, 0, 0, 2],
                },
                {
                  text: `${t('BATCH No')}: ${product.SUPPLIER_BATCH_NUMBER}`,
                  margin: [0, 0, 0, 2],
                },
                {
                  text: `${t('MC/QTY')}: ${data?.GROUP} / ${
                    bookedQty || data?.QUANTITY
                  }
                  {"\r"}
                  ${data.UNIT_OF_MEASURE}`,
                  margin: [0, 0, 0, 2],
                },
                {
                  text: `${t('CONDITION')}: ${product.CONDITION}`,
                  margin: [0, 0, 0, 2],
                },
                {
                  text: `${t('EXP.DATE')}: ${
                    (product.PRODUCT_EXPIRATION_DATE &&
                      moment(product.PRODUCT_EXPIRATION_DATE).format(
                        'Do. MMM. YYYY'
                      )) ||
                    'N/A'
                  }`,
                  margin: [0, 0, 0, 2],
                },
                {
                  text: `${t('DESCRIPTION')}: ${product?.NAME_OF_MATERIAL}`,
                  margin: [0, 0, 0, 2],
                },
                {
                  text: `${t('CERT No')}: ${product?.APPROVED_CERT || 'N/A'}`,
                  margin: [0, 0, 0, 2],
                },
                {
                  text: `${t('ORDER No')}: ${product?.ORDER_NUMBER || 'N/A'}`,
                  margin: [0, 0, 0, 2],
                },
                {
                  text: `${t('REC.DATE')}: ${
                    data.RECEIVED_DATE &&
                    moment(data.RECEIVED_DATE).format('Do. MMM. YYYY')
                  }}`,
                  margin: [0, 0, 0, 2],
                },
                {
                  canvas: [
                    {
                      type: 'rect',
                      x: 0,
                      y: 0,
                      w: 165,
                      h: 45,

                      border: [true, true, true, true], // Установите границу для всех сторон
                      alignment: 'left',
                    },
                  ],
                },
                {
                  stack: [
                    {
                      text: 'MATERIAL INCOMING INSPECTION',
                      bold: true,
                      // decoration: 'underline',
                      border: [true, true, true, false],
                      margin: [2, -30, 2, 2],
                    },
                    {
                      text: '1799',
                      bold: true,
                      // border: [true, false, true, true],
                      margin: [5, 0, 5, 5],
                    },
                  ],
                  margin: [0, 0, 0, 10],
                },
                { text: `${product.store}/${product.location}`, bold: true },
                {
                  text: `Printed by ${
                    product.printBy
                  } ${product.printDate.toLocaleString('ru-RU')}`,
                  alignment: 'left',
                  fontSize: 8,
                  margin: [0, 10, 0, 0],
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
        disabled={loading || isDdisabled}
      >
        {loading ? 'Processing' : ` ${t('PRINT LABEL')}`}
      </Button>
      {/* {pdfBlob && (
        <a href={URL.createObjectURL(pdfBlob)} download="report.pdf">
          Скачать PDF
        </a>
      )} */}
    </div>
  );
};

export default ReportGenerator;
