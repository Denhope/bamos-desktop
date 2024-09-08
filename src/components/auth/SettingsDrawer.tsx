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
import { useAppDispatch } from '@/hooks/useTypedSelector';
import AuthService from '@/services/authService';
import { RouteNames } from '@/router';
import { authSlice } from '@/store/reducers/AuthSlice';
import LanguageSelector from '@/components/shared/LanguageSelector';
import { useTranslation } from 'react-i18next';
import NotificationListener from './NotificationListener';
import SubscriptionManager from './SubscriptionManager'; // Импортируем компонент SubscriptionManager

interface TSettingsDrawerProps {
  open: boolean;
  setOpen: (open: any) => void;
}

const SettingsDrawer: FC<TSettingsDrawerProps> = ({ open, setOpen }) => {
  const dispatch = useAppDispatch();
  const history = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('settings'); // Добавляем состояние для активного таба

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

          {/* <Button className="w-full  text-start  border-none hover:bg-gray-200">
            <StarOutlined /> My Tasks
          </Button> */}
          {/* <Button className="w-full  text-start  border-none hover:bg-gray-200">
            <FieldTimeOutlined /> Time logging
          </Button> */}
          <Button
            className="w-full  text-left   border-none hover:bg-gray-200"
            onClick={() => setActiveTab('notifications')} // Переключаем на таб уведомлений
          >
            <SettingOutlined /> Settings
          </Button>
          {/* <Button className="w-full  text-start  border-none hover:bg-gray-200">
            <UsergroupDeleteOutlined /> Bamos Support
          </Button> */}

          <UpdateElectron />

          <Divider></Divider>
          <Button
            onClick={() => {
              dispatch(authSlice.actions.setIsAuth(false));
              history(RouteNames.HOME);
              AuthService.userLogout();
            }}
            className="w-full  text-start  border-none hover:bg-gray-200"
          >
            <LogoutOutlined />
            {t('Sign Out')}
          </Button>

          {/* Добавляем табы */}
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
