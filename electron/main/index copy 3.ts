import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  Menu,
  dialog,
  MenuItemConstructorOptions,
  MenuItem,
  autoUpdater,
  globalShortcut,
} from 'electron';
import { release } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { update } from './update';
// import path from 'path';
import * as fs from 'fs/promises';

// // Импортируйте необходимые типы из electron-updater
// import { autoUpdater, UpdateInfo, ProgressInfo } from 'electron-updater';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '../');
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist');
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.mjs');
// const preload= fileURLToPath(new URL('../preload/index.mjs', import.meta.url)) /
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, 'index.html');

// Функция для вывода информации о лицензии и программе

// Шаблон меню
// Функция для вывода информации о программе
function showAboutInfo() {
  const message = `
    Program: ${app.getName().toUpperCase()}
    Version: ${app.getVersion()}    
   
  `;
  dialog.showMessageBox({
    type: 'info',
    buttons: ['OK'],
    title: 'About',
    message: message,
  });
}

// license: PROPRIETARY

// Information: BAMOS is a software program designed to organize and manage the production processes of an aircraft repair facility. The program is specifically tailored to meet the unique needs of the aviation industry, providing a comprehensive solution for managing the repair and maintenance of aircraft.

// The BAMOS program offers a range of features that enable users to streamline their production processes, improve efficiency, and reduce costs. The program includes tools for managing inventory, scheduling maintenance and repair work, tracking parts and materials, and generating reports and analytics.

// One of the key benefits of the BAMOS program is its ability to integrate with other systems and software used in the aviation industry. This allows for seamless data transfer and communication between different departments and teams, improving overall productivity and reducing the risk of errors or miscommunications.

// Overall, the BAMOS program is an essential tool for any aircraft repair facility looking to optimize their production processes and improve their bottom line. With its comprehensive features and user-friendly interface, the program is a valuable asset for any organization in the aviation industry.
// Функция для проверки обновлений
function checkForUpdates() {
  autoUpdater.checkForUpdates();
}

// Функция для перезагрузки окна
function reloadWindow() {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.reload();
  }
}

// Функция для изменения размера окна
function resizeWindow(width: number, height: number) {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.setSize(width, height);
  }
}
// Функция для дублирования окна
function duplicateWindow() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    let newWindow = new BrowserWindow({
      title: 'Main window',
      icon: join(process.env.VITE_PUBLIC, 'favicon.ico'),
      width: focusedWindow.getSize()[0],
      height: focusedWindow.getSize()[1],
      webPreferences: {
        preload: preload,
        // nodeIntegration: true,
        // contextIsolation: false,
      },
    });
    if (url) {
      // electron-vite-vue#298
      newWindow.loadURL(url);
      // Open devTool if the app is not packaged
      newWindow.webContents.openDevTools();
    } else {
      newWindow.loadFile(indexHtml);
    }
  }
}
// Функция для переключения полноэкранного режима
function toggleFullScreen() {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.setFullScreen(!win.isFullScreen());
  }
}

// Функция для уменьшения окна
function minimizeWindow() {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.minimize();
  }
}

// Функция для закрытия окна
function closeWindow() {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.close();
  }
}

// Функция для открытия ссылки в браузере
function openExternal(url: string) {
  shell.openExternal(url);
}

// Шабон меню
const template: Electron.MenuItemConstructorOptions[] = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Exit',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          app.quit();
        },
      },
      {
        label: 'Print',
        accelerator: 'CmdOrCtrl+P',
        click: () => {
          const win = BrowserWindow.getFocusedWindow();
          // Вызываем стандартное окно печати
          if (win) {
            win.webContents.print();
          }
        },
      },
    ],
  },
  // {
  //   label: 'Edit',
  //   submenu: [
  //     { role: 'undo' },
  //     { role: 'redo' },
  //     { type: 'separator' },
  //     { role: 'cut' },
  //     { role: 'copy' },
  //     { role: 'paste' },
  //     { role: 'delete' },
  //     { role: 'selectAll' }
  //   ]
  // },

  {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Developer Tools',
        accelerator: 'CmdOrCtrl+Shift+I',
        click: () => {
          const win = BrowserWindow.getFocusedWindow();
          if (win) {
            win.webContents.toggleDevTools();
          }
        },
      },
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: reloadWindow,
      },
      {
        label: 'Duplicate Window',
        accelerator: 'CmdOrCtrl+D',
        click: duplicateWindow,
      },
      {
        label: 'Actual Size',
        click: () => {
          const win = BrowserWindow.getFocusedWindow();
          if (win) {
            win.webContents.setZoomFactor(1);
          }
        },
      },
      {
        label: 'Zoom In',
        accelerator: 'CmdOrCtrl+=',
        role: 'zoomIn',
      },
      {
        label: 'Zoom Out',
        accelerator: 'CmdOrCtrl+-',
        role: 'zoomOut',
      },
      {
        label: 'Toggle Full Screen',
        accelerator: 'CmdOrCtrl+F',
        click: toggleFullScreen,
      },
    ],
  },
  {
    label: 'Window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        click: minimizeWindow,
      },

      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        click: closeWindow,
      },
    ],
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click: showAboutInfo,
      },
      // {
      //   label: 'Check for Updates',
      //   click: checkForUpdates
      // },
      // {
      //   label: 'Open Website',
      //   click: () => {
      //     openExternal('https://example.com'); // Замените на ваш URL
      //   }
      // }
    ],
  },
];

// Создаем меню из шаблона
const menu = Menu.buildFromTemplate(template);

// Устаавливаем меню приложения
Menu.setApplicationMenu(menu);
async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload: preload,
      nodeIntegration: false,
      contextIsolation: true,
      plugins: true,

      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  });

  if (url) {
    // electron-vite-vue#298
    win.loadURL(url);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  // Test actively push message to the Electron-Renderer
  // win.webContents.on('did-finish-load', () => {
  //   win?.webContents.send('main-process-message', new Date().toLocaleString());
  // });

  // // Make all links open with the browser, not with the application
  // win.webContents.setWindowOpenHandler(({ url }) => {
  //   if (url.startsWith('https:')) shell.openExternal(url);
  //   return { action: 'deny' };
  // });

  // Apply electron-updater
  update(win);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  win = null;
  if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url

ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    icon: join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      plugins: true,
    },
  });

  // Добавляем обработчик горячих клавиш для нового окна
  childWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.key.toLowerCase() === 'p') {
      event.preventDefault();
      childWindow.webContents.print();
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});

ipcMain.handle('open-directory-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  return result;
});

ipcMain.handle('save-file', async (_, filePath: string, data: Uint8Array) => {
  await fs.writeFile(filePath, Buffer.from(data));
});

ipcMain.handle('open-path', async (_, path) => {
  try {
    await shell.openPath(path);
  } catch (error) {
    console.error('Ошибка при открытии пути:', error);
    throw error;
  }
});

// Добавьте новый обработчик для открытия PDF
ipcMain.handle('open-pdf', async (_, pdfData: Uint8Array, fileName: string) => {
  const pdfWindow = new BrowserWindow({
    width: 1024,
    height: 800,
    webPreferences: {
      plugins: true,
      webSecurity: false,
    },
  });

  // Используем переданное имя файла
  const tempPath = join(app.getPath('temp'), fileName);
  await fs.writeFile(tempPath, Buffer.from(pdfData));

  // Загружаем PDF
  pdfWindow.loadURL(`file://${tempPath}`);

  // Очистка при закрытии
  pdfWindow.on('closed', async () => {
    try {
      await fs.unlink(tempPath);
    } catch (error) {
      console.error('Error removing temp file:', error);
    }
  });
});

// ... existing imports ...

ipcMain.handle('open-tab-window', async (_, { tabId, tabTitle }) => {
  const childWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: tabTitle,
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (app.isPackaged) {
    await childWindow.loadFile(indexHtml, {
      hash: `/tab/${tabId}`,
    });
  } else {
    const url = `http://${process.env.VITE_DEV_SERVER_HOST}:${process.env.VITE_DEV_SERVER_PORT}`;
    await childWindow.loadURL(`${url}#/tab/${tabId}`);
    childWindow.webContents.openDevTools();
  }

  return childWindow.id;
});

// Для коммуникации между окнами
ipcMain.handle('send-tab-data', (_, windowId: number, data: any) => {
  const window = BrowserWindow.fromId(windowId);
  if (window) {
    window.webContents.send('tab-data-update', data);
  }
});
// ipcMain.handle('check-update', () => {
//   // Логика проверки обновлений
// });

// ipcMain.handle('start-download', () => {
//   // Замените на правильный метод из autoUpdater
//   autoUpdater.downloadUpdate();
// });

// ipcMain.handle('quit-and-install', () => {
//   autoUpdater.quitAndInstall();
// });

// // Настройка автообновления
// autoUpdater.on('update-available', (info: UpdateInfo) => {
//   win?.webContents.send('update-can-available', info);
// });

// autoUpdater.on('error', (error: Error) => {
//   win?.webContents.send('update-error', error);
// });

// autoUpdater.on('download-progress', (progressObj: ProgressInfo) => {
//   win?.webContents.send('download-progress', progressObj);
// });

// autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
//   win?.webContents.send('update-downloaded', info);
// });

let windows = new Map<number, BrowserWindow>();

ipcMain.handle(
  'open-window',
  async (
    event,
    options: {
      route: string;
      title: string;
      width?: number;
      height?: number;
      modal?: boolean;
      data?: any;
    }
  ) => {
    const parentWindow = BrowserWindow.fromWebContents(event.sender);

    const childWindow = new BrowserWindow({
      width: options.width || 800,
      height: options.height || 600,
      // parent: parentWindow,
      modal: options.modal ?? true,
      title: options.title,
      webPreferences: {
        preload, // используем тот же preload файл
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Добавляем query параметр для идентификации формы
    const formQuery = `?form=${options.route}`;

    if (process.env.VITE_DEV_SERVER_URL) {
      await childWindow.loadURL(`${url}${formQuery}`);
    } else {
      await childWindow.loadFile(indexHtml, {
        search: formQuery,
      });
    }

    // Сохраняем окно в Map
    const windowId = childWindow.id;
    windows.set(windowId, childWindow);

    // Отправляем данные в новое окно
    childWindow.webContents.send('window-data', {
      windowId,
      formType: options.route,
      ...options.data,
    });

    // Очистка при закрытии
    childWindow.on('closed', () => {
      windows.delete(windowId);
    });

    return windowId;
  }
);

ipcMain.handle('submit-window-form', (event, data) => {
  const childWindow = BrowserWindow.fromWebContents(event.sender);
  if (!childWindow) return;

  const parentWindow = childWindow.getParentWindow();
  if (!parentWindow) return;

  parentWindow.webContents.send('window-submit', data);
});

ipcMain.handle('close-current-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    window.close();
  }
});

ipcMain.handle('on-window-close', (event, callback) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    window.on('close', () => {
      event.sender.send('window-close');
    });
  }
});