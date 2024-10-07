import { OpenDialogReturnValue } from 'electron/main';
import { ProgressInfo } from 'electron-updater';

declare global {
  interface Window {
    electronAPI: {
      openPath: (path: string) => Promise<void>
      openDirectoryDialog: () => Promise<OpenDialogReturnValue>;
      saveFile: (filePath: string, data: Uint8Array) => Promise<void>;
      onUpdateCanAvailable: (callback: (event: any, info: any) => void) => void;
      onUpdateError: (callback: (event: any, error: any) => void) => void;
      onDownloadProgress: (callback: (event: any, progress: any) => void) => void;
      onUpdateDownloaded: (callback: (event: any, info: any) => void) => void;
      removeAllListeners: (channel: string) => void;
    }
    ///
    
    ipcRenderer: {
      invoke(channel: string, ...args: any[]): Promise<any>;
      on(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void): void;
      off(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void): void;
    }
  }
}

interface VersionInfo {
  version: string;
  newVersion: string;
  update: boolean;
}

interface ErrorType {
  message: string;
}

////
interface Window {
  electronAPI: {
    saveFile(filePath: string, pdfBytes: Uint8Array): unknown
    openDirectoryDialog: () => Promise<Electron.OpenDialogReturnValue>
  }
}

export {};