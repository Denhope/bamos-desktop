import { Avatar, Button, Divider, Drawer, Form, Row, Space } from 'antd';
import React, { FC } from 'react';
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

interface TSettingsDrawerProps {
  open: boolean;
  setOpen: (open: any) => void;
}

const SettingsDrawer: FC<TSettingsDrawerProps> = ({ open, setOpen }) => {
  const dispatch = useAppDispatch();
  const history = useNavigate();
  const { t } = useTranslation();
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
        {' '}
        <Space direction="vertical" style={{ width: '100%' }}>
          <LanguageSelector></LanguageSelector>
          {/* <Button className="w-full  text-start  border-none hover:bg-gray-200">
            <StarOutlined /> My Tasks
          </Button>
          <Button className="w-full  text-start  border-none hover:bg-gray-200">
            <FieldTimeOutlined /> Time logging
          </Button>
          <Button className="w-full  text-start  border-none hover:bg-gray-200">
            <SettingOutlined /> Settings
          </Button>
          <Button className="w-full  text-start  border-none hover:bg-gray-200">
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
        </Space>
      </Row>
    </Drawer>
  );
};

export default SettingsDrawer;
