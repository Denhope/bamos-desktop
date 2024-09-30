import { FC, useCallback, useEffect, useState, useMemo } from 'react';
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
import { notification, Spin } from 'antd';

import './App.css';
import { ConfigProvider } from 'antd';
import Main from '@/components/layout/Main';
import { useNavigate } from 'react-router-dom';
import { PERMISSIONS, ROLE, USER_ID } from './utils/api/http';
import { RouteNames } from './router';
import { useGlobalState } from './components/woAdministration/GlobalStateContext';
import { connectSocket } from './store/reducers/WebSocketSlice';
// Импортируем действие для подключения к WebSocket

const App: FC = () => {
  const [isLoading, setLoading] = useState(true);
  const { language } = useTypedSelector((state) => state.userPreferences);
  const dispatch = useAppDispatch();
  const { notificationsEnabled } = useGlobalState();
  const history = useNavigate();
  const { isConnected, socket } = useTypedSelector((state) => state.socket); // Получаем состояние сокета из Redux
  const { isAuth,user } = useTypedSelector((state) => state.auth);
  const authCheck = useCallback(async () => {
    console.log('Starting authCheck');
    const token = localStorage.getItem('token');
    if (token && (USER_ID||user.userId)) {
      try {
        await AuthService.check(user.userId||USER_ID);
        dispatch(authSlice.actions.setIsAuth(true));
        dispatch(setAuthUserId(localStorage.getItem('userId') || ''));
        dispatch(setAuthUserRole(localStorage.getItem('role') || ''));
        dispatch(setAuthUserPermissions(localStorage.getItem('permissions') || ''));
        dispatch(setAuthUserName(localStorage.getItem('name') || ''));

        if (!isConnected) {
          console.log('Connecting to WebSocket');
          const userId = localStorage.getItem('userId');
          if (userId) {
            dispatch(connectSocket(userId));
          }
        } else {
          console.log('WebSocket is already connected');
        }
      } catch (error) {
        console.error('Authentication failed:', error);
        dispatch(authSlice.actions.setIsAuth(false));
        dispatch(setAuthUserId(''));
        history(RouteNames.HOME);
      } finally {
        setLoading(false);
      }
    } else {
      dispatch(authSlice.actions.setIsAuth(false));
      dispatch(setAuthUserId(''));
      history(RouteNames.HOME);
      setLoading(false);
    }
  }, [dispatch,  isConnected]);

  // const memoizedAuthCheck = useMemo(() => authCheck, [authCheck]);

  useEffect(() => {
    console.log('Running useEffect for authCheck');
    authCheck();
  }, [authCheck,]);

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        console.log('Socket reconnected, performing authCheck');
        authCheck();
      });

      return () => {
        socket.off('connect');
      };
    }
  }, [socket, authCheck]);

  useEffect(() => {
    console.log('Running useEffect for notifications');
    if (isConnected && socket) {
      // Подписка на уведомления
      const notificationHandler = (data: { message: string; timestamp: string }) => {
        const newNotification = {
          _id: '', // ID будет установлен на сервере
          userId: USER_ID,
          message: data.message,
          // timestamp: new Date(data.timestamp).toISOString(), // Преобразуем дату в ISO строку
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
      };

      socket.on('notification', notificationHandler);

      // Очистка подписки при размонтировании компонента
      return () => {
        console.log('Cleaning up notification subscription');
        socket.off('notification', notificationHandler);
      };
    }
  }, [isConnected, socket, notificationsEnabled, ]);

  if (isLoading) {
    return (
      <Spin
        style={{ height: '70vh' }}
        className="flex  flex-col items-center justify-center my-auto"
        tip="Loading"
        size="large"
      ></Spin>
    );
  }

  return (
    <div className="App">
      <ConfigProvider locale={language === 'ru' ? ruRU : enUS}>
        <Main />
      </ConfigProvider>
    </div>
  );
};

export default App;