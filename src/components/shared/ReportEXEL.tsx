// import React, { useState } from 'react';
// import * as XLSX from 'xlsx';
// import { Button } from 'antd';
// import { useTranslation } from 'react-i18next';
// import { FileExcelOutlined } from '@ant-design/icons';

// interface ReportGeneratorProps {
//   data: any[]; // Массив данных для заполнения таблицы
//   headers: { [key: string]: string }; // Объект с заголовками столбцов
// }

// const ReportGenerator: React.FC<ReportGeneratorProps> = ({ data, headers }) => {
//   const [loading, setLoading] = useState<boolean>(false);
//   const { t } = useTranslation();

//   const generateExcelFile = () => {
//     try {
//       setLoading(true);
//       console.log('Начало генерации файла Excel');

//       const workbook = XLSX.utils.book_new();
//       const worksheet = XLSX.utils.json_to_sheet(data);

//       // Применяем стили к заголовкам
//       const headerCellStyle = {
//         font: { bold: true },
//         alignment: { horizontal: 'center' },
//         fill: { fgColor: { rgb: 'FFFF00' } },
//       };

//       Object.keys(headers).forEach((key, index) => {
//         const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
//         worksheet[cellRef] = {
//           ...worksheet[cellRef],
//           v: headers[key], // Заменяем ключ на соответствующее значение из headers
//           ...headerCellStyle,
//         };
//       });

//       XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');

//       const currentDate = new Date().toISOString().split('T')[0];
//       const filename = `Export_${currentDate}.xlsx`;

//       XLSX.writeFile(workbook, filename);

//       console.log('Файл Excel успешно сгенерирован');
//     } catch (error) {
//       console.error('Ошибка при генерации файла Excel:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <Button
//         icon={<FileExcelOutlined />}
//         size="small"
//         onClick={generateExcelFile}
//         disabled={loading}
//       >
//         {loading ? 'Processing' : ` ${t('EXPORT SELECTED')}`}
//       </Button>
//     </div>
//   );
// };

// export default ReportGenerator;

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { FileExcelOutlined } from '@ant-design/icons';

interface ReportGeneratorProps {
  data: any[]; // Массив данных для заполнения таблицы
  isDisabled?: boolean;
  headers: { [key: string]: string };
  fileName: string; // Объект с заголовками столбцов и вложенными путями к полям
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  data,
  headers,
  isDisabled,
  fileName,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  const generateExcelFile = () => {
    try {
      setLoading(true);
      console.log('Начало генерации файла Excel');

      const currentDate = new Date().toISOString().split('T')[0]; // Текущая дата в формате "YYYY-MM-DD"

      const headerValues = Object.values(headers).map((header) =>
        header.toUpperCase()
      ); // Получаем русские заголовки в верхнем регистре
      // Применяем стили к заголовкам
      const headerCellStyle = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'FFFF00' } },
        border: { style: 'thin', color: { rgb: '000000' } }, // Стиль границы
      };

      // Применяем стили к ячейкам данных
      const cellStyle = {
        border: { style: 'thin', color: { rgb: '000000' } }, // Стиль границы
      };

      // Преобразуем данные для заполнения таблицы
      const worksheetData = [
        headerValues.map((header) => ({
          v: header,
          s: headerCellStyle, // Применяем стиль к заголовкам
        })),
        ...data.map((item) =>
          Object.keys(headers).map((key) => {
            let value = getValueFromObject(item, key);
            if (
              value &&
              typeof value === 'string' &&
              /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/.test(value)
            ) {
              value = new Date(value).toLocaleDateString();
            } else if (value && typeof value === 'string') {
              value = value.toUpperCase();
            }
            return value !== undefined ? { v: value, s: cellStyle } : { v: '' }; // Применяем стиль к ячейкам данных
          })
        ),
      ];

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      worksheet['!cols'] = headerValues.map(() => ({ wpx: 120 }));
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');

      const excelFile = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'binary',
      });
      const excelBlob = new Blob([s2ab(excelFile)], {
        type: 'application/octet-stream',
      });
      saveAs(excelBlob, `${fileName}${currentDate}.xlsx`); // Добавляем текущую дату к названию файла

      console.log('Файл Excel успешно сгенерирован');
    } catch (error) {
      console.error('Ошибка при генерации файла Excel:', error);
    } finally {
      setLoading(false);
    }
  };

  // Функция для извлечения значения из объекта с учетом вложенного пути
  const getValueFromObject = (obj: any, path: string): any => {
    const keys = path.split('.');
    return keys.reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
      obj
    );
  };

  // Функция для преобразования строк в байтовый массив
  const s2ab = (s: string) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  };

  return (
    <div>
      <Button
        icon={<FileExcelOutlined />}
        size="small"
        onClick={generateExcelFile}
        disabled={loading || isDisabled}
      >
        {loading ? 'Processing' : ` ${t('EXPORT SELECTED')}`}
      </Button>
    </div>
  );
};

export default ReportGenerator;
