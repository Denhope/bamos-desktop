import { contextBridge, ipcRenderer } from 'electron';

// Explicitly annotate the parameter types for withPrototype
function withPrototype(obj: Record<string, any>): Record<string, any> {
  const protos = Object.getPrototypeOf(obj);

  for (const [key, value] of Object.entries(protos)) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) continue;

    if (typeof value === 'function') {
      obj[key] = function (...args: any[]) {
        return value.call(obj, ...args);
      };
    } else {
      obj[key] = value;
    }
  }
  return obj;
}

// Explicitly annotate the return type for domReady
function domReady(
  condition: DocumentReadyState[] = ['complete', 'interactive']
): Promise<boolean> {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}

// Explicitly annotate the parameter types for safeDOM.append and safeDOM.remove
const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement): HTMLElement | null {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child);
    }
    return null;
  },
  remove(parent: HTMLElement, child: HTMLElement): HTMLElement | null {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child);
    }
    return null;
  },
};

// Explicitly annotate the return type for useLoading
type LoadingMethods = {
  appendLoading: () => void;
  removeLoading: () => void;
};

function useLoading(): LoadingMethods {
  const className = `loaders-css__letter-spin`;
  const styleContent = `
  @keyframes spinner {
    0% {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg) scale(1.2);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  .${className} {
    display: inline-block;
    width: 50px;
    height: 50px;
    border: 3px solid rgba(255, 255, 255, 0.3); /* Первоначальный цвет границы */
    border-top-color: #007BFF; /* Светло-синий цвет для верхней границы */
    border-radius: 50%;
    animation: spinner 1s ease-in-out infinite;
    will-change: transform;
  }
  .app-loading-wrap {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #282c34;
    z-index: 9;
  }
  `;
  // const styleContent = `
  // @keyframes spinner {
  //   0% { transform: rotate(0deg); }
  //   100% { transform: rotate(360deg); }
  // }
  // .${className} {
  //   display: inline-block;
  //   width: 50px;
  //   height: 50px;
  //   border: 3px solid rgba(255,255,255,.3);
  //   border-radius: 50%;
  //   border-top-color: #fff;
  //   animation: spinner 1s ease-in-out infinite;
  //   will-change: transform;
  // }
  // .app-loading-wrap {
  //   position: fixed;
  //   top: 0;
  //   left: 0;
  //   width: 100vw;
  //   height: 100vh;
  //   display: flex;
  //   align-items: center;
  //   justify-content: center;
  //   background: #282c34;
  //   z-index: 9;
  // }
  // `;
  const oStyle = document.createElement('style');
  const oDiv = document.createElement('div');

  oStyle.id = 'app-loading-style';
  oStyle.innerHTML = styleContent;
  oDiv.className = 'app-loading-wrap';
  oDiv.innerHTML = `<div class="${className}">B</div>`;

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle);
      safeDOM.append(document.body, oDiv);
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle);
      safeDOM.remove(document.body, oDiv);
    },
  };
}

// Explicitly annotate the return type for the contextBridge.exposeInMainWorld
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel: string, data: any) => ipcRenderer.invoke(channel, data),
    on: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel);
    },
  },
});

// Explicitly annotate the return type for useLoading
const { appendLoading, removeLoading } = useLoading();

// Explicitly annotate the return type for domReady
domReady().then(appendLoading);

// Explicitly annotate the event listener for window.onmessage
window.onmessage = (ev: MessageEvent) => {
  if (ev.data.payload === 'removeLoading') {
    removeLoading();
  }
};

// Explicitly annotate the setTimeout call
setTimeout(removeLoading, 4999);

// Определяем интерфейс для опций окна
interface WindowOptions {
  route: string;
  title: string;
  width?: number;
  height?: number;
  modal?: boolean;
  data?: any;
}

// Определяем интерфейс для API окон
interface WindowAPI {
  openWindow: (options: WindowOptions) => Promise<number>;
  onWindowData: (callback: (event: any, data: any) => void) => () => void;
  onWindowSubmit: (callback: (event: any, data: any) => void) => () => void;
  submitWindowForm: (data: any) => Promise<void>;
  closeCurrentWindow: () => Promise<void>;
  onWindowClose: (callback: () => void) => () => void;
}

// Обновляем существующий electronAPI
contextBridge.exposeInMainWorld('electronAPI', {
  // ... existing methods ...

  // Методы для работы с окнами
  openWindow: (options: WindowOptions) =>
    ipcRenderer.invoke('open-window', options),

  onWindowData: (callback: (event: any, data: any) => void) => {
    ipcRenderer.on('window-data', callback);
    return () => ipcRenderer.removeListener('window-data', callback);
  },

  onWindowSubmit: (callback: (event: any, data: any) => void) => {
    ipcRenderer.on('window-submit', callback);
    return () => ipcRenderer.removeListener('window-submit', callback);
  },

  submitWindowForm: (data: any) =>
    ipcRenderer.invoke('submit-window-form', data),

  closeCurrentWindow: () => ipcRenderer.invoke('close-current-window'),

  onWindowClose: (callback: () => void) => {
    ipcRenderer.on('window-close', callback);
    return () => ipcRenderer.removeListener('window-close', callback);
  },

  // ... rest of your existing methods ...
  openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
  saveFile: (filePath: string, data: Uint8Array) =>
    ipcRenderer.invoke('save-file', filePath, data),
  openPath: (path: string) => ipcRenderer.invoke('open-path', path),
  openPdf: (pdfData: Uint8Array, fileName: string) =>
    ipcRenderer.invoke('open-pdf', pdfData, fileName),
  onUpdateCanAvailable: (callback: (event: any, info: any) => void) =>
    ipcRenderer.on('update-can-available', callback),
  onUpdateError: (callback: (event: any, error: any) => void) =>
    ipcRenderer.on('update-error', callback),
  onDownloadProgress: (callback: (event: any, progress: any) => void) =>
    ipcRenderer.on('download-progress', callback),
  onUpdateDownloaded: (callback: (event: any, info: any) => void) =>
    ipcRenderer.on('update-downloaded', callback),
  removeAllListeners: (channel: string) =>
    ipcRenderer.removeAllListeners(channel),
  openTabInWindow: (tabId: string, tabTitle: string) =>
    ipcRenderer.invoke('open-tab-window', { tabId, tabTitle }),
  onTabDataUpdate: (callback: (event: any, data: any) => void) =>
    ipcRenderer.on('tab-data-update', callback),
  sendTabData: (windowId: number, data: any) =>
    ipcRenderer.invoke('send-tab-data', windowId, data),
} as const);

// Обновляем глобальные типы
// declare global {
//   interface Window {
//     electronAPI: typeof electronAPI & WindowAPI;
//     electron: {
//       ipcRenderer: {
//         invoke(channel: string, data: any): Promise<any>;
//         on(channel: string, func: (...args: any[]) => void): void;
//         removeAllListeners(channel: string): void;
//       };
//     };
//     ipcRenderer: typeof ipcRenderer;
//   }
// }

// Add ipcRenderer exposure
contextBridge.exposeInMainWorld('ipcRenderer', withPrototype(ipcRenderer));
