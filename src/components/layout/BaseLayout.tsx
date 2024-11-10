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
  FileOutlined,
  EyeOutlined,
  OrderedListOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  SwapOutlined,
  SearchOutlined,
  ShopOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
  BarChartOutlined,
  CloseCircleOutlined,
  CheckOutlined,
  InboxOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  FileProtectOutlined,
  FilePdfOutlined,
  ScheduleOutlined,
  ShoppingOutlined,
  ImportOutlined,
  BuildOutlined,
  AlertOutlined,
  BoxPlotOutlined,
  HddOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  SecurityScanOutlined,
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
    // 1xx - Администрирование системы
    {
      APNNBR: '01',
      moduleNumber: '100',
      descriptions: `${t('ADMINISTRATION')}`,
      route: RouteNames.USER_ADMINISTRATION,
      group: 'system',
    },
    {
      APNNBR: '21',
      moduleNumber: '101',
      descriptions: `${t('ACCESS TRACKING')}`,
      route: RouteNames.ACCESS_TRACKING,
      group: 'system',
    },

    // 2xx - Управление воздушными судами
    {
      APNNBR: '27',
      moduleNumber: '200',
      descriptions: `${t('A/C REGISTRATION')}`,
      route: RouteNames.AC,
      group: 'aircraft',
    },
    {
      APNNBR: '28',
      moduleNumber: '201',
      descriptions: `${t('A/C TYPES')}`,
      route: RouteNames.AC_TYPES,
      group: 'aircraft',
    },
    {
      APNNBR: '26',
      moduleNumber: '202',
      descriptions: `${t('TASK ADMINISTRATION')}`,
      route: RouteNames.AC_TASKS,
      group: 'aircraft',
    },

    // 3xx - Управление деталями и складом
    {
      APNNBR: '02',
      moduleNumber: '300',
      descriptions: `${t('PART ADMINISTRATION')}`,
      route: RouteNames.PART_ADMINISTRATIONS_NEW,
      group: 'parts',
    },
    {
      APNNBR: '14',
      moduleNumber: '301',
      descriptions: `${t('STORES ADMINISTRATION')}`,
      route: RouteNames.STORES_ADMINISTRATIONS,
      group: 'parts',
    },
    {
      APNNBR: '15',
      moduleNumber: '302',
      descriptions: `${t('STOCK INFORMATION')}`,
      route: RouteNames.STOCK_NFORMATIONS,
      group: 'parts',
    },
    {
      APNNBR: '16',
      moduleNumber: '303',
      descriptions: `${t('PARTS TRANSFER')}`,
      route: RouteNames.PARTS_TRANSFER,
      group: 'parts',
    },
    {
      APNNBR: '12',
      moduleNumber: '304',
      descriptions: `${t('PARTS TRACKING')}`,
      route: RouteNames.PARTS_TRACKING,
      group: 'parts',
    },
    {
      APNNBR: '20',
      moduleNumber: '305',
      descriptions: `${t('SHELF EXPIRY')}`,
      route: RouteNames.SHELF_LIFE,
      group: 'parts',
    },

    // 4xx - Управление заказами
    {
      APNNBR: '08',
      moduleNumber: '400',
      descriptions: `${t('ORDER VIEWER')}`,
      route: RouteNames.ORDER_VIEWER_NEW,
      group: 'orders',
    },
    {
      APNNBR: '09',
      moduleNumber: '401',
      descriptions: `${t('ORDER ADMINISTRATION')}`,
      route: RouteNames.ORDERS_ADMINISTRATION,
      group: 'orders',
    },
    {
      APNNBR: '10',
      moduleNumber: '402',
      descriptions: `${t('REQUIREMENT ADMINISTRATION')}`,
      route: RouteNames.REQUIREMENT_ADMINISTRATION,
      group: 'orders',
    },

    // 5xx - Управление накладными
    {
      APNNBR: '06',
      moduleNumber: '500',
      descriptions: `${t('PICKSLIP ADMINISTRATION')}`,
      route: RouteNames.PICKSLIP_ADMINISTRATION,
      group: 'pickslip',
    },
    {
      APNNBR: '17',
      moduleNumber: '501',
      descriptions: `${t('PICKSLIP CONFIRMATION')}`,
      route: RouteNames.PICKSLIP_CONFIRMATIONS_NEW,
      group: 'pickslip',
    },
    {
      APNNBR: '18',
      moduleNumber: '502',
      descriptions: `${t('CANCEL PICKSLIP')}`,
      route: RouteNames.PICKSLIP_CANCEL,
      group: 'pickslip',
    },
    {
      APNNBR: '25',
      moduleNumber: '503',
      descriptions: `${t('PICKSLIP VIEWER')}`,
      route: RouteNames.KFC_VIEWER,
      group: 'pickslip',
    },

    // 6xx - Приемка товаров
    {
      APNNBR: '07',
      moduleNumber: '600',
      descriptions: `${t('RECEIVING VIEWER')}`,
      route: RouteNames.RESERVING_TRACK,
      group: 'receiving',
    },
    {
      APNNBR: '11',
      moduleNumber: '601',
      descriptions: `${t('GOODS RECEIVING')}`,
      route: RouteNames.GOODS_RESERVING_NEW,
      group: 'receiving',
    },
    {
      APNNBR: '19',
      moduleNumber: '602',
      descriptions: `${t('CANCEL RECEIVING')}`,
      route: RouteNames.CANCEL_RESERVING,
      group: 'receiving',
    },

    // 7xx - Управление проектами и работами
    {
      APNNBR: '03',
      moduleNumber: '700',
      descriptions: `${t('WP ADMINISTRATION')}`,
      route: RouteNames.WP_ADMINISTRATION,
      group: 'projects',
    },
    {
      APNNBR: '04',
      moduleNumber: '701',
      descriptions: `${t('PROJECT ADMINISTRATION')}`,
      route: RouteNames.PROJECT_ADMINISTRATION,
      group: 'projects',
    },
    {
      APNNBR: '05',
      moduleNumber: '702',
      descriptions: `${t('WORKORDER ADMINISTRATION')}`,
      route: RouteNames.WORKORDER_ADMINISTRATION,
      group: 'projects',
    },

    // 8xx - Утилиты и отчеты
    {
      APNNBR: '22',
      moduleNumber: '800',
      descriptions: `${t('SUPPORT REQUEST ADMINISTRATION')}`,
      route: RouteNames.SUPPORT_REQUEST_ADMINISTRATION,
      group: 'utils',
    },
    {
      APNNBR: '23',
      moduleNumber: '801',
      descriptions: `${t('PDF SLICER')}`,
      route: RouteNames.PDF_SLICER,
      group: 'utils',
    },
    {
      APNNBR: '24',
      moduleNumber: '802',
      descriptions: `${t('REPORTS')}`,
      route: RouteNames.REPORTS,
      group: 'utils',
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
    // 100 - Инженерный блок
    getItem(<>{t('Engineering')}</>, '100', <RocketOutlined />, [
      getItem(t('Aircraft Management'), '110', <ThunderboltOutlined />, [
        getItem(t('A/C Registration'), RouteNames.AC, <RocketOutlined />),
        getItem(t('A/C Types'), RouteNames.AC_TYPES, <RocketOutlined />),
        getItem(
          t('Task Administration'),
          RouteNames.AC_TASKS,
          <ThunderboltOutlined />
        ),
      ]),
      getItem(t('Technical Documentation'), '120', <FileProtectOutlined />, [
        getItem(
          t('WP Administration'),
          RouteNames.WP_ADMINISTRATION,
          <FileProtectOutlined />
        ),
        getItem(t('PDF Slicer'), RouteNames.PDF_SLICER, <FilePdfOutlined />),
      ]),
    ]),

    // 200 - Планирование
    getItem(<>{t('Planning')}</>, '200', <ScheduleOutlined />, [
      getItem(
        t('Work Package Generation'),
        RouteNames.WORKPACKGEN,
        <OrderedListOutlined />
      ),
      getItem(
        t('Planning Forecast'),
        RouteNames.PLANNINGFORECAST,
        <ScheduleOutlined />
      ),
      getItem(t('Project Management'), '210', <ProjectOutlined />, [
        getItem(
          t('Project Administration'),
          RouteNames.PROJECT_ADMINISTRATION,
          <ProjectOutlined />
        ),
        getItem(
          t('Workorder Administration'),
          RouteNames.WORKORDER_ADMINISTRATION,
          <ProjectOutlined />
        ),
      ]),
    ]),

    // 300 - Закупки и компоненты
    getItem(<>{t('Purchasing/Components')}</>, '300', null, [
      getItem(t('Orders'), '310', null, [
        getItem(
          t('Order Viewer'),
          RouteNames.ORDER_VIEWER_NEW,
          <EyeOutlined />
        ),
        getItem(
          t('Order Administration'),
          RouteNames.ORDERS_ADMINISTRATION,
          <ShoppingCartOutlined />
        ),
        getItem(
          t('Requirement Administration'),
          RouteNames.REQUIREMENT_ADMINISTRATION,
          <OrderedListOutlined />
        ),
      ]),
    ]),

    // 400 - Техническое обслуживание
    getItem(<>{t('Maintenance')}</>, '400', null, [
      getItem(t('Base Maintenance'), RouteNames.BASE, <ToolOutlined />),
      getItem(
        t('Maintenance Management (MTX)'),
        RouteNames.MTXT,
        <ExclamationCircleOutlined />
      ),
    ]),

    // 500 - Склад и логистика
    getItem(<>{t('Stores & Logistics')}</>, '500', <HddOutlined />, [
      getItem(t('Inventory'), '510', <BoxPlotOutlined />, [
        getItem(
          t('Parts Administration'),
          RouteNames.PART_ADMINISTRATIONS_NEW,
          <BoxPlotOutlined />
        ),
        getItem(
          t('Stock Information'),
          RouteNames.STOCK_NFORMATIONS,
          <DatabaseOutlined />
        ),
        getItem(
          t('Parts Transfer'),
          RouteNames.PARTS_TRANSFER,
          <SwapOutlined />
        ),
        getItem(
          t('Parts Tracking'),
          RouteNames.PARTS_TRACKING,
          <SearchOutlined />
        ),
      ]),
      getItem(t('Warehouse Operations'), '520', <HddOutlined />, [
        getItem(
          t('Stores Administration'),
          RouteNames.STORES_ADMINISTRATIONS,
          <HddOutlined />
        ),
        getItem(t('Shelf Life'), RouteNames.SHELF_LIFE, <FieldTimeOutlined />),
      ]),
      getItem(t('Receiving'), '530', <InboxOutlined />, [
        getItem(
          t('Receiving Viewer'),
          RouteNames.RESERVING_TRACK,
          <EyeOutlined />
        ),
        getItem(
          t('Goods Receiving'),
          RouteNames.GOODS_RESERVING_NEW,
          <InboxOutlined />
        ),
        getItem(
          t('Cancel Receiving'),
          RouteNames.CANCEL_RESERVING,
          <CloseCircleOutlined />
        ),
      ]),
      getItem(t('Pickslip'), '540', <FileTextOutlined />, [
        getItem(
          t('Pickslip Administration'),
          RouteNames.PICKSLIP_ADMINISTRATION,
          <FileTextOutlined />
        ),
        getItem(
          t('Pickslip Confirmation'),
          RouteNames.PICKSLIP_CONFIRMATIONS_NEW,
          <CheckCircleOutlined />
        ),
        getItem(
          t('Cancel Pickslip'),
          RouteNames.PICKSLIP_CANCEL,
          <CloseCircleOutlined />
        ),
        getItem(t('Pickslip Viewer'), RouteNames.KFC_VIEWER, <EyeOutlined />),
      ]),
    ]),

    // 600 - Администрирование и утилиты
    getItem(
      <>{t('Administration & Utils')}</>,
      '600',
      <SecurityScanOutlined />,
      [
        getItem(t('System'), '610', <SafetyCertificateOutlined />, [
          getItem(
            t('User Administration'),
            RouteNames.USER_ADMINISTRATION,
            <UserOutlined />
          ),
          getItem(
            t('Access Tracking'),
            RouteNames.ACCESS_TRACKING,
            <SafetyCertificateOutlined />
          ),
        ]),
        getItem(t('Support'), '620', <CustomerServiceOutlined />, [
          getItem(
            t('Support Request Administration'),
            RouteNames.SUPPORT_REQUEST_ADMINISTRATION,
            <CustomerServiceOutlined />
          ),
          getItem(t('Reports'), RouteNames.REPORTS, <BarChartOutlined />),
        ]),
      ]
    ),
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
