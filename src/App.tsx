
import  { FC, useCallback, useEffect, useState } from "react";
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
import { ConfigProvider  } from "antd";
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
      </ConfigProvider>
    </div>
  );
};

export default App;
