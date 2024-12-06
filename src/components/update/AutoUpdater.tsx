import { useEffect } from 'react';
import { useCallback, useState } from 'react';
import type { ProgressInfo } from 'electron-updater';
import Modal from './Modal';
import Progress from './Progress';

const AutoUpdater = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [versionInfo, setVersionInfo] = useState<VersionInfo>();
  const [updateError, setUpdateError] = useState<ErrorType>();
  const [progressInfo, setProgressInfo] = useState<Partial<ProgressInfo>>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalBtn, setModalBtn] = useState<{
    cancelText?: string;
    okText?: string;
    onCancel?: () => void;
    onOk?: () => void;
  }>({
    onCancel: () => setModalOpen(false),
    onOk: () => window.ipcRenderer.invoke('start-download'),
  });

  const checkUpdate = async () => {
    console.log('🔄 AutoUpdater: Starting update check...');
    try {
      const result = await window.ipcRenderer.invoke('check-update');
      console.log('📦 AutoUpdater: Update check result:', result);

      if (result?.error) {
        console.error('❌ AutoUpdater: Update check error:', result.error);
        setUpdateAvailable(false);
        setUpdateError(result?.error);
      }
    } catch (error) {
      console.error('💥 AutoUpdater: Update check failed:', error);
      setUpdateError(error as ErrorType);
    }
  };

  const onUpdateCanAvailable = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: VersionInfo) => {
      console.log('✨ AutoUpdater: Update availability check:', arg1);
      setVersionInfo(arg1);
      setUpdateError(undefined);

      if (arg1.update) {
        console.log('🆕 AutoUpdater: Update is available:', {
          currentVersion: arg1.version,
          newVersion: arg1.newVersion,
        });
        setModalBtn((state) => ({
          ...state,
          cancelText: 'Cancel',
          okText: 'Update',
          onOk: () => window.ipcRenderer.invoke('start-download'),
        }));
        setUpdateAvailable(true);
        setModalOpen(true);
      }
    },
    []
  );

  const onUpdateError = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: ErrorType) => {
      console.error('❌ AutoUpdater: Update error occurred:', arg1);
      setUpdateAvailable(false);
      setUpdateError(arg1);
    },
    []
  );

  const onDownloadProgress = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: ProgressInfo) => {
      console.log('📥 AutoUpdater: Download progress:', arg1);
      setProgressInfo(arg1);
    },
    []
  );

  const onUpdateDownloaded = useCallback(
    (_event: Electron.IpcRendererEvent, ...args: any[]) => {
      console.log('✅ AutoUpdater: Update downloaded successfully', args);
      setProgressInfo({ percent: 100 });
      setModalBtn((state) => ({
        ...state,
        cancelText: 'Later',
        okText: 'Install now',
        onOk: () => window.ipcRenderer.invoke('quit-and-install'),
      }));
    },
    []
  );

  useEffect(() => {
    console.log('🚀 AutoUpdater: Component mounted, setting up...');

    // Проверяем обновления при монтировании
    checkUpdate();

    // Устанавливаем слушатели событий
    window.ipcRenderer.on('update-can-available', onUpdateCanAvailable);
    window.ipcRenderer.on('update-error', onUpdateError);
    window.ipcRenderer.on('download-progress', onDownloadProgress);
    window.ipcRenderer.on('update-downloaded', onUpdateDownloaded);

    return () => {
      console.log('🧹 AutoUpdater: Cleaning up...');
      window.ipcRenderer.off('update-can-available', onUpdateCanAvailable);
      window.ipcRenderer.off('update-error', onUpdateError);
      window.ipcRenderer.off('download-progress', onDownloadProgress);
      window.ipcRenderer.off('update-downloaded', onUpdateDownloaded);
    };
  }, []);

  return (
    <Modal
      open={modalOpen}
      cancelText={modalBtn?.cancelText}
      okText={modalBtn?.okText}
      onCancel={modalBtn?.onCancel}
      onOk={modalBtn?.onOk}
      footer={updateAvailable ? null : undefined}
    >
      <div className="modal-slot">
        {updateError ? (
          <div>
            <p>Error downloading the latest version.</p>
            <p>{JSON.stringify(updateError, null, 2)}</p>
          </div>
        ) : updateAvailable ? (
          <div>
            <div>The last version is: v{versionInfo?.newVersion}</div>
            <div className="new-version__target">
              v{versionInfo?.version} -&gt; v{versionInfo?.newVersion}
            </div>
            <div className="update__progress">
              <div className="progress__title">Update progress:</div>
              <div className="progress__bar">
                <Progress percent={progressInfo?.percent}></Progress>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default AutoUpdater;
