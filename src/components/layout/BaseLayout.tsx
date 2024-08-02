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

const { Header, Content, Footer, Sider } = Layout;

const BaseLayout: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useTypedSelector((state) => state.auth);
  const APN = [
    //{
    //  APNNBR: '1',
    //  descriptions: 'Work Order Information',
    //  route: RouteNames.WORKORDER_INFORMATION,
    //},

    {
      APNNBR: '01',
      descriptions: `${t(`ADMINISTRATION`)}`,
      route: RouteNames.USER_ADMINISTRATION,
    },
    {
      APNNBR: '02',
      descriptions: `${t(`PART ADMINISTRATION`)}`,
      route: RouteNames.PART_ADMINISTRATIONS_NEW,
    },
    {
      APNNBR: '03',
      descriptions: `${t(`WP ADMINISTRATION`)}`,
      route: RouteNames.WP_ADMINISTRATION,
    },

    {
      APNNBR: '04',
      descriptions: `${t(`PROJECT ADMINISTRATION`)}`,
      route: RouteNames.PROJECT_ADMINISTRATION,
    },

    {
      APNNBR: '05',
      descriptions: `${t(`WORKORDER ADMINISTRATION`)}`,
      route: RouteNames.WORKORDER_ADMINISTRATION,
    },
    {
      APNNBR: '06',

      descriptions: `${t(`PICKSLIP ADMINISTRATION`)}`,
      route: RouteNames.PICKSLIP_ADMINISTRATION,
    },
    // {
    //   APNNBR: '58',
    //   descriptions: `${t(`VIEW WORKPACKAGE`)}`,
    //   route: RouteNames.BASE,
    // },
    // {
    //   APNNBR: '59',
    //   descriptions: `${t(`PART ADMINISTRATION`)}`,
    //   route: RouteNames.PART_ADMINISTRATIONS,
    // },

    // {
    //   APNNBR: '101',
    //   descriptions: `${t(`PROJECT VIEWER`)}`,
    //   route: RouteNames.PROJECT_VIEWER,
    // },
    // {
    //   APNNBR: '1001',
    //   descriptions: `${t(`MAINTENANCE MANAGMENT`)}`,
    //   route: RouteNames.MTXT,
    // },
    // {
    //   APNNBR: '1002',
    //   descriptions: `${t(`WORK PACKAGE CREATE`)}`,
    //   route: RouteNames.WORKPACKGEN,
    // },
    {
      APNNBR: '07',
      descriptions: `${t(`RECEIVING VIEWER`)}`,
      route: RouteNames.RESERVING_TRACK,
    },

    // {
    //   APNNBR: '1201',
    //   descriptions: `${t(`ORDER CREATOR`)}`,
    //   route: RouteNames.ORDER_CREATOR,
    // },
    // {
    //   APNNBR: '1200',
    //   descriptions: `${t(`ORDER VIEWER`)}`,
    //   route: RouteNames.ORDER_VIEWER,
    // },
    {
      APNNBR: '08',
      descriptions: `${t(`ORDER VIEWER`)}`,
      route: RouteNames.ORDER_VIEWER_NEW,
    },
    // {
    //   APNNBR: '1201',
    //   descriptions: `${t(`ORDER MANAGMENT`)}`,
    //   route: RouteNames.ORDER_MANAGMENT,
    // },
    {
      APNNBR: '09',
      descriptions: `${t(`ORDER ADMINISTRATION`)}`,
      route: RouteNames.ORDERS_ADMINISTRATION,
    },
    // {
    //   APNNBR: '1203',
    //   descriptions: `${t(`REQUIREMENT MANAGMENT`)}`,
    //   route: RouteNames.REQUIREMENT_MANAGMENT,
    // },
    {
      APNNBR: '10',
      descriptions: `${t(`REQUIREMENT ADMINISTRATION`)}`,
      route: RouteNames.REQUIREMENT_ADMINISTRATION,
    },

    {
      APNNBR: '11',

      descriptions: `${t(`GOODS RECEIVING`)}`,
      route: RouteNames.GOODS_RESERVING_NEW,
    },
    {
      APNNBR: '12',

      descriptions: `${t(`PARTS TRACKING`)}`,
      route: RouteNames.PARTS_TRACKING,
    },
    // {
    //   APNNBR: '204',

    //   descriptions: `${t(`PARTS CONSUMPTION FORECAST`)}`,
    //   route: RouteNames.PARTS_FORECAST,
    // },
    // {
    //   APNNBR: '205',

    //   descriptions: `${t(`REQUIREMENT VIEWER`)}`,
    //   route: RouteNames.REQUIREMENT_VIEWER,
    // },

    // {
    //   APNNBR: '205',

    //   descriptions: `${t(`REQUIREMENT VIEWER`)}`,
    //   route: RouteNames.REQUIREMENT_VIEWER_VIEWER,
    // },
    {
      APNNBR: '14',

      descriptions: `${t(`STORES ADMINISTRATION`)}`,
      route: RouteNames.STORES_ADMINISTRATIONS,
    },
    {
      APNNBR: '15',

      descriptions: `${t(`STOCK INFORMATION`)}`,
      route: RouteNames.STOCK_NFORMATIONS,
    },

    {
      APNNBR: '16',

      descriptions: `${t(`PARTS TRANSFER`)}`,
      route: RouteNames.PARTS_TRANSFER,
    },
    // {
    //   APNNBR: '225',

    //   descriptions: `${t(`PICKSLIP REQUEST`)}`,
    //   route: RouteNames.PICKSLIP_REQUEST,
    // },
    // {
    //   APNNBR: '225',

    //   descriptions: `${t(`PICKSLIP REQUEST`)}`,
    //   route: RouteNames.PICKSLIP_REQUEST_NEW,
    // },
    // {
    //   APNNBR: '230',

    //   descriptions: `${t(`PICKSLIP CONFIRMATION`)}`,
    //   route: RouteNames.PICKSLIP_CONFIRMATIONS,
    // },
    {
      APNNBR: '17',

      descriptions: `${t(`PICKSLIP CONFIRMATION`)}`,
      route: RouteNames.PICKSLIP_CONFIRMATIONS_NEW,
    },
    {
      APNNBR: '18',

      descriptions: `${t(`CANCEL PICKSLIP`)}`,
      route: RouteNames.PICKSLIP_CANCEL,
    },
    // {
    //   APNNBR: '334',

    //   descriptions: `${t(`SCRAP MATERIAL`)}`,
    //   route: RouteNames.SCRAP_MATERIAL,
    // },
    {
      APNNBR: '19',

      descriptions: `${t(`CANCEL RECEIVING`)}`,
      route: RouteNames.CANCEL_RESERVING,
    },
    {
      APNNBR: '20',

      descriptions: `${t(`SHELF EXPIRY`)}`,
      route: RouteNames.SHELF_LIFE,
    },
    {
      APNNBR: '21',
      descriptions: `${t(`ACCESS TRACKING`)}`,
      route: RouteNames.ACCESS_TRACKING,
    },
    // {
    //   APNNBR: '375',

    //   descriptions: `${t(`PICKSLIP VIEWER`)}`,
    //   route: RouteNames.PICKSLIP_VIEWER,
    // },

    // {
    //   APNNBR: '1418',
    //   descriptions: `${t(`WORKORDER`)}`,
    //   route: RouteNames.WORKORDER,
    // },
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
    //getItem('Engineering', RouteNames.MTXT, <DesktopOutlined />, []),
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
      // Check for Ctrl + B or Ctrl + Р (Russian 'B' key)
      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === 'b' || event.key === 'и')
      ) {
        event.preventDefault(); // Prevent the default action if needed
        setIsModalOpen(true);
      }
    };

    // Add the event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleChange = (value: any) => {
    const selectedItem = APN.find((apn) => apn.APNNBR === value);
    setSecectedAPN(selectedItem);
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

  // const onRowClick = (
  //   record: any,
  //   rowIndex?: any,
  //   event: React.MouseEvent<HTMLTableRowElement>
  // ) => {
  //   if (event.ctrlKey) {
  //     // Send an IPC event to open the link in a new Electron window
  //     ipcRenderer.send('open-link-in-window', record.route);
  //   } else {
  //     setSelectedAPN(record);
  //     setIsModalOpen(false);
  //   }
  // };

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
                  // count={1}
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
            // background: 'rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 0, 0, 0.2)',
          }}
        >
          <div
            onClick={() => navigate(RouteNames.HOME)}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <a className="text-xl  px-3 uppercase cursor-pointer text-gray-500">
              BAMOS TEST
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
                  onFocus={handleFocus} // Добавляем обработчик события onFocus
                  onBlur={handleBlur} // Добавляем обработчик события onBlur
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
                      {apn.descriptions}
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
                    // count={1}
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
        <Content
          style={
            {
              // background: 'rgba(255, 255, 255, 0.2)',
              // background: 'rgba(255, 255, 255, 0.8)',
            }
          }
        >
          <Routes>
            <Route
              element={<Home apnRoute={selectedAPN} />}
              path={RouteNames.HOME}
            />

            <Route
              element={
                <Result
                  style={{ height: '65vh' }}
                  className="flex  flex-col items-center justify-center"
                  status="404"
                  title="404"
                  subTitle="Sorry, the page you visited does not exist."
                />
              }
              path={'*'}
            />
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
        className="mt-0 pt-0"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          bottom: '0',
        }}
      >
        <div style={{ flex: 1 }}></div>
        {t(`©2024 Created by Kavalchuk D.`)}
        <div style={{ flex: 1, textAlign: 'right' }}>
          <UTCClock />
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
