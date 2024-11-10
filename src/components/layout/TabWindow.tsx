// // @ts-nocheck
// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';

// const TabWindow: React.FC = () => {
//   const { tabId } = useParams();
//   const [tabInfo, setTabInfo] = useState<any>(null);

//   useEffect(() => {
//     const handleTabInfo = (_: any, info: any) => {
//       setTabInfo(info);
//     };

//     window.electronAPI.on('tab-info', handleTabInfo);

//     return () => {
//       window.electronAPI.removeAllListeners('tab-info');
//     };
//   }, []);

//   if (!tabInfo) return null;

//   // Используем существующую функцию getContentByKey для рендера содержимого
//   return getContentByKey(tabInfo.content);
// };

// export default TabWindow;
