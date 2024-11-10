// import React, { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';

// interface ElectronWindowProps {
//   children: React.ReactNode;
//   onSubmit?: (data: any) => void;
//   onCancel?: () => void;
//   initialData?: any;
//   width?: number;
//   height?: number;
// }

// const ElectronWindow: React.FC<ElectronWindowProps> = ({
//   children,
//   onSubmit,
//   onCancel,
//   initialData
// }) => {
//   const [data, setData] = useState(initialData);
//   const { t } = useTranslation();

//   useEffect(() => {
//     // Получаем данные из главного окна
//     window.electronAPI.onWindowData((_, windowData) => {
//       setData(windowData);
//     });

//     // Слушаем команду закрытия
//     window.electronAPI.onWindowClose(() => {
//       onCancel?.();
//       window.electronAPI.closeCurrentWindow();
//     });
//   }, []);

//   const handleSubmit = async (formData: any) => {
//     if (onSubmit) {
//       await onSubmit(formData);
//     }
//     window.electronAPI.submitWindowForm(formData);
//     window.electronAPI.closeCurrentWindow();
//   };

//   if (!data) return null;

//   return (
//     <div className="p-4">
//       {React.Children.map(children, child => {
//         if (React.isValidElement(child)) {
//           return React.cloneElement(child, {
//             ...child.props,
//             onSubmit: handleSubmit,
//             initialData: data,
//           });
//         }
//         return child;
//       })}
//     </div>
//   );
// };

// export default ElectronWindow;
