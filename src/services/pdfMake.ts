import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

interface VFSFonts {
  [key: string]: string;
}

console.log('pdfMake:', pdfMake);
console.log('pdfFonts:', pdfFonts);

// Безопасное приведение типов с проверкой
const vfs = (pdfFonts as any)?.pdfMake?.vfs as VFSFonts;

if (vfs) {
  pdfMake.vfs = vfs;
} else {
  console.error('Virtual file system fonts are not available');
}

console.log('pdfMake.vfs:', pdfMake.vfs);

export default pdfMake;
