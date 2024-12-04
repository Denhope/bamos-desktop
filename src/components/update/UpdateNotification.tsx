import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
const { ipcRenderer } = window.require('electron');

export const UpdateNotification: React.FC = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdateDownloaded, setIsUpdateDownloaded] = useState(false);

  useEffect(() => {
    ipcRenderer.on('update-available', () => {
      setIsUpdateAvailable(true);
    });

    ipcRenderer.on('update-downloaded', () => {
      setIsUpdateDownloaded(true);
    });

    return () => {
      ipcRenderer.removeAllListeners('update-available');
      ipcRenderer.removeAllListeners('update-downloaded');
    };
  }, []);

  return (
    <>
      <Modal
        title="Доступно обновление"
        open={isUpdateAvailable && !isUpdateDownloaded}
        okText="OK"
        cancelText="Отмена"
        onOk={() => setIsUpdateAvailable(false)}
        onCancel={() => setIsUpdateAvailable(false)}
      >
        <p>Доступна новая версия приложения. Идет загрузка обновления...</p>
      </Modal>

      <Modal
        title="Обновление готово"
        open={isUpdateDownloaded}
        okText="Перезапустить"
        cancelText="Позже"
        onOk={() => ipcRenderer.send('restart-app')}
        onCancel={() => setIsUpdateDownloaded(false)}
      >
        <p>
          Обновление загружено и будет установлено при следующем запуске
          приложения.
        </p>
      </Modal>
    </>
  );
};
