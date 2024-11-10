// import React, {
//   FC,
//   useCallback,
//   useEffect,
//   useState,
//   createContext,
// } from 'react';
// import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
// import AuthService from '@/services/authService';
// import enUS from 'antd/lib/locale/en_US';
// import ruRU from 'antd/lib/locale/ru_RU';
// import {
//   authSlice,
//   setAuthUserId,
//   setAuthUserName,
//   setAuthUserPermissions,
//   setAuthUserRole,
// } from '@/store/reducers/AuthSlice';
// import { notification, Spin, Result, Button, Layout } from 'antd';

// import './App.css';
// import { ConfigProvider } from 'antd';
// import Main from '@/components/layout/Main';
// import { useNavigate } from 'react-router-dom';
// import { PERMISSIONS, ROLE, USER_ID } from './utils/api/http';
// import { RouteNames } from './router';
// import { useGlobalState } from './components/woAdministration/GlobalStateContext';
// import { connectSocket } from './store/reducers/WebSocketSlice';
// import { checkApiConnection } from '@/utils/api/http';
// import UTCClock from '@/components/shared/UTCClock';
// import ConnectionIndicator from '@/components/shared/ConnectionIndicator';
// import ApiSwitcher from '@/components/layout/ApiSwitcher';
// import SupportRequestButton from '@/components/SupportRequestButton';

// const { Footer } = Layout;

// export const ConnectionContext = createContext({
//   isConnected: false,
//   setIsConnected: (value: boolean) => {},
// });

// const App: FC = () => {
//   const [isLoading, setLoading] = useState(true);
//   const [isConnected, setIsConnected] = useState(false);
//   const [connectionError, setConnectionError] = useState(false);
//   const { language } = useTypedSelector((state) => state.userPreferences);
//   const dispatch = useAppDispatch();
//   const { notificationsEnabled } = useGlobalState();
//   const history = useNavigate();
//   const { socket } = useTypedSelector((state) => state.socket);
//   const { isAuth, user } = useTypedSelector((state) => state.auth);

//   const authCheck = useCallback(async () => {
//     console.log('Starting authCheck');
//     const token = localStorage.getItem('token');
//     if (token && (USER_ID || user.userId)) {
//       try {
//         await AuthService.check(user.userId || USER_ID);
//         dispatch(authSlice.actions.setIsAuth(true));
//         dispatch(setAuthUserId(localStorage.getItem('userId') || ''));
//         dispatch(setAuthUserRole(localStorage.getItem('role') || ''));
//         dispatch(
//           setAuthUserPermissions(localStorage.getItem('permissions') || '')
//         );
//         dispatch(setAuthUserName(localStorage.getItem('name') || ''));

//         if (!isConnected) {
//           console.log('Connecting to WebSocket');
//           const userId = localStorage.getItem('userId');
//           if (userId) {
//             dispatch(connectSocket(userId));
//           }
//         } else {
//           console.log('WebSocket is already connected');
//         }
//       } catch (error) {
//         console.error('Authentication failed:', error);
//         dispatch(authSlice.actions.setIsAuth(false));
//         dispatch(setAuthUserId(''));
//         history(RouteNames.LOGIN);
//       } finally {
//         setLoading(false);
//       }
//     } else {
//       dispatch(authSlice.actions.setIsAuth(false));
//       dispatch(setAuthUserId(''));
//       history(RouteNames.LOGIN);
//       setLoading(false);
//     }
//   }, [dispatch, isConnected, history, user.userId]);

//   useEffect(() => {
//     console.log('Running useEffect for authCheck');
//     authCheck();
//   }, [authCheck]);

//   useEffect(() => {
//     if (socket) {
//       socket.on('connect', () => {
//         console.log('Socket reconnected, performing authCheck');
//         authCheck();
//       });

//       return () => {
//         socket.off('connect');
//       };
//     }
//   }, [socket, authCheck]);

//   useEffect(() => {
//     console.log('Running useEffect for notifications');
//     if (isConnected && socket) {
//       // Подписка на уведомления
//       const notificationHandler = (data: {
//         message: string;
//         timestamp: string;
//       }) => {
//         const newNotification = {
//           _id: '',
//           userId: USER_ID,
//           message: data?.message,
//           isRead: false,
//         };

//         if (notificationsEnabled) {
//           notification.info({
//             message: 'INFORMATION!!!',
//             description: data?.message,
//             placement: 'bottomRight',
//             duration: 0,
//           });
//         }
//       };

//       socket.on('notification', notificationHandler);

//       return () => {
//         console.log('Cleaning up notification subscription');
//         socket.off('notification', notificationHandler);
//       };
//     }
//   }, [isConnected, socket, notificationsEnabled]);

//   useEffect(() => {
//     const checkConnection = async () => {
//       try {
//         const apiConnected = await Promise.race([
//           checkApiConnection(60000),
//           new Promise((_, reject) =>
//             setTimeout(() => reject(new Error('Connection timeout')), 10000)
//           ),
//         ]);
//         setIsConnected(apiConnected as boolean);
//         setConnectionError(false);
//       } catch (error) {
//         console.error('Connection check failed:', error);
//         setIsConnected(false);
//         setConnectionError(true);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkConnection();
//     const intervalId = setInterval(checkConnection, 100000);

//     return () => clearInterval(intervalId);
//   }, []);

//   // if (isLoading) {
//   //   return (
//   //     <Spin
//   //       style={{ height: '100vh' }}
//   //       className="flex flex-col items-center justify-center"
//   //       tip="Loading"
//   //       size="large"
//   //     />
//   //   );
//   // }

//   return (
//     <div className="App">
//       <ConfigProvider locale={language === 'ru' ? ruRU : enUS}>
//         <ConnectionContext.Provider value={{ isConnected, setIsConnected }}>
//           <Main />
//         </ConnectionContext.Provider>
//       </ConfigProvider>
//     </div>
//   );
// };

// export default App;
