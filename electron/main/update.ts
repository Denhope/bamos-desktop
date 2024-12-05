import { app, ipcMain } from 'electron';
import { createRequire } from 'node:module';
import * as dotenv from 'dotenv';
import type {
  ProgressInfo,
  UpdateDownloadedEvent,
  UpdateInfo,
} from 'electron-updater';
import electronLog from 'electron-log';

// Создаем require для ES модулей
const require = createRequire(import.meta.url);
const { autoUpdater } = require('electron-updater');

// Загружаем переменные окружения
dotenv.config();

export function update(win: Electron.BrowserWindow) {
  // Настройка логирования
  autoUpdater.logger = electronLog;
  autoUpdater.logger.transports.file.level = 'debug';

  // Базовые настройки
  autoUpdater.autoDownload = false;
  autoUpdater.disableWebInstaller = false;
  autoUpdater.allowDowngrade = false;

  // Используем токен из переменных окружения
  const token = process.env.GH_TOKEN || '';
  if (token) {
    electronLog.info('Setting up GitHub token for private repository');
    autoUpdater.requestHeaders = {
      Authorization: `token ${token}`,
    };
  } else {
    electronLog.warn('GH_TOKEN is not set');
  }

  // Добавляем обработку ошибок
  autoUpdater.on('error', (error: any) => {
    electronLog.error('Error in auto-updater:', error);
    win.webContents.send('update-error', error);
  });

  // Остальные обработчики событий
  autoUpdater.on('checking-for-update', () => {
    electronLog.info('Checking for updates...');
  });

  autoUpdater.on('update-available', (arg: UpdateInfo) => {
    electronLog.info('Update available:', arg);
    win.webContents.send('update-can-available', {
      update: true,
      version: app.getVersion(),
      newVersion: arg?.version,
    });
  });

  autoUpdater.on('update-not-available', (arg: UpdateInfo) => {
    electronLog.info('Update not available:', arg);
    win.webContents.send('update-can-available', {
      update: false,
      version: app.getVersion(),
      newVersion: arg?.version,
    });
  });

  // IPC handlers
  ipcMain.handle('check-update', async () => {
    if (!app.isPackaged) {
      const error = new Error(
        'The update feature is only available after the package.'
      );
      electronLog.error(error);
      return { message: error.message, error };
    }

    try {
      electronLog.info('Manually checking for updates...');
      return await autoUpdater.checkForUpdatesAndNotify();
    } catch (error) {
      electronLog.error('Update check failed:', error);
      return { message: 'Network error', error };
    }
  });

  ipcMain.handle('start-download', (event: Electron.IpcMainInvokeEvent) => {
    electronLog.info('Starting update download...');
    startDownload(
      (error, progressInfo) => {
        if (error) {
          electronLog.error('Download error:', error);
          event.sender.send('update-error', { message: error.message, error });
        } else {
          electronLog.info('Download progress:', progressInfo);
          event.sender.send('download-progress', progressInfo);
        }
      },
      () => {
        electronLog.info('Update downloaded successfully');
        event.sender.send('update-downloaded');
      }
    );
  });

  ipcMain.handle('quit-and-install', () => {
    electronLog.info('Quitting and installing update...');
    autoUpdater.quitAndInstall(false, true);
  });
}

function startDownload(
  callback: (error: Error | null, info: ProgressInfo | null) => void,
  complete: (event: UpdateDownloadedEvent) => void
) {
  autoUpdater.on('download-progress', (info: ProgressInfo) =>
    callback(null, info)
  );
  autoUpdater.on('error', (error: Error) => callback(error, null));
  autoUpdater.on('update-downloaded', complete);
  autoUpdater.downloadUpdate();
}
