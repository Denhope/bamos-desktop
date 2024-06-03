//@ts-nocheck
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ReportGeneratorProps {
  data: any[]; // Массив данных для заполнения таблицы
  headers: { [key: string]: string }; // Объект с заголовками столбцов
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ data, headers }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const generateExcelFile = () => {
    try {
      setLoading(true);
      console.log('Начало генерации файла Excel');

      const headerKeys = Object.keys(headers); // Получаем английские ключи заголовков
      const headerValues = Object.values(headers).map((header) =>
        header.toUpperCase()
      ); // Получаем русские заголовки в верхнем регистре

      const worksheetData = [
        headerValues,
        ...data.map((item) => headerKeys.map((key) => item[key])),
      ];

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');

      const excelFile = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'binary',
      });
      const excelBlob = new Blob([s2ab(excelFile)], {
        type: 'application/octet-stream',
      });
      saveAs(excelBlob, 'report.xlsx');

      console.log('Файл Excel успешно сгенерирован');
    } catch (error) {
      console.error('Ошибка при генерации файла Excel:', error);
    } finally {
      setLoading(false);
    }
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
      <button onClick={generateExcelFile} disabled={loading}>
        {loading ? 'Генерация файла...' : 'Сгенерировать файл Excel'}
      </button>
    </div>
  );
};

export default ReportGenerator;
