// import { FC, useCallback, useEffect, useState } from 'react';
// import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
// import AuthService from '@/services/authService';
// import enUS from 'antd/lib/locale/en_US';
// import ruRU from 'antd/lib/locale/ru_RU'; // Для русского
// import {
//   authSlice,
//   setAuthUserId,
//   setAuthUserName,
//   setAuthUserPermissions,
//   setAuthUserRole,
// } from '@/store/reducers/AuthSlice';
// import WebSocketService from '@/services/WebSocketService';
// import { notification } from 'antd';

// import './App.css';
// import { ConfigProvider } from 'antd';
// import Main from '@/components/layout/Main';
// import { useNavigate } from 'react-router-dom';
// import { PERMISSIONS, ROLE, USER_ID } from './utils/api/http';
// import { RouteNames } from './router';
// import enGB from 'antd/lib/locale/en_GB';
// import { useGlobalState } from './components/woAdministration/GlobalStateContext';

// const App: FC = () => {
//   const [count, setCount] = useState(0);
//   const { language } = useTypedSelector((state) => state.userPreferences);
//   const dispatch = useAppDispatch();
//   const { currentProject } = useTypedSelector((state) => state.projects);
//   const history = useNavigate();
//   const [isLoading, setLoading] = useState(true);
//   const { notificationsEnabled } = useGlobalState();

//   const authCheck = useCallback(async () => {
//     if (localStorage.getItem('token')) {
//       AuthService.check(USER_ID)
//         .then(() => {
//           dispatch(authSlice.actions.setIsAuth(true));
//           dispatch(setAuthUserId(USER_ID || ''));
//           dispatch(setAuthUserRole(ROLE || ''));
//           dispatch(setAuthUserPermissions(PERMISSIONS || ''));

//           dispatch(setAuthUserName(localStorage.getItem('name')));
//           // Подключение к WebSocket при успешной авторизации
//           const token = localStorage.getItem('token');
//           token && USER_ID && WebSocketService.connect(USER_ID, token);

//           // Подписка на уведомления
//           WebSocketService.subscribeToNotifications(
//             (data: { message: string; timestamp: string }) => {
//               const newNotification = {
//                 _id: '', // ID будет установлен на сервере
//                 userId: USER_ID,
//                 message: data.message,
//                 timestamp: new Date(data.timestamp).toISOString(), // Преобразуем дату в ISO строку
//                 isRead: false,
//               };

//               // Отображение уведомления на экране, если уведомления включены
//               if (notificationsEnabled) {
//                 notification.info({
//                   message: 'INFORMATION!!!',
//                   description: data.message,
//                   placement: 'bottomRight', // Позиция уведомления
//                   duration: 0,
//                 });
//               }
//             }
//           );
//         })
//         .finally(() => {
//           setLoading(false);
//         });
//     } else {
//       dispatch(authSlice.actions.setIsAuth(false));
//       dispatch(setAuthUserId(''));
//       history(`${RouteNames.HOME}`);
//       setLoading(false);
//     }
//   }, [setAuthUserId, notificationsEnabled]);

//   useEffect(() => {
//     authCheck();
//   }, [authCheck]);

//   return (
//     <div className="App">
//       <ConfigProvider locale={language === 'ru' ? ruRU : enUS}>
//         <Main></Main>
//       </ConfigProvider>
//     </div>
//   );
// };

// export default App;

import { FC, useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import AuthService from '@/services/authService';
import enUS from 'antd/lib/locale/en_US';
import ruRU from 'antd/lib/locale/ru_RU'; // Для русского
import {
  authSlice,
  setAuthUserId,
  setAuthUserName,
  setAuthUserPermissions,
  setAuthUserRole,
} from '@/store/reducers/AuthSlice';
import WebSocketService from '@/services/WebSocketService';
import { notification } from 'antd';

import './App.css';
import { ConfigProvider } from 'antd';
import Main from '@/components/layout/Main';
import { useNavigate } from 'react-router-dom';
import { PERMISSIONS, ROLE, USER_ID } from './utils/api/http';
import { RouteNames } from './router';
import enGB from 'antd/lib/locale/en_GB';
import { useGlobalState } from './components/woAdministration/GlobalStateContext';

const App: FC = () => {
  const [isLoading, setLoading] = useState(true);
  const { language } = useTypedSelector((state) => state.userPreferences);
  const dispatch = useAppDispatch();
  const { notificationsEnabled } = useGlobalState();
  const history = useNavigate();

  const authCheck = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await AuthService.check(USER_ID);
        dispatch(authSlice.actions.setIsAuth(true));
        dispatch(setAuthUserId(USER_ID || ''));
        dispatch(setAuthUserRole(ROLE || ''));
        dispatch(setAuthUserPermissions(PERMISSIONS || ''));
        dispatch(setAuthUserName(localStorage.getItem('name') || ''));

        // Подключение к WebSocket
        USER_ID && WebSocketService.connect(USER_ID, token);

        // Подписка на уведомления
        WebSocketService.subscribeToNotifications(
          (data: { message: string; timestamp: string }) => {
            const newNotification = {
              _id: '', // ID будет установлен на сервере
              userId: USER_ID,
              message: data.message,
              timestamp: new Date(data.timestamp).toISOString(), // Преобразуем дату в ISO строку
              isRead: false,
            };

            // Отображение уведомления на экране, если уведомления включены
            if (notificationsEnabled) {
              notification.info({
                message: 'INFORMATION!!!',
                description: data.message,
                placement: 'bottomRight', // Позиция уведомления
                duration: 0,
              });
            }
          }
        );
      } catch (error) {
        console.error('Authentication failed:', error);
        dispatch(authSlice.actions.setIsAuth(false));
        dispatch(setAuthUserId(''));
        history(`${RouteNames.HOME}`);
      } finally {
        setLoading(false);
      }
    } else {
      dispatch(authSlice.actions.setIsAuth(false));
      dispatch(setAuthUserId(''));
      history(`${RouteNames.HOME}`);
      setLoading(false);
    }
  }, [setAuthUserId, WebSocketService.isConnected(), notificationsEnabled]);

  useEffect(() => {
    authCheck();
  }, [authCheck]);

  // if (isLoading) {
  //   return <div>Loading...</div>; // Или любой другой индикатор загрузки
  // }

  return (
    <div className="App">
      <ConfigProvider locale={language === 'ru' ? ruRU : enUS}>
        <Main />
      </ConfigProvider>
    </div>
  );
};

export default App;
