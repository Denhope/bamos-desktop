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
import { MenuItem, getItem } from '@/services/utilites';
import APNTable from '@/components/layout/APNTable';
import UTCClock from '../shared/UTCClock';

const { Header, Content, Footer, Sider } = Layout;

const BaseLayout: React.FC = () => {
  const { t } = useTranslation();
  const APN = [
    //{
    //  APNNBR: '1',
    //  descriptions: 'Work Order Information',
    //  route: RouteNames.WORKORDER_INFORMATION,
    //},
    {
      APNNBR: '01',
      descriptions: `${t(` ADMINISTRATION`)}`,
      route: RouteNames.USER_ADMINISTRATION,
    },
    {
      APNNBR: '58',
      descriptions: `${t(`VIEW WORKPACKAGE`)}`,
      route: RouteNames.BASE,
    },
    {
      APNNBR: '59',
      descriptions: `${t(`PART ADMINISTRATION`)}`,
      route: RouteNames.PART_ADMINISTRATIONS,
    },
    {
      APNNBR: '100',
      descriptions: `${t(`PROJECT MANAGMENT`)}`,
      route: RouteNames.PROJECT_MANAGMENT,
    },
    {
      APNNBR: '101',
      descriptions: `${t(`PROJECT VIEWER`)}`,
      route: RouteNames.PROJECT_VIEWER,
    },
    {
      APNNBR: '1001',
      descriptions: `${t(`MAINTENANCE MANAGMENT`)}`,
      route: RouteNames.MTXT,
    },
    {
      APNNBR: '1002',
      descriptions: `${t(`WORK PACKAGE CREATE`)}`,
      route: RouteNames.WORKPACKGEN,
    },
    {
      APNNBR: '1198',
      descriptions: `${t(`RECEIVING VIEWER`)}`,
      route: RouteNames.RESERVING_TRACK,
    },

    // {
    //   APNNBR: '1201',
    //   descriptions: `${t(`ORDER CREATOR`)}`,
    //   route: RouteNames.ORDER_CREATOR,
    // },
    {
      APNNBR: '1200',
      descriptions: `${t(`ORDER VIEWER`)}`,
      route: RouteNames.ORDER_VIEWER,
    },
    {
      APNNBR: '1201',
      descriptions: `${t(`ORDER MANAGMENT`)}`,
      route: RouteNames.ORDER_MANAGMENT,
    },
    {
      APNNBR: '1202',
      descriptions: `${t(`REQUIREMENT MANAGMENT`)}`,
      route: RouteNames.REQUIREMENT_MANAGMENT,
    },

    {
      APNNBR: '2121',

      descriptions: `${t(`GOODS RECEIVING`)}`,
      route: RouteNames.GOODS_RESERVING,
    },
    {
      APNNBR: '188',

      descriptions: `${t(`PARTS TRACKING`)}`,
      route: RouteNames.PARTS_TRACKING,
    },
    {
      APNNBR: '204',

      descriptions: `${t(`PARTS CONSUMPTION FORECAST`)}`,
      route: RouteNames.PARTS_FORECAST,
    },
    {
      APNNBR: '205',

      descriptions: `${t(`REQUIREMENT VIEWER`)}`,
      route: RouteNames.REQUIREMENT_VIEWER,
    },
    {
      APNNBR: '220',

      descriptions: `${t(`STORE MANAGEMENT`)}`,
      route: RouteNames.STORE_MANAGMENT,
    },
    {
      APNNBR: '221',

      descriptions: `${t(`STOCK INFORMATION`)}`,
      route: RouteNames.STOCK_NFORMATIONS,
    },

    {
      APNNBR: '222',

      descriptions: `${t(`PARTS TRANSFER`)}`,
      route: RouteNames.PARTS_TRANSFER,
    },
    {
      APNNBR: '225',

      descriptions: `${t(`PICKSLIP REQUEST`)}`,
      route: RouteNames.PICKSLIP_REQUEST,
    },
    {
      APNNBR: '230',

      descriptions: `${t(`PICKSLIP CONFIRMATION`)}`,
      route: RouteNames.PICKSLIP_CONFIRMATIONS,
    },
    {
      APNNBR: '309',

      descriptions: `${t(`CANCEL PICKSLIP`)}`,
      route: RouteNames.PICKSLIP_CANCEL,
    },
    {
      APNNBR: '334',

      descriptions: `${t(`SCRAP MATERIAL`)}`,
      route: RouteNames.SCRAP_MATERIAL,
    },
    {
      APNNBR: '335',

      descriptions: `${t(`CANCEL RECEIVING`)}`,
      route: RouteNames.CANCEL_RESERVING,
    },
    {
      APNNBR: '359',

      descriptions: `${t(`SHELF EXPIRY`)}`,
      route: RouteNames.SHELF_LIFE,
    },
    {
      APNNBR: '375',

      descriptions: `${t(`PICKSLIP VIEWER`)}`,
      route: RouteNames.PICKSLIP_VIEWER,
    },

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
  const itemsModal: MenuItem[] = [
    getItem(
      t('PARTS ADMINISTRATIONS'),
      RouteNames.WORKPACKGEN,
      <ProjectOutlined />
    ),

    getItem(
      <>{t('WORKPACKAGE VIEWER')}</>,
      RouteNames.BASE,
      <ProjectOutlined />
    ),
    getItem(
      t('PLANNING FORECAST'),
      RouteNames.PLANNINGFORECAST,
      <ProjectOutlined />
    ),

    // getItem('Line Maintenance', RouteNames.LINE, <ProjectOutlined />),
    getItem(
      t('Maintenance Management (MTX)'),
      RouteNames.MTXT,
      <ExclamationCircleOutlined />
    ),

    getItem(
      <>{t('STORES/LOGISTICS')}</>,
      RouteNames.STORE,
      <ShoppingCartOutlined />
    ),
    getItem(<>{t('TOOL')}</>, RouteNames.TOOLING, <ToolOutlined />),
  ];

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
      // getItem('Line Maintenance', RouteNames.LINE, <ProjectOutlined />),
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
  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

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
  const location = useLocation();
  const [selectedAPN, setSecectedAPN] = useState<any | null>(null);
  const [selectedSingleAPN, setSecectedSingleAPN] = useState(null);
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.ctrlKey && event.key === 'b') {
        setIsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Удаляем обработчик событий при размонтировании компонента
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
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {location.pathname === RouteNames.WEB ? (
        <Header
          className="flex justify-between "
          style={{
            // marginLeft: 'auto',
            // background: 'rgba(255, 255, 255, 0.2)',
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
                    // marginLeft: 'auto',
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
            // marginLeft: 'auto',
            // background: 'rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          <div
            onClick={() => navigate(RouteNames.HOME)}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <a className="text-xl  px-3 uppercase cursor-pointer text-gray-500">
              bamos
            </a>
            <ProFormItem
              label
              tooltip={'DOUBLE CLICK OPEN APN BOOK'}
              className="flex justify-center align-middle my-10"
            >
              <div style={{ width: '300px' }}>
                <Select
                  showSearch
                  placeholder="BAN"
                  onChange={handleChange}
                  onClick={handleClickD}
                  open={isFocused}
                  onSearch={handleSearch}
                  onSelect={handleSelect}
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
                  {APN.map((apn) => (
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
              // marginLeft: 'auto',
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
            <Route element={<HomeWEB />} path={RouteNames.WEB} />
            <Route element={<MaintenanceMTX />} path={RouteNames.MTXT} />
            <Route element={<MaintenanceBase />} path={RouteNames.BASE} />{' '}
            <Route element={<MaintenanceLine />} path={RouteNames.LINE} />
            <Route element={<MaterialsStore />} path={RouteNames.STORE} />
            <Route element={<WPGeneration />} path={RouteNames.WORKPACKGEN} />
            <Route
              element={
                <Result
                  style={{ height: '65vh' }}
                  className="flex  flex-col items-center justify-center"
                  status="404"
                  title="404"
                  subTitle="Sorry, the page you visited does not exist."
                  //extra={<Button type="primary">Back Home</Button>}
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
          //onCancel={() => setIsModalOpen(false)}
          title={`${t(`BAN BOOK`)}`}
          // placement={'bottom'}
          open={isModalOpen}
          width={'30vw'}

          // getContainer={false}
        >
          <ProCard
            className="flex mx-auto justify-center align-middle"
            style={{}}
          >
            <APNTable
              data={APN}
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
        <div>©2023 Created by Kavalchuk D.</div>
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
