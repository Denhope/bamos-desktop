import * as pdfFonts from 'pdfmake/build/vfs_fonts';

const pdfMake = require('pdfmake/build/pdfmake');

console.log('pdfMake:', pdfMake);
console.log('pdfFonts:', pdfFonts);

if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else {
  console.error('pdfFonts.pdfMake.vfs is undefined');
}

console.log('pdfMake.vfs:', pdfMake.vfs);

export default pdfMake;
