import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./index.css";

import "./demos/ipc";
import { Provider } from "react-redux";
import { BrowserRouter,HashRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import store from "./store";
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </Provider>
    </HashRouter>
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");
