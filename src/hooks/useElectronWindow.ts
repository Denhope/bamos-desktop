// import { useState, useEffect } from 'react';
// import type { WindowOptions } from '@/router';

// export function useElectronWindow() {
//   const [windowData, setWindowData] = useState<any>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     const cleanup = window.electronAPI.onWindowData((_, data) => {
//       console.log('Window data received:', data);
//       setWindowData(data);
//     });

//     return () => cleanup();
//   }, []);

//   const submitWindow = async (values: any) => {
//     if (isSubmitting) return;

//     try {
//       setIsSubmitting(true);
//       console.log('Submitting window with values:', values);
//       await window.electronAPI.submitWindowForm(values);
//       await window.electronAPI.closeCurrentWindow();
//     } catch (error) {
//       console.error('Submit error:', error);
//       throw error;
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return {
//     submitWindow,
//     windowData,
//     isSubmitting
//   };
// }

// // Добавляем типы для TypeScript
// declare global {
//   interface Window {
//     electronAPI: {
//       openWindow: (options: WindowOptions) => Promise<number>;
//       closeCurrentWindow: () => Promise<void>;
//       submitWindowForm: (data: any) => Promise<void>;
//       onWindowSubmit: (callback: (event: any, data: any) => void) => () => void;
//       onWindowClose: (callback: () => void) => () => void;
//       onWindowData: (callback: (event: any, data: any) => void) => () => void;
//       removeAllListeners: (event: string) => void;
//     };
//   }
// }
