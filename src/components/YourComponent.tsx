import React, { useEffect } from 'react';

const YourComponent: React.FC = () => {
  useEffect(() => {
    const onUpdateCanAvailable = (_event: any, info: any) => {
      // Обработка события
      console.log('Update available:', info);
    };

    const onUpdateError = (_event: any, error: any) => {
      // Обработка ошибки
      console.error('Update error:', error);
    };

    const onDownloadProgress = (_event: any, progress: any) => {
      // Обработка прогресса загрузки
      console.log('Download progress:', progress);
    };

    const onUpdateDownloaded = (_event: any, info: any) => {
      // Обработка завершения загрузки обновления
      console.log('Update downloaded:', info);
    };

    // Регистрация слушателей событий
    if (window.electronAPI) {
      window.electronAPI.onUpdateCanAvailable(onUpdateCanAvailable);
      window.electronAPI.onUpdateError(onUpdateError);
      window.electronAPI.onDownloadProgress(onDownloadProgress);
      window.electronAPI.onUpdateDownloaded(onUpdateDownloaded);
    } else {
      console.warn('electronAPI is not available');
    }

    // Очистка при размонтировании компонента
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('update-can-available');
        window.electronAPI.removeAllListeners('update-error');
        window.electronAPI.removeAllListeners('download-progress');
        window.electronAPI.removeAllListeners('update-downloaded');
      }
    };
  }, []);

  return (
    <div>
      {/* Здесь ваш JSX */}
      <h1>Your Component</h1>
    </div>
  );
};

export default YourComponent;