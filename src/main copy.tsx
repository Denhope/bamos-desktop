// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App';
// import { RouterProvider } from 'react-router-dom';
// import { createAppRouter } from './router';

// import './index.css';

// import './demos/ipc';
// import { Provider } from 'react-redux';
// import { I18nextProvider } from 'react-i18next';
// import i18n from './i18n';
// import store, { persistor } from './store';
// import { PersistGate } from 'redux-persist/integration/react';
// import { GlobalStateProvider } from './components/woAdministration/GlobalStateContext';

// // Создаем роутер
// const router = createAppRouter(App);

// // Рендерим приложение
// ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
//   <GlobalStateProvider>
//     <Provider store={store}>
//       <I18nextProvider i18n={i18n}>
//         <PersistGate loading={null} persistor={persistor}>
//           <RouterProvider router={router} />
//         </PersistGate>
//       </I18nextProvider>
//     </Provider>
//   </GlobalStateProvider>
// );

// postMessage({ payload: 'removeLoading' }, '*');
