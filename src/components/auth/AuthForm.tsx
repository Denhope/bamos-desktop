import React, { FC } from 'react';
import { Button, Checkbox, Form, Input, Spin } from 'antd';
import toast, { Toaster } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { RouteNames } from '@/router';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import {
  getAllAplication,
  getAllInstruments,
  getAllMaterials,
  getAllTasks,
  login,
  registration,
  fetchAllProjects,
  getAllPanels,
  getAllZones,
  getInspectionScope,
} from '@/utils/api/thunks';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import logoImage from '/src/assets/img/logoAmarez.jpg';

import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { useTranslation } from 'react-i18next';
const AuthForm: FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const history = useNavigate();
  const isLogin = location.pathname === RouteNames.LOGIN;
  // const isLogin = location.pathname === RouteNames.HOME;
  const { isLoading } = useTypedSelector((state) => state.auth);
  const onFinish = async (values: any) => {
    // console.log('SUCCESS:', values);
    if (isLogin) {
      const result = await dispatch(login(values));
      if (result.meta.requestStatus === 'fulfilled') {
        history(RouteNames.HOME);

        localStorage.setItem('userName', values.email);
        // localStorage.setItem('name', values.name);
      } else {
        toast.error('Неверный логин или пароль!');
      }
    } else {
      const result = await dispatch(registration(values));
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Регистрация прошла успешно!');
        history(RouteNames.LOGIN);
      } else {
        toast.error('Не удалось создать нового пользователя!');
      }
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };
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
    <>
      <LoginForm
        logo={logoImage}
        title="НАЗВАНИЕ"
        subTitle="система управления производством"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
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
};

export default AuthForm;
