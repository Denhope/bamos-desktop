// @ts-nocheck

import { Avatar, Button, Divider, Drawer, Form, Row, Space, Tabs } from 'antd';
import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UpdateElectron from '@/components/update';
import {
  FieldTimeOutlined,
  LogoutOutlined,
  SettingOutlined,
  UsergroupDeleteOutlined,
  StarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import AuthService from '@/services/authService';
import { RouteNames } from '@/router';
import { authSlice } from '@/store/reducers/AuthSlice';
import LanguageSelector from '@/components/shared/LanguageSelector';
import { useTranslation } from 'react-i18next';
import NotificationListener from './NotificationListener';
import SubscriptionManager from './SubscriptionManager';
import { disconnectSocket } from '@/store/reducers/WebSocketSlice'; // Импортируем действие для отключения сокета

interface TSettingsDrawerProps {
  open: boolean;
  setOpen: (open: any) => void;
}

const SettingsDrawer: FC<TSettingsDrawerProps> = ({ open, setOpen }) => {
  const dispatch = useAppDispatch();
  const history = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('settings');
  const { socket } = useTypedSelector((state) => state.socket); // Получаем сокет из состояния Redux

  const handleLogout = () => {
    dispatch(authSlice.actions.setIsAuth(false));
    if (socket) {
      dispatch(disconnectSocket()); // Отключаем сокет
    }
    history(RouteNames.HOME);
    AuthService.userLogout();
  };

  return (
    <Drawer
      placement="right"
      size={'default'}
      onClose={() => {
        setOpen(false);
      }}
      open={open}
      title={` ${localStorage.getItem('firstName')} ${localStorage.getItem(
        'lastName'
      )}`}
    >
      <Row>
        <Space direction="vertical" style={{ width: '100%' }}>
          <LanguageSelector></LanguageSelector>

          <Button
            className="w-full  text-left   border-none hover:bg-gray-200"
            onClick={() => setActiveTab('notifications')}
          >
            <SettingOutlined /> Settings
          </Button>

          <UpdateElectron />

          <Divider></Divider>
          <Button
            onClick={handleLogout}
            className="w-full  text-start  border-none hover:bg-gray-200"
          >
            <LogoutOutlined />
            {t('Sign Out')}
          </Button>

          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            items={[
              {
                key: 'settings',
                label: 'Subscription',
                children: (
                  <div className="h-[60vh]">
                    <SubscriptionManager
                      userId={localStorage.getItem('userId')}
                    />
                  </div>
                ),
              },
              {
                key: 'notifications',
                label: 'Notifications History',
                children: (
                  <div className="h-[61vh] overflow-auto">
                    <NotificationListener
                      userId={localStorage.getItem('userId')}
                    />{' '}
                  </div>
                ),
              },
            ]}
          />
        </Space>
      </Row>
    </Drawer>
  );
};

export default SettingsDrawer;