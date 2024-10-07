import { useState } from 'react';
import { Spin } from 'antd';
import { notification } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { RouteNames } from '@/router';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import logoImage from '/src/assets/img/logo.jpg';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { useTranslation } from 'react-i18next';
import AuthService from '@/services/authService';
import { authSlice, setAuthUserCompany, setAuthUserId, setAuthUserName, setAuthUserPermissions, setAuthUserRole } from '@/store/reducers/AuthSlice';
import { COMPANY_ID, USER_ID, PERMISSIONS, setCompanyId, setUserId, setPermissions } from '@/utils/api/http';
import { connectSocket } from '@/store/reducers/WebSocketSlice';
import { Toaster } from 'react-hot-toast';

function AuthForm() {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLogin = location.pathname === RouteNames.LOGIN;
  const { isLoading } = useTypedSelector((state) => state.auth);

  const handleFinish = async (values: { email: string; password: string }) => {
    if (isLogin) {
      try {
        const result = await AuthService.login(values.email, values.password);
        if (result) {       
          console.log('Авторизация успешна');
          dispatch(authSlice.actions.setIsAuth(true));
          console.log(result);
          
          // Сохраняем и устанавливаем COMPANY_ID
          const companyId = result.data.companyID;
          setCompanyId(companyId);
          dispatch(setAuthUserCompany(companyId));
          
          // Сохраняем и устанавливаем USER_ID
          const userId = result.data.userId;
          setUserId(userId);
          dispatch(setAuthUserId(userId));
          
          // Сохраняем и устанавливаем PERMISSIONS
          const permissions = result.data.permissions;
          setPermissions(permissions);
          dispatch(setAuthUserPermissions(permissions));
          
          // Устанавливаем остальные данные пользователя
          dispatch(setAuthUserName(result.data.name));
          dispatch(setAuthUserRole(result.data.role));
          
          // Устанавливаем соединение сокетов
          dispatch(connectSocket(userId));
          
          // Проверяем наличие необходимых данных перед переходом
          if (companyId && userId && permissions) {
            console.log('Все необходимые данные получены, переход на главную страницу');
            navigate(RouteNames.HOME);
          } else {
            console.error('Не все необходимые данные получены');
            notification.error({
              message: 'Ошибка',
              description: 'Ошибка при получении данных пользователя',
            });
          }
        } else {
          notification.error({
            message: 'Ошибка',
            description: 'Неверный логин или пароль!',
          });
        }
      } catch (error) {
        console.error('Ошибка при авторизации:', error);
        notification.error({
          message: 'Ошибка',
          description: 'Произошла ошибка при авторизации',
        });
      }
    } else {
      // Логика для регистрации
      console.log('Регистрация успешна, переход на главную страницу');
      navigate(RouteNames.HOME);
      dispatch(authSlice.actions.setIsAuth(true));
    }
  };

  const handleFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  if (isLoading) {
    return (
      <Spin
        style={{ height: '70vh' }}
        className="flex flex-col items-center justify-center my-auto"
        tip="Loading"
        size="large"
      />
    );
  }

  return (
    <>
      <LoginForm
        logo={logoImage}
        title="BAMOS"
        subTitle="bamos"
        onFinish={handleFinish}
        onFinishFailed={handleFinishFailed}
        autoComplete="off"
        submitter={{
          searchConfig: {
            submitText: t('LOG IN'),
          },
        }}
      >
        <>
          <ProFormText
            name="email"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined className={'prefixIcon'} />,
            }}
            placeholder={'login'}
            rules={[
              {
                required: true,
                message: 'enter login',
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={'prefixIcon'} />,
            }}
            placeholder={'password'}
            rules={[
              {
                required: true,
                message: 'enter password',
              },
            ]}
          />
        </>
      </LoginForm>

      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default AuthForm;