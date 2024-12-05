import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

type PdfFonts = {
  pdfMake: {
    vfs: { [key: string]: string };
  };
};

console.log('pdfMake:', pdfMake);
console.log('pdfFonts:', pdfFonts);

const typedPdfFonts = pdfFonts as PdfFonts;

if (typedPdfFonts?.pdfMake?.vfs) {
  pdfMake.vfs = typedPdfFonts.pdfMake.vfs;
} else {
  console.error('pdfFonts.pdfMake.vfs is undefined');
}

console.log('pdfMake.vfs:', pdfMake.vfs);

export default pdfMake;
