import { app, ipcMain } from 'electron';
import { createRequire } from 'node:module';
import type {
  ProgressInfo,
  UpdateDownloadedEvent,
  UpdateInfo,
} from 'electron-updater';

const { autoUpdater } = createRequire(import.meta.url)('electron-updater');
const log = require('electron-log');

export function update(win: Electron.BrowserWindow) {
  // Настройка логирования
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = 'debug';

  // Базовые настройки
  autoUpdater.autoDownload = false;
  autoUpdater.disableWebInstaller = false;
  autoUpdater.allowDowngrade = false;

  // Добавляем GitHub токен для приватного репозитория
  if (process.env.GH_TOKEN) {
    log.info('Setting up GitHub token for private repository');
    autoUpdater.requestHeaders = {
      Authorization: `token ${process.env.GH_TOKEN}`,
    };
  }

  // Добавляем обработку ошибок
  autoUpdater.on('error', (error: any) => {
    log.error('Error in auto-updater:', error);
    win.webContents.send('update-error', error);
  });

  // Остальные обработчики событий
  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for updates...');
  });

  autoUpdater.on('update-available', (arg: UpdateInfo) => {
    log.info('Update available:', arg);
    win.webContents.send('update-can-available', {
      update: true,
      version: app.getVersion(),
      newVersion: arg?.version,
    });
  });

  autoUpdater.on('update-not-available', (arg: UpdateInfo) => {
    log.info('Update not available:', arg);
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
      log.error(error);
      return { message: error.message, error };
    }

    try {
      log.info('Manually checking for updates...');
      return await autoUpdater.checkForUpdatesAndNotify();
    } catch (error) {
      log.error('Update check failed:', error);
      return { message: 'Network error', error };
    }
  });

  ipcMain.handle('start-download', (event: Electron.IpcMainInvokeEvent) => {
    log.info('Starting update download...');
    startDownload(
      (error, progressInfo) => {
        if (error) {
          log.error('Download error:', error);
          event.sender.send('update-error', { message: error.message, error });
        } else {
          log.info('Download progress:', progressInfo);
          event.sender.send('download-progress', progressInfo);
        }
      },
      () => {
        log.info('Update downloaded successfully');
        event.sender.send('update-downloaded');
      }
    );
  });

  ipcMain.handle('quit-and-install', () => {
    log.info('Quitting and installing update...');
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
