// useAuthCheck.ts (Custom Hook)
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import AuthService from '@/services/authService';
import WebSocketService from '@/services/WebSocketService';
import { notification } from 'antd';
import {
  authSlice,
  setAuthUserId,
  setAuthUserName,
  setAuthUserPermissions,
  setAuthUserRole,
} from '@/store/reducers/AuthSlice';
import { useGlobalState } from '@/components/woAdministration/GlobalStateContext';
import { RouteNames } from '@/router';
import { useNavigate } from 'react-router-dom';
import { USER_ID, ROLE, PERMISSIONS } from './http';

const useAuthCheck = () => {
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

        USER_ID && WebSocketService.connect(USER_ID, token);
        WebSocketService.subscribeToNotifications(
          (data: { message: string; timestamp: string }) => {
            const newNotification = {
              _id: '',
              userId: USER_ID,
              message: data.message,
              timestamp: new Date(data.timestamp).toISOString(),
              isRead: false,
            };

            if (notificationsEnabled) {
              notification.info({
                message: 'INFORMATION!!!',
                description: data.message,
                placement: 'bottomRight',
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
      }
    } else {
      dispatch(authSlice.actions.setIsAuth(false));
      dispatch(setAuthUserId(''));
      history(`${RouteNames.HOME}`);
    }
  }, [dispatch, history, notificationsEnabled]);

  useEffect(() => {
    authCheck();
  }, [authCheck]);
};

export default useAuthCheck;
