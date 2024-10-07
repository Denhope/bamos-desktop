import React from 'react';
import PdfSlicerPanel from './PdfSlicerPanel';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke(channel: string, data?: any): Promise<any>;
        on(channel: string, func: (...args: any[]) => void): void;
      };
    };
  }
}

const PdfSlicerAdministration: React.FC = () => {
  const handleSavePages = async (pages: Blob[]) => {
    console.log('Saving pages:', pages.length);
    const formData = new FormData();
    pages.forEach((page, index) => {
      formData.append(`page${index}`, page, `page${index}.pdf`);
    });

    try {
      // Используем Electron IPC для отправки данных на сервер
      const result = await window.electron.ipcRenderer.invoke('upload-pdf-pages', formData);
      console.log('Pages uploaded successfully:', result);
    } catch (error) {
      console.error('Error uploading pages:', error);
    }
  };

  return (
    <div>
      <h1>PDF Slicer</h1>
      <PdfSlicerPanel onSavePages={handleSavePages} />
    </div>
  );
};

export default PdfSlicerAdministration;