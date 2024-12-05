import type { ProgressInfo } from 'electron-updater';
import { useCallback, useEffect, useState } from 'react';
import Modal from '@/components/update/Modal';
import Progress from '@/components/update/Progress';
import './update.css';
import { Button } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
const Update = () => {
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);
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

  const checkUpdate = async (showModal = true) => {
    console.log('🚀 Starting update check...', { showModal });
    setChecking(true);

    try {
      const result = await window.ipcRenderer.invoke('check-update');
      console.log('📦 Update check result:', result);

      setProgressInfo({ percent: 0 });
      setChecking(false);

      if (showModal) {
        console.log('🔔 Opening modal window');
        setModalOpen(true);
      }

      if (result?.error) {
        console.error('❌ Update check error:', result.error);
        setUpdateAvailable(false);
        setUpdateError(result?.error);
      }
    } catch (error) {
      console.error('💥 Update check failed:', error);
      setChecking(false);
      setUpdateError(error as ErrorType);
    }
  };

  const onUpdateCanAvailable = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: VersionInfo) => {
      console.log('✨ Update availability check:', arg1);
      setVersionInfo(arg1);
      setUpdateError(undefined);

      if (arg1.update) {
        console.log('🆕 Update is available:', {
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
      } else {
        console.log('✅ Application is up to date');
        setUpdateAvailable(false);
      }
    },
    []
  );

  const onUpdateError = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: ErrorType) => {
      console.error('❌ Update error occurred:', arg1);
      setUpdateAvailable(false);
      setUpdateError(arg1);
    },
    []
  );

  const onDownloadProgress = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: ProgressInfo) => {
      console.log('📥 Download progress:', arg1);
      setProgressInfo(arg1);
    },
    []
  );

  const onUpdateDownloaded = useCallback(
    (_event: Electron.IpcRendererEvent, ...args: any[]) => {
      console.log('✅ Update downloaded successfully', args);
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
    console.log('🔄 Component mounted, initializing update check...');
    checkUpdate(false);

    console.log('📡 Setting up update event listeners...');
    window.ipcRenderer.on('update-can-available', onUpdateCanAvailable);
    window.ipcRenderer.on('update-error', onUpdateError);
    window.ipcRenderer.on('download-progress', onDownloadProgress);
    window.ipcRenderer.on('update-downloaded', onUpdateDownloaded);

    return () => {
      console.log('🧹 Cleaning up update event listeners...');
      window.ipcRenderer.off('update-can-available', onUpdateCanAvailable);
      window.ipcRenderer.off('update-error', onUpdateError);
      window.ipcRenderer.off('download-progress', onDownloadProgress);
      window.ipcRenderer.off('update-downloaded', onUpdateDownloaded);
    };
  }, []);

  return (
    <>
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
          ) : (
            <div className="can-not-available">
              {JSON.stringify(versionInfo ?? {}, null, 2)}
            </div>
          )}
        </div>
      </Modal>
      <Button
        className="w-full text-start border-none hover:bg-gray-200"
        disabled={checking}
        onClick={() => checkUpdate(true)}
      >
        <CloudUploadOutlined /> {checking ? 'Checking...' : t('Check update')}
      </Button>
    </>
  );
};

export default Update;
