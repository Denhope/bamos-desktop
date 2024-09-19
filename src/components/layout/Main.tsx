// Main.tsx
import { Button, Layout, Result, Space } from 'antd';
import { Content, Footer, Header } from 'antd/es/layout/layout';
import Auth from '@/components/auth/Auth';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import React, { FC, useEffect } from 'react';
import BaseLayout from './BaseLayout';
import { RouteNames } from '@/router';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ConnectionIndicator from '../shared/ConnectionIndicator';

const Main: FC = () => {
  const { isAuth } = useTypedSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.log('Current location:', location.pathname);
  }, [location]);

  const handleLoginClick = () => {
    console.log('Attempting to navigate to LOGIN');
    navigate(RouteNames.LOGIN);
  };

  useEffect(() => {
    if (isAuth) {
      console.log('User is authenticated, rendering BaseLayout');
    } else {
      console.log('User is not authenticated, rendering auth routes');
    }
  }, [isAuth]);

  return (
    <div className="h-screen overflow-hidden">
      {!isAuth ? (
        <Layout className="h-full overflow-hidden">
          <Header className="flex justify-between my-0 px-0 bg-red-200">
            <Space
              onClick={() => navigate(RouteNames.HOME)}
              className="text-xl cursor-pointer px-3 uppercase text-gray-500"
            >
              BAMOS TEST
            </Space>
          </Header>
          <Layout className="flex-1 overflow-hidden">
            <Content className="flex-1 overflow-hidden">
              <Routes>
                <Route path={RouteNames.LOGIN} element={<Auth />} />
                <Route
                  path="*"
                  element={
                    <Result
                      className="h-full overflow-hidden"
                      status="403"
                      subTitle={t('Sorry, you are not authorized.')}
                      extra={
                        <Button onClick={handleLoginClick} type="primary">
                          {t('LOG IN')}
                        </Button>
                      }
                    />
                  }
                />
              </Routes>
            </Content>
          </Layout>
          <Footer className="flex items-center justify-center sticky bottom-0 p-5 bg-white">
            <div className="flex-1 text-center">
              {t('©2024 Created by Kavalchuk D.')}
            </div>
            <div className="absolute right-5">
              {/* <ConnectionIndicator /> */}
            </div>
          </Footer>
        </Layout>
      ) : (
        <BaseLayout />
      )}
    </div>
  );
};

export default Main;
