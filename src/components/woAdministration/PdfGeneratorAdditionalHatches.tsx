import React, { useState, useMemo } from 'react';
import { Button } from 'antd';
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import robotoBoldFont from '../../fonts/Roboto-Bold.ttf';
import robotoFont from '../../fonts/Roboto-Regular.ttf';
import logoImage from '../../assets/img/407Technics_logo.png';
import { useGetProjectPanelsQuery } from '@/features/projectItemWO/projectItemWOApi';
import { useTranslation } from 'react-i18next';
import { COMPANY_ID, SING } from '@/utils/api/http';

const PdfGeneratorAdditionalHatches: React.FC<{
  disabled?: boolean;
}> = ({ disabled }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false); // Состояние загрузки

  const {
    data: projectPanelsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetProjectPanelsQuery(
    { isAddAccess: true },
    {
      skip: false,
    }
  );

  const generatePdf = async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    setLoading(true);

    // Загрузка шрифтов и изоражений
    const fontBytes = await fetch(robotoFont).then((res) => res.arrayBuffer());
    const roboto = await pdfDoc.embedFont(fontBytes);
    const fontBytesB = await fetch(robotoBoldFont).then((res) =>
      res.arrayBuffer()
    );
    const robotoBold = await pdfDoc.embedFont(fontBytesB);
    const logoBytes = await fetch(logoImage).then((res) => res.arrayBuffer());
    const logo = await pdfDoc.embedPng(logoBytes);

    const page = pdfDoc.addPage([595.28, 841.89]); // A4 размер
    const { width, height } = page.getSize();

    // Добавление логотипа
    page.drawImage(logo, {
      x: 50,
      y: height - 100,
      width: 150,
      height: 50,
    });

    // Заголовок отчета
    const tableTop = height - 130;
    let y = tableTop;
    page.drawText('REPORT ON ADDITIONAL OPEN ACCESS', {
      x: 220,
      y: height - 80,
      size: 20,
      font: robotoBold,
      color: rgb(0, 0, 0),
    });

    // Таблица заголовков
    let itemX = 50;
    const columns = [
      { title: 'No.', width: 60 },
      { title: 'Access', width: 60 },
      { title: 'Opening Time', width: 150 },
      { title: 'Closing Time', width: 150 },
      { title: 'Duration Spent (min)', width: 180 },
    ];

    columns.forEach((col, index) => {
      page.drawText(col.title, {
        x: itemX,
        y,
        size: 12,
        font: robotoBold,
        color: rgb(0, 0, 0),
      });
      itemX += col.width;
    });

    y -= 20;

    // Заполнение таблицы данными из projectPanelsData
    projectPanelsData?.forEach((panel, idx) => {
      let x = 50;
      page.drawText(String(idx + 1), {
        x,
        y,
        size: 10,
        font: roboto,
        color: rgb(0, 0, 0),
      });
      x += 60;

      // Обеспечение, что panel.name определено и на английском
      page.drawText(panel.name || '', {
        x,
        y,
        size: 10,
        font: roboto,
        color: rgb(0, 0, 0),
      });
      x += 200;

      // Проверка наличия и валидности panel.openedAt
      const openedAtDate = new Date(panel.openedAt);
      const openedAt = !isNaN(openedAtDate.getTime())
        ? openedAtDate.toLocaleTimeString()
        : 'N/A';
      page.drawText(openedAt, {
        x,
        y,
        size: 10,
        font: roboto,
        color: rgb(0, 0, 0),
      });
      x += 150;

      // Проверка наличия и валидности panel.closedAt
      const closedAtDate = new Date(panel.closedAt);
      const closedAt = !isNaN(closedAtDate.getTime())
        ? closedAtDate.toLocaleTimeString()
        : 'N/A';
      page.drawText(closedAt, {
        x,
        y,
        size: 10,
        font: roboto,
        color: rgb(0, 0, 0),
      });
      x += 150;

      // Вычисление продолжительности, если оба времени валидны
      const duration =
        !isNaN(openedAtDate.getTime()) && !isNaN(closedAtDate.getTime())
          ? Math.abs(
              (closedAtDate.getTime() - openedAtDate.getTime()) / 1000 / 60
            )
          : 'N/A';
      page.drawText(
        typeof duration === 'number' ? `${duration} min` : duration,
        {
          x,
          y,
          size: 10,
          font: roboto,
          color: rgb(0, 0, 0),
        }
      );
      y -= 25;

      // Проверка на переход на новую страницу
      if (y < 50) {
        // Добавление новой страницы при необходимости и повторение заголовков таблицы
        const newPage = pdfDoc.addPage([595.28, 841.89]); // A4 размер
        const { width: newPageWidth, height: newPageHeight } =
          newPage.getSize();
        y = newPageHeight - 50; // Установка начальной позиции на новой странице

        // Повторение заголовков таблицы на новой странице
        let newItemX = 50;
        columns.forEach((col) => {
          newPage.drawText(col.title, {
            x: newItemX,
            y,
            size: 12,
            font: robotoBold,
            color: rgb(0, 0, 0),
          });
          newItemX += col.width;
        });
        y -= 20;
      }
    });

    // Создание и открытие финального PDF-документа
    const finalPdfBytes = await pdfDoc.save();
    const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL, '_blank');
    URL.revokeObjectURL(fileURL);

    console.log('PDF успешно создан');
    setLoading(false);
  };

  return (
    <div>
      <Button
        loading={loading}
        disabled={disabled || loading}
        size="small"
        onClick={generatePdf}
      >
        {`${t('PRINT ADDITIONAL REPORT')}`}
      </Button>
    </div>
  );
};

export default PdfGeneratorAdditionalHatches;
