// import { useState } from "react";
import UpdateElectron from "@/components/update";
import logoVite from "./assets/logo-vite.svg";
import logoElectron from "./assets/logo-electron.svg";
// import "./App.css";

// function App() {

//   return (
//     <div className="App">
//       <div className="logo-box">
//         <a
//           href="https://github.com/electron-vite/electron-vite-react"
//           target="_blank"
//         >
//           <img
//             src={logoVite}
//             className="logo vite"
//             alt="Electron + Vite logo"
//           />
//           <img
//             src={logoElectron}
//             className="logo electron"
//             alt="Electron + Vite logo"
//           />
//         </a>
//       </div>
//       <h1>Electron + Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Electron + Vite logo to learn more
//       </p>
//       <div className="flex-center">
//         Place static files into the<code>/public</code> folder{" "}
//         <img style={{ width: "5em" }} src="./node.svg" alt="Node logo" />
//       </div>
//     </div>
//   );
// }
// {
//   /* <UpdateElectron /> */
// }
// export default App;

import React, { FC, useCallback, useEffect, useState } from "react";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import AuthService from "@/services/authService";
import enUS from "antd/lib/locale/en_US";
import ruRU from "antd/lib/locale/ru_RU"; // Для русского
import {
  authSlice,
  setAuthUserId,
  setAuthUserName,
} from "@/store/reducers/AuthSlice";

import "./App.css";
import { ConfigProvider, Spin } from "antd";
import Main from "@/components/layout/Main";
import { useNavigate } from "react-router-dom";
import { USER_ID } from "./utils/api/http";
import { RouteNames } from "./router";

const App: FC = () => {
  const [count, setCount] = useState(0);
  const { language } = useTypedSelector((state) => state.userPreferences);
  const dispatch = useAppDispatch();
  const { currentProject } = useTypedSelector((state) => state.projects);
  const history = useNavigate();
  const [isLoading, setLoading] = useState(true);
  const authCheck = useCallback(async () => {
    if (localStorage.getItem("token")) {
      AuthService.check(USER_ID)
        .then(() => {
          dispatch(authSlice.actions.setIsAuth(true));
          dispatch(setAuthUserId(USER_ID || ""));
          dispatch(setAuthUserName(localStorage.getItem("name")));
        })
        .finally(() => {
          // dispatch(getNewUserTokens(USER_ID));
          setLoading(false);
        });
    } else {
      dispatch(authSlice.actions.setIsAuth(false));
      history(`${RouteNames.HOME}`);
      setLoading(false);
    }
  }, [setAuthUserId]);

  useEffect(() => {
    authCheck();
  }, [authCheck]);

  return (
    <div className="App">
      <ConfigProvider locale={language === "ru" ? ruRU : enUS}>
        <Main></Main>
        {/* MAIN */}
    
      </ConfigProvider>
    </div>
  );
};

export default App;
