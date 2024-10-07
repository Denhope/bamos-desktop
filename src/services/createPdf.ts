// createPdf.ts
import type { createPdf as _createPdf } from 'pdfmake/build/pdfmake';

export const createPdf = async (...args: Parameters<typeof _createPdf>) => {
  // pdfmake is a heavy library. We use dynamic imports so that it's loaded only when needed.
  const { default: pdfMake } = await import('./pdfMake');
  if (!pdfMake) {
    throw new Error('pdfMake is not loaded');
  }
  if (!pdfMake.vfs) {
    throw new Error('pdfMake.vfs is not initialized');
  }
  return pdfMake.createPdf(...args);
};
