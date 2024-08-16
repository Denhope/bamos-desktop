// import { PDFDocument, PDFFont, rgb, StandardFonts } from 'pdf-lib';
// import fontkit from '@pdf-lib/fontkit';
// import robotoBoldFont from '../../fonts/Roboto-Bold.ttf';
// import robotoFontt from '../../fonts/Roboto-Regular.ttf'; // Путь к вашему шрифту
// import logoImage from '../../assets/img/407Technics_logo.png'; // Путь к вашему логотипу
// import {
//   useGetProjectItemsWOQuery,
//   useGetProjectTaskForCardQuery,
// } from '@/features/projectItemWO/projectItemWOApi';
// import { useTranslation } from 'react-i18next';
// import { transformToIProjectTask } from '@/services/utilites';
// import axios from 'axios';
// import QRCode from 'qrcode';

// const generatePdf = async () => {
//   const pdfDoc = await PDFDocument.create();
//   pdfDoc.registerFontkit(fontkit);

//   // Загрузка шрифтов и изображений
//   const fontBytes = await fetch(robotoFontt).then((res) => res.arrayBuffer());
//   const robotoFont = await pdfDoc.embedFont(fontBytes);
//   const fontBytesB = await fetch(robotoBoldFont).then((res) =>
//     res.arrayBuffer()
//   );
//   const robotoFontB = await pdfDoc.embedFont(fontBytesB);
//   const logoBytes = await fetch(logoImage).then((res) => res.arrayBuffer());
//   const logoImageEmbed = await pdfDoc.embedPng(logoBytes);

//   let totalPages = 0;

//   for (const task of transformedTasks) {
//     // Создание основного PDF-документа для каждой задачи
//     // Логика для создания PDF-документа для каждой задачи
//     // ...

//     // Добавление PDF-документов к каждой работе
//     let additionalPdfs: Uint8Array[] = [];
//     try {
//       additionalPdfs = await Promise.all(
//         task.reference.map(async (ref) => {
//           try {
//             const pdfBytes = await getFileFromServer(
//               COMPANY_ID,
//               ref.fileId,
//               'uploads'
//             );
//             return pdfBytes;
//           } catch (error) {
//             console.error(
//               `Ошибка при загрузке PDF-документа для fileId ${ref.fileId}:`,
//               error
//             );
//             return new Uint8Array(); // Возвращаем пустой Uint8Array, чтобы не прерывать процесс
//           }
//         })
//       );
//     } catch (error) {
//       console.error(
//         'Ошибка при загрузке дополнительных PDF-документов:',
//         error
//       );
//     }

//     // Объединение основного PDF-документа с дополнительными PDF-документами
//     let taskPdfDoc: PDFDocument;
//     try {
//       taskPdfDoc = await PDFDocument.create();
//       const embeddedPages = await Promise.all(
//         additionalPdfs.map(async (pdfBytes) => {
//           const srcDoc = await PDFDocument.load(pdfBytes);
//           const pages = await taskPdfDoc.copyPages(
//             srcDoc,
//             srcDoc.getPageIndices()
//           );
//           return pages;
//         })
//       );
//       embeddedPages.forEach((pages) =>
//         pages.forEach((page) => taskPdfDoc.addPage(page))
//       );
//     } catch (error) {
//       console.error('Ошибка при объединении PDF-документов:', error);
//       continue; // Пропускаем эту задачу и переходим к следующей
//     }

//     // Копирование страниц из taskPdfDoc в основной pdfDoc
//     const taskPages = await pdfDoc.copyPages(
//       taskPdfDoc,
//       taskPdfDoc.getPageIndices()
//     );
//     taskPages.forEach((page) => {
//       pdfDoc.addPage(page);
//       totalPages++;
//     });
//   }

//   // Добавление нумерации страниц и надписи "Work Package"
//   const pages = pdfDoc.getPages();
//   pages.forEach((page, index) => {
//     addPageNumber(page, index + 1, totalPages);
//     addWorkPackageLabel(page, robotoFont);
//   });

//   // Создание и открытие финального PDF-документа
//   const finalPdfBytes = await pdfDoc.save();
//   const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
//   const fileURL = URL.createObjectURL(blob);
//   window.open(fileURL, '_blank');
//   URL.revokeObjectURL(fileURL);

//   console.log('PDF успешно создан');
// };

// const addPageNumber = async (
//   page: PDFPage,
//   pageNumber: number,
//   totalPages: number
// ) => {
//   const { width, height } = page.getSize();
//   const font = await page.doc.embedFont(StandardFonts.Helvetica);

//   // Добавление нумерации страниц
//   page.drawText(`Page ${pageNumber} of ${totalPages}`, {
//     x: width - 100,
//     y: height - 50,
//     size: fontSize,
//     font,
//     color: rgb(0, 0, 0),
//   });
// };

// const addWorkPackageLabel = (page: PDFPage, font: PDFFont) => {
//   const { width, height } = page.getSize();

//   // Добавление надписи "Work Package"
//   page.drawText('Work Package', {
//     x: 50,
//     y: height - 50,
//     size: fontSize,
//     font,
//     color: rgb(0, 0, 0),
//   });
// };
