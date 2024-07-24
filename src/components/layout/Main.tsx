import { Button, Layout, Result, Space } from 'antd';
import { Content, Footer, Header } from 'antd/es/layout/layout';
import Auth from '@/components/auth/Auth';

import { useTypedSelector } from '@/hooks/useTypedSelector';
import React, { FC } from 'react';

import BaseLayout from './BaseLayout';
import { RouteNames } from '@/router';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Main: FC = () => {
  const { isAuth } = useTypedSelector((state) => state.auth);
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      {!isAuth ? (
        <Layout style={{ height: '100%', overflow: 'hidden' }}>
          <Header
            className="flex justify-between my-0 px-0"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <Space
              onClick={() => navigate(RouteNames.HOME)}
              className="text-xl cursor-pointer  px-3 first-line:align-middle  uppercase  text-gray-500"
            >
              407APP
            </Space>
          </Header>
          <Layout>
            <Content style={{ flex: 1, overflow: 'hidden' }}>
              <Routes>
                <Route element={<Auth />} path={RouteNames.LOGIN} />
                <Route
                  element={
                    <Result
                      style={{ height: '100%', overflow: 'hidden' }}
                      status="403"
                      subTitle={`${t('Sorry, you are not authorized.')}`}
                      extra={
                        <Button
                          onClick={() => navigate(RouteNames.LOGIN)}
                          type="primary"
                        >
                          {`${t('LOG IN')}`}
                        </Button>
                      }
                    />
                  }
                  path={'*'}
                />
              </Routes>
            </Content>
          </Layout>

          <Footer
            style={{
              textAlign: 'center',
              position: 'sticky',
              bottom: '0',
            }}
          >
            {t(`©2024 Created by Kavalchuk D.`)}
          </Footer>
        </Layout>
      ) : (
        <BaseLayout />
      )}
    </div>
  );
};

export default Main;
