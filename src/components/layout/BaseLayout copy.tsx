import React, { useEffect, useState } from 'react';
import Clock from 'react-live-clock';
import LiveClock from 'react-live-clock';

import {
  FieldTimeOutlined,
  ProjectOutlined,
  ToolOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  ShoppingCartOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Input,
  MenuProps,
  Modal,
  Result,
  Select,
  Space,
} from 'antd';
import { Layout, Menu, theme } from 'antd';

import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { RouteNames } from '@/router';

import { useTypedSelector } from '@/hooks/useTypedSelector';

import MaintenanceBase from './maintenance/base/MaintenanceBase';
import MaterialsStore from './store/StoresMaterials';
import SettingsDrawer from '@/components/auth/SettingsDrawer';
import Home from '@/components/layout/Home';
import WPGeneration from './planning/WPGeneration/WPGeneration';
import MaintenanceLine from './maintenance/base/MaintenanceLine';
import MaintenanceMTX from './maintenance/mtx/MaintenanceMTX';
import { useTranslation } from 'react-i18next';
import HomeWEB from './HomeWEB';
import { ModalForm, ProCard, ProFormItem } from '@ant-design/pro-components';
import { MenuItem, filterAPNByRole, getItem } from '@/services/utilites';
import APNTable from '@/components/layout/APNTable';
import UTCClock from '../shared/UTCClock';
import { ipcRenderer } from 'electron';
import ConnectionIndicator from '../shared/ConnectionIndicator';
import SupportRequestButton from '../SupportRequestButton';
import SupportRequestAdministration from '../supportRequestAdministration/SupportRequestAdministration';
import ApiSwitcher from './ApiSwitcher';
import TaskAdministration from '@/modules/TaskAdministration/TaskAdministration';
import AircraftTypes from '@/modules/AircraftTypes';
import AircraftRegistration from '@/modules/AircraftRegistration';

const { Header, Content, Footer, Sider } = Layout;

const BaseLayout: React.FC = () => {
  const { t } = useTranslation();

  const { user } = useTypedSelector((state) => state.auth);

  // Добавляем обработчик для Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && selectedSingleAPN) {
      setSecectedAPN(selectedSingleAPN);
      setIsModalOpen(false);
      setValue('');
    }
  };

  const APN = [
    {
      APNNBR: '01',
      moduleNumber: '100',
      descriptions: `${t(`ADMINISTRATION`)}`,
      route: RouteNames.USER_ADMINISTRATION,
    },
    {
      APNNBR: '02',
      moduleNumber: '110',
      descriptions: `${t(`PART ADMINISTRATION`)}`,
      route: RouteNames.PART_ADMINISTRATIONS_NEW,
    },
    {
      APNNBR: '03',
      moduleNumber: '120',
      descriptions: `${t(`WP ADMINISTRATION`)}`,
      route: RouteNames.WP_ADMINISTRATION,
    },
    {
      APNNBR: '04',
      moduleNumber: '130',
      descriptions: `${t(`PROJECT ADMINISTRATION`)}`,
      route: RouteNames.PROJECT_ADMINISTRATION,
    },
    {
      APNNBR: '05',
      moduleNumber: '140',
      descriptions: `${t(`WORKORDER ADMINISTRATION`)}`,
      route: RouteNames.WORKORDER_ADMINISTRATION,
    },
    {
      APNNBR: '06',
      moduleNumber: '150',
      descriptions: `${t(`PICKSLIP ADMINISTRATION`)}`,
      route: RouteNames.PICKSLIP_ADMINISTRATION,
    },
    {
      APNNBR: '07',
      moduleNumber: '160',
      descriptions: `${t(`RECEIVING VIEWER`)}`,
      route: RouteNames.RESERVING_TRACK,
    },
    {
      APNNBR: '08',
      moduleNumber: '170',
      descriptions: `${t(`ORDER VIEWER`)}`,
      route: RouteNames.ORDER_VIEWER_NEW,
    },
    {
      APNNBR: '09',
      moduleNumber: '180',
      descriptions: `${t(`ORDER ADMINISTRATION`)}`,
      route: RouteNames.ORDERS_ADMINISTRATION,
    },
    {
      APNNBR: '10',
      moduleNumber: '190',
      descriptions: `${t(`REQUIREMENT ADMINISTRATION`)}`,
      route: RouteNames.REQUIREMENT_ADMINISTRATION,
    },
    {
      APNNBR: '11',
      moduleNumber: '200',
      descriptions: `${t(`GOODS RECEIVING`)}`,
      route: RouteNames.GOODS_RESERVING_NEW,
    },
    {
      APNNBR: '12',
      moduleNumber: '210',
      descriptions: `${t(`PARTS TRACKING`)}`,
      route: RouteNames.PARTS_TRACKING,
    },
    {
      APNNBR: '14',
      moduleNumber: '220',
      descriptions: `${t(`STORES ADMINISTRATION`)}`,
      route: RouteNames.STORES_ADMINISTRATIONS,
    },
    {
      APNNBR: '15',
      moduleNumber: '230',
      descriptions: `${t(`STOCK INFORMATION`)}`,
      route: RouteNames.STOCK_NFORMATIONS,
    },
    {
      APNNBR: '16',
      moduleNumber: '240',
      descriptions: `${t(`PARTS TRANSFER`)}`,
      route: RouteNames.PARTS_TRANSFER,
    },
    {
      APNNBR: '17',
      moduleNumber: '250',
      descriptions: `${t(`PICKSLIP CONFIRMATION`)}`,
      route: RouteNames.PICKSLIP_CONFIRMATIONS_NEW,
    },
    {
      APNNBR: '18',
      moduleNumber: '260',
      descriptions: `${t(`CANCEL PICKSLIP`)}`,
      route: RouteNames.PICKSLIP_CANCEL,
    },
    {
      APNNBR: '19',
      moduleNumber: '270',
      descriptions: `${t(`CANCEL RECEIVING`)}`,
      route: RouteNames.CANCEL_RESERVING,
    },
    {
      APNNBR: '20',
      moduleNumber: '280',
      descriptions: `${t(`SHELF EXPIRY`)}`,
      route: RouteNames.SHELF_LIFE,
    },
    {
      APNNBR: '21',
      moduleNumber: '290',
      descriptions: `${t(`ACCESS TRACKING`)}`,
      route: RouteNames.ACCESS_TRACKING,
    },
    {
      APNNBR: '22',
      moduleNumber: '300',
      descriptions: `${t(`SUPPORT REQUEST ADMINISTRATION`)}`,
      route: RouteNames.SUPPORT_REQUEST_ADMINISTRATION,
    },
    {
      APNNBR: '23',
      moduleNumber: '310',
      descriptions: `${t(`PDF SLICER`)}`,
      route: RouteNames.PDF_SLICER,
    },
    {
      APNNBR: '24',
      moduleNumber: '320',
      descriptions: `${t(`REPORTS`)}`,
      route: RouteNames.REPORTS,
    },
    {
      APNNBR: '25',
      moduleNumber: '330',
      descriptions: `${t(`PICKSLIP VIEWER`)}`,
      route: RouteNames.KFC_VIEWER,
    },
    {
      APNNBR: '26',
      moduleNumber: '215',
      descriptions: `${t('TASK ADMINISTRATION')}`,
      route: RouteNames.AC_TASKS,
    },
    {
      APNNBR: '27',
      moduleNumber: '216',
      descriptions: `${t('A/C REGISTRATION')}`,
      route: RouteNames.AC,
    },
    {
      APNNBR: '28',
      moduleNumber: '217',
      descriptions: `${t('A/C TYPES')}`,
      route: RouteNames.AC_TYPES,
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTopKeys, setSelectedTopKeys] = useState<string[]>([]);
  const [openSettings, setOpenSettings] = useState(false);
  const { allMaterialAplicationsCount } = useTypedSelector(
    (state) => state.materialAplication
  );
  if (localStorage.getItem('role') === 'admin') {
  }

  const itemsHorisontal: MenuItem[] = [
    getItem(<>{t('Engineering')}</>, '03'),
    getItem(<>{t('Planing')}</>, '04', null, [
      getItem(
        t('Work Package Generation'),
        RouteNames.WORKPACKGEN,
        <ProjectOutlined />
      ),
      getItem(
        t('PLANNING FORECAST'),
        RouteNames.PLANNINGFORECAST,
        <ProjectOutlined />
      ),
    ]),
    getItem(<>{t('Purchasing/Components')}</>, '05'),
    getItem(<>{t('Maintenance')}</>, RouteNames.MTXT, null, [
      getItem(
        <>{t('Base Maintenance')}</>,
        RouteNames.BASE,
        <ProjectOutlined />
      ),

      getItem(
        t('Maintenance Management (MTX)'),
        RouteNames.MTXT,
        <ExclamationCircleOutlined />
      ),
    ]),
    getItem(<>{t('Stores & Logistics')}</>, RouteNames.STORE, null, [
      getItem(
        <>{t('Materials')}</>,
        RouteNames.STORE,
        <ShoppingCartOutlined />
      ),
      getItem(<>{t('TOOL')}</>, RouteNames.TOOLING, <ToolOutlined />),
      getItem(<>{t('SHELF LIFE COMPONENTS')}</>, '--', <FieldTimeOutlined />),
    ]),
  ];

  const { isAuth } = useTypedSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();
  const [openKeys, setOpenKeys] = useState(['sub1']);
  const rootSubmenuKeys = [
    'sub1',
    'sub4',
    'sub9',
    'sub12',
    'sub16',
    'sub90',
    'sub20',
    'sub21',
  ];
  const { Option } = Select;

  useEffect(() => {
    const storedSelectedTopKeys = localStorage.getItem('selectedTopKeys');
    if (storedSelectedTopKeys) {
      setSelectedTopKeys(JSON.parse(storedSelectedTopKeys));
    }
  }, []);

  const handleClick = ({ selectedKeys }: { selectedKeys: string[] }) => {
    setSelectedTopKeys(selectedKeys);
    localStorage.setItem('selectedTopKeys', JSON.stringify(selectedKeys));
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };
  const location = useLocation();
  const [selectedAPN, setSecectedAPN] = useState<any | null>(null);
  const [selectedSingleAPN, setSecectedSingleAPN] = useState(null);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === 'b' || event.key === 'и')
      ) {
        event.preventDefault();
        setIsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleChange = (value: any) => {
    const selectedItem = APN.find((apn) => apn.APNNBR === value);
    console.log('Selected APN:', selectedItem);
    if (selectedItem) {
      setSecectedAPN(selectedItem);
      console.log('Navigating to:', selectedItem.route);
      navigate(selectedItem.route);
    }
  };

  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (clickCount === 2) {
        setIsModalOpen(true);
      }
      setClickCount(0);
    }, 250);

    return () => clearTimeout(timer);
  }, [clickCount]);
  const handleClickD = () => {
    setClickCount((prev) => prev + 1);
  };
  const [isFocused, setIsFocused] = useState(false);
  const handleSearch = () => {
    setIsFocused(true);
  };
  const handleSelect = () => {
    setIsFocused(false);
    setValue('');
  };
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!isAuth && location.pathname !== RouteNames.LOGIN) {
      navigate(RouteNames.LOGIN);
    }
  }, [isAuth, navigate, location.pathname]);

  const filteredAPN = filterAPNByRole(APN, user.role);
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {location.pathname === RouteNames.WEB ? (
        <Header
          className="flex justify-between "
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          <Space onClick={() => navigate(RouteNames.HOME)}>
            <a className="text-xl  px-3 uppercase cursor-pointer text-gray-500">
              bamos
            </a>
          </Space>
          <Space>
            {isAuth && RouteNames.WEB && (
              <Space
                className="text-sm  ml-auto align-middle text-center "
                size={5}
              >
                <Menu
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.0)',
                  }}
                  onClick={({ key }) => {
                    navigate(key);
                  }}
                  onSelect={handleClick}
                  mode="horizontal"
                  items={itemsHorisontal}
                  selectedKeys={selectedTopKeys}
                />
                <Badge
                  count={
                    (localStorage.getItem('role') === 'storeMen' &&
                      allMaterialAplicationsCount &&
                      allMaterialAplicationsCount?.postponed) ||
                    null
                  }
                >
                  <Avatar
                    className="cursor-pointer "
                    onClick={() => {
                      setOpenSettings(true);
                    }}
                    shape="circle"
                    icon={<UserOutlined />}
                  />
                </Badge>
                {localStorage.getItem('firstName')}
                {localStorage.getItem('lastName')}
              </Space>
            )}
          </Space>
        </Header>
      ) : (
        <Header
          className="flex justify-between my-0 "
          style={{
            background: 'rgba(220, 220, 220, 0.4)',
          }}
        >
          <div
            onClick={() => navigate(RouteNames.HOME)}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <a className="text-xl  px-3 uppercase cursor-pointer text-gray-500">
              BAMOS
            </a>
            <ProFormItem
              label
              tooltip={`${t(`DOUBLE CLICK OPEN APN BOOK`)}`}
              className="flex justify-center align-middle my-10"
            >
              <div style={{ width: '300px' }}>
                <Select
                  allowClear
                  showSearch
                  placeholder="BAN"
                  onChange={handleChange}
                  onClick={handleClickD}
                  open={isFocused}
                  onSearch={handleSearch}
                  onSelect={handleSelect}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  value={value}
                  filterOption={(input, option) => {
                    if (option && option.children) {
                      const label = option.children.toString().toLowerCase();
                      const inputValue = input.toLowerCase();
                      return label.indexOf(inputValue) >= 0;
                    }
                    return false;
                  }}
                >
                  {filteredAPN.map((apn) => (
                    <Option key={apn.APNNBR} value={apn.APNNBR}>
                      {apn.moduleNumber} - {apn.descriptions}
                    </Option>
                  ))}
                </Select>
              </div>
            </ProFormItem>
          </div>

          <Space>
            {isAuth && (
              <>
                <Space
                  className="text-sm  ml-auto align-middle text-center"
                  size={5}
                >
                  <Badge
                    count={
                      (localStorage.getItem('role') === 'storeMen' &&
                        allMaterialAplicationsCount &&
                        allMaterialAplicationsCount?.postponed) ||
                      null
                    }
                  >
                    <Avatar
                      className="cursor-pointer"
                      onClick={() => {
                        setOpenSettings(true);
                      }}
                      shape="circle"
                      icon={<UserOutlined />}
                    />
                  </Badge>
                  {localStorage.getItem('firstName')}
                  {localStorage.getItem('lastName')}
                </Space>
              </>
            )}
          </Space>
        </Header>
      )}

      <Layout>
        <Content style={{}}>
          <Routes>
            <Route
              path={RouteNames.HOME}
              element={<Home apnRoute={selectedAPN} />}
            />
            <Route
              path={RouteNames.AC_TASKS}
              element={<TaskAdministration isFilterCollapsed={false} />}
            />
            <Route
              element={<SupportRequestAdministration />}
              path={RouteNames.SUPPORT_REQUEST_ADMINISTRATION}
            />
            <Route
              element={
                <Result
                  style={{ height: '65vh' }}
                  className="flex flex-col items-center justify-center"
                  status="404"
                  title="404"
                  subTitle="Sorry, the page you visited does not exist."
                />
              }
              path={'*'}
            />
            <Route path={RouteNames.AC_TYPES} element={<AircraftTypes />} />
            <Route path={RouteNames.AC} element={<AircraftRegistration />} />
          </Routes>
        </Content>
        <ModalForm
          onFinish={async () => {
            setSecectedAPN(selectedSingleAPN);
            setIsModalOpen(false);
          }}
          onOpenChange={setIsModalOpen}
          title={`${t(`BAN BOOK`)}`}
          open={isModalOpen}
          width={'30vw'}
        >
          <ProCard
            className="flex mx-auto justify-center align-middle"
            style={{}}
          >
            <APNTable
              data={filteredAPN}
              onRowClick={function (record: any, rowIndex?: any): void {
                setSecectedAPN(record);
                setIsModalOpen(false);
              }}
              onRowSingleClick={function (record: any, rowIndex?: any): void {
                setSecectedSingleAPN(record);
              }}
            ></APNTable>
          </ProCard>
        </ModalForm>
      </Layout>

      <Footer
        className="mt-0 pt-0 gap-5 flex items-center justify-between"
        style={{
          display: 'flex',
          alignItems: 'center',
          position: 'sticky',
          bottom: '0',
          width: '100%',
        }}
      >
        <div className="flex-1 text-center">
          {t('©2024 Created by Kavalchuk D.')}
        </div>
        <div className="flex items-center gap-4">
          <UTCClock />
          <ConnectionIndicator />
          <ApiSwitcher />
          <SupportRequestButton />
        </div>
      </Footer>

      <SettingsDrawer
        open={openSettings}
        setOpen={setOpenSettings}
      ></SettingsDrawer>
    </Layout>
  );
};

export default BaseLayout;
