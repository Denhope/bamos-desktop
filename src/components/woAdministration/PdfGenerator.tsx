// @ts-nocheck

import React, { useState, useEffect } from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import { Button } from 'antd';
import Handlebars from 'handlebars';
import { createPdf } from '@/services/createPdf';

const PdfGenerator = ({ htmlTemplate, data }) => {
  const generatePdf = async () => {
    // Компилируем шаблон с помощью Handlebars
    const template = Handlebars.compile(htmlTemplate);
    const renderedHtml = template(data);

    const pdfDocDefinition = {
      content: htmlToPdfmake(renderedHtml),
    };

    const pdfDoc = createPdf(pdfDocDefinition);
    (await pdfDoc).getBlob((blob: Blob) => {
      const fileURL = window.URL.createObjectURL(blob);
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
      console.log('PDF успешно создан');
    });
  };

  return (
    <div>
      <Button size="small" onClick={generatePdf}>
        Generate PDF
      </Button>
    </div>
  );
};

export default PdfGenerator;
