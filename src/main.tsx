import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import './index.css';

import './demos/ipc';
import { Provider } from 'react-redux';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import store, { persistor } from './store';
import { PersistGate } from 'redux-persist/integration/react';
import { GlobalStateProvider } from './components/woAdministration/GlobalStateContext';
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <GlobalStateProvider>
        <Provider store={store}>
          <I18nextProvider i18n={i18n}>
            <PersistGate loading={null} persistor={persistor}>
              <App />
            </PersistGate>
          </I18nextProvider>
        </Provider>
      </GlobalStateProvider>
    </HashRouter>
  </React.StrictMode>
);

postMessage({ payload: 'removeLoading' }, '*');
