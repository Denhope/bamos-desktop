import React, { useState, useEffect, FC } from 'react';
import { Form, Input, Layout, Menu, MenuProps, Row, Space, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';

import MenuItem from 'antd/es/menu/MenuItem';
import { RouteNames } from '@/router';

import {
  AppstoreOutlined,
  DownloadOutlined,
  SearchOutlined,
  DesktopOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  RightSquareOutlined,
  PlusCircleOutlined,
  ArrowsAltOutlined,
  LeftSquareOutlined,
  RetweetOutlined,
  ExclamationOutlined,
} from '@ant-design/icons';

import TabPane, { TabPaneProps } from 'antd/es/tabs/TabPane';

import {
  getFilteredMaterialOrders,
  getFilteredAlternativePN,
  getFilteredMaterialItems,
  getFilteredItemsStockQuantity,
} from '@/utils/api/thunks';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import MaterialOrdersList from '@/components/store/matOrders/MaterialOrders';
import { v4 as originalUuidv4 } from 'uuid';

import MaterialItemStoreSearchNew from '@/components/store/search/MaterialItemStoreSearchNew';
import MarerialOrderContent from '@/components/store/matOrders/MarerialOrderContent';
import PickSlipsList from '@/components/store/pickSlip/PickSlips';
import { useTranslation } from 'react-i18next';
import WOFilterForm from '@/components/store/search/PNSearchForm';
import ReservingForm from '@/components/store/goods/ReservingForm';
import { ProCard, ProForm, ProFormCheckbox } from '@ant-design/pro-components';
import SearchSelect from '@/components/shared/form/SearchSelect';
import FilterSiderForm from '@/components/shared/form/FilterSiderForm';
import StockInfo from '@/components/store/search/stockInfo/StockInfo';
import { setSelectedMaterial } from '@/store/reducers/StoreLogisticSlice';

const { Sider, Content } = Layout;
const { SubMenu } = Menu;
type MenuItem = Required<MenuProps>['items'][number];
function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  // path?: any,
  type?: 'group'
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    // path,
    type,
  } as MenuItem;
}

const MaterialsStore: FC = () => {
  const [form] = Form.useForm();
  const [activeKey, setActiveKey] = useState<string>(''); // Используйте строку вместо массива
  const [data, setData] = useState<any>(null);
  const { t } = useTranslation();
  const [dataPN, setDataPN] = useState<any>([]);
  const [selectedPN, setSelectedPN] = useState<any>(null);
  const companyID = localStorage.getItem('companyID') || '';
  const [group, setGroup] = useState<any>();

  const handleSearch = async (value: any) => {
    if (value) {
      const result = await dispatch(
        getFilteredAlternativePN({
          companyID: companyID,
          partNumber: value,
          group: group,
        })
      );

      // Удаление дубликатов
      const uniqueResults = result.payload.reduce(
        (acc: any[], current: any) => {
          const x = acc.find(
            (item) => item.PART_NUMBER === current.PART_NUMBER
          );
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        },
        []
      );

      return uniqueResults;
    }
  };

  const handleSelect = (selectedOption: any) => {
    setSelectedPN(selectedOption);
  };
  const items: MenuItem[] = [
    getItem(t('Stores & Logistics'), '06', <DesktopOutlined />, [
      getItem(
        t('MATERIALS/PARTS'),
        RouteNames.STORES_MATERIALS_PARTS,
        <DownloadOutlined />,
        [
          //getItem(
          // t('STOCK INFORMATION'),
          // RouteNames.MATERIAL_STORE,
          //  <SearchOutlined />
          // ),
          getItem(
            <Row justify={'space-between'}>
              <div
                onClick={() => {
                  let key = RouteNames.GOODS_RESERVING;
                  const tab = {
                    key,
                    title: t('GOODS RECEIVING'),
                    content: (
                      <ProCard className="flex justify-center items-center h-[82vh]">
                        <></>
                      </ProCard>
                    ),
                    closable: true,
                  };
                  if (!panes.find((pane) => pane.key === tab.key)) {
                    setPanes((prevPanes) => [...prevPanes, tab]);
                  }
                  setActiveKey(tab.key);
                }}
              >
                {t('GOODS RECEIVING')}
              </div>
              ,
              <PlusCircleOutlined
                className="text-blue-400 scale-125 hover:scale-150 hover:text-blue-500 p-1 transition-transform"
                onClick={() => {
                  let key = RouteNames.GOODS_RESERVING_ADD;
                  const tab = {
                    key,
                    title: `CREATE ITEM`,
                    content: (
                      <ProCard className="h-[82vh] overflow-hidden">
                        <ReservingForm />
                      </ProCard>
                    ),
                    closable: true,
                  };
                  if (!panes.find((pane) => pane.key === tab.key)) {
                    setPanes((prevPanes) => [...prevPanes, tab]);
                  }
                  setActiveKey(tab.key);
                }}
              />
            </Row>,

            RouteNames.GOODS_RESERVING,
            <RightSquareOutlined />
          ),

          getItem(
            t('GOODS REALESE'),

            RouteNames.GOODS_REALESE,
            <LeftSquareOutlined />
          ),
          // getItem(
          //   t('GOODS TRANSFER'),
          //   // RouteNames.GOODS_TRANSFER,
          //   <ArrowsAltOutlined />
          // ),
          getItem(
            t('GOODS RETURN'),
            RouteNames.GOODS_RETURN,
            <ExclamationOutlined />
          ),
        ]
      ),
      getItem(t('STORES'), RouteNames.STORES, <DownloadOutlined />, [
        getItem(
          t('STORES VIEWER'),
          RouteNames.STORES_VIEWER,
          <PlusCircleOutlined />
        ),
        getItem(
          t('STORES ADMINISTRATIONS'),
          RouteNames.MATERIAL_APLICATIONS,
          <DownloadOutlined />
        ),
      ]),

      getItem(
        t('PICKSLIPS'),
        RouteNames.MATERIAL_APLICATIONS,
        <DownloadOutlined />,
        [
          getItem(t('PICKSLIP REQUEST'), 'NJNNNN', <PlusCircleOutlined />),
          getItem(
            t('PICKSLIP VIEWER'),
            RouteNames.MATERIAL_APLICATIONS,
            <DownloadOutlined />
          ),

          getItem(
            t('ISSUED PISKSLIPS'),
            RouteNames.PICKSLIPS,
            <FileTextOutlined />
          ),
        ]
      ),

      // getItem(
      //   t('PARTS CONSUMPTION FORECAST'),
      //   RouteNames.MTBREQUESTS,
      //   <DatabaseOutlined />
      // ),
    ]),

    // ]
    // ),
  ];
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const rootSubmenuKeys = ['-'];
  const [openKeys, setOpenKeys] = useState(['06', '06-2']);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['06']);

  const { isLoading, filteredMaterialOrders, filteredPickSlips } =
    useTypedSelector((state) => state.storesLogistic);
  useEffect(() => {
    const storedKeys = localStorage.getItem('selectedKeys');
    if (storedKeys) {
      setSelectedKeys(JSON.parse(storedKeys));

      // navigate(storedKey);
    }
  }, []);
  const handleClick = ({ selectedKeys }: { selectedKeys: string[] }) => {
    setSelectedKeys(selectedKeys);
    localStorage.setItem('selectedKeys', JSON.stringify(selectedKeys));
  };

  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };
  interface TabData extends TabPaneProps {
    key: string;
    title: string;
    content: React.ReactNode;
  }
  const uuidv4: () => string = originalUuidv4;
  const onRowClick = (record: any) => {
    const tab: TabData = {
      key: uuidv4(), // уникальный ключ для каждой вкладки
      title: `PICKSLIP: ${record.materialAplicationNumber}`,
      content: (
        <ProCard className="flex justify-center items-center h-[82vh]">
          <MarerialOrderContent order={record} />
        </ProCard>
      ),
      closable: true,
    };
    if (!panes.find((pane) => pane.key === tab.key)) {
      setPanes((prevPanes) => [...prevPanes, tab]);
    }
    setActiveKey(tab.key);
  };

  const [panes, setPanes] = useState<TabData[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const onEdit = (
    targetKey:
      | string
      | React.MouseEvent<Element, MouseEvent>
      | React.KeyboardEvent<Element>,
    action: 'add' | 'remove'
  ) => {
    if (typeof targetKey === 'string') {
      if (action === 'remove') {
        const newPanes = panes.filter((pane) => pane.key !== targetKey);
        setPanes(newPanes);
        if (newPanes.length > 0) {
          setActiveKey(newPanes[newPanes.length - 1].key);
        }
      }
    } else {
      // Обработка события мыши или клавиатуры
    }
  };
  const onMenuClick = ({ key }: { key: string }) => {
    if (key === RouteNames.MATERIAL_STORE) {
      const tab = {
        key,
        title: `STOCK INFORMATION`,
        content: (
          <>
            {!selectedPN ? (
              <ProCard className="h-[82vh] overflow-hidden">
                <StockInfo selectedItem={selectedPN}></StockInfo>
              </ProCard>
            ) : (
              <>
                <ProCard className="h-[82vh] overflow-hidden">
                  <StockInfo selectedItem={selectedPN}></StockInfo>
                </ProCard>
              </>
            )}
          </>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.MATERIAL_APLICATIONS) {
      const tab = {
        key,
        title: `PICKSLIP VIEWER`,
        content: (
          <ProCard className="h-[82vh] overflow-hidden">
            <MaterialOrdersList
              data={filteredMaterialOrders}
              scroll={55}
              isLoading={isLoading}
              onRowClick={onRowClick}
            />
          </ProCard>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.PICKSLIPS) {
      const tab = {
        key,
        title: t('ISSUED_PICKSLIPS'),
        content: (
          <ProCard className="h-[82vh] overflow-hidden">
            <PickSlipsList
              data={filteredPickSlips}
              scroll={55}
              isLoading={isLoading}
              onRowClick={() => console.log('data')}
            />
          </ProCard>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
  };

  useEffect(() => {
    onMenuClick({ key: activeKey });
  }, [data]); // Зависимость от data
  const onFilterWO = (record: any) => {
    const tab: TabData = {
      key: uuidv4(), // уникальный ключ для каждой вкладки
      title: `PN: `,
      content: <></>,
      closable: true,
    };
    if (!panes.find((pane) => pane.key === tab.key)) {
      setPanes((prevPanes) => [...prevPanes, tab]);
    }
    setActiveKey(tab.key);
  };
  useEffect(() => {
    if (localStorage.getItem('filteredPN')) {
      setSelectedPN(localStorage.getItem('filteredPN'));
    }
  }, []);
  return (
    <Layout>
      <Sider
        className="h-[85vh] overflow-hidden"
        theme="light"
        style={{
          paddingBottom: 0,
          marginBottom: 0,
          // marginLeft: 'auto',
          // background: 'rgba(255, 255, 255, 0.2)',
        }}
        width={320}
        // trigger
        collapsible
        collapsed={collapsed}
        onCollapse={(value: boolean | ((prevState: boolean) => boolean)) =>
          setCollapsed(value)
        }
      >
        <Menu
          theme="light"
          // className="h-max"
          // defaultSelectedKeys={['/']}
          mode="inline"
          items={items}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          onSelect={handleClick}
          selectedKeys={selectedKeys}
          onClick={onMenuClick}
        />
        {activeKey == RouteNames.MATERIAL_STORE && !collapsed && (
          <FilterSiderForm
            title={t('PART No SEARCH')}
            children={
              <ProForm
                style={{
                  width: '100%',
                  height: `${!collapsed ? '100%' : '35vh'}`,
                }}
                form={form}
                onFinish={async (values: any) => {
                  dispatch(setSelectedMaterial(selectedPN));
                  const companyID = localStorage.getItem('companyID');
                  const result = await dispatch(
                    getFilteredItemsStockQuantity({
                      companyID: companyID,
                      PART_NUMBER: selectedPN.PART_NUMBER,
                    })
                  );
                  if (result.meta.requestStatus === 'fulfilled') {
                    setDataPN(result.payload);
                    localStorage.setItem('filteredPN', selectedPN.PART_NUMBER);
                  }
                }}
              >
                <SearchSelect
                  onSearch={handleSearch}
                  optionLabel1="PART_NUMBER"
                  optionLabel2="DESCRIPTION"
                  onSelect={handleSelect}
                  label={`${t('PN')}`}
                  tooltip={`${t('PARTNUMBER')}`}
                  rules={[]}
                  name={'PART_NUMBER'}
                />
                <ProFormCheckbox.Group
                  labelAlign="left"
                  name="GROUP"
                  options={[
                    { label: 'TOOL', value: 'TOOL' },
                    { label: 'ROT', value: 'ROT' },
                    { label: 'CONS', value: 'CONS' },
                    { label: 'GSE', value: 'GSE' },
                    { label: 'CHEM', value: 'CHEM' },
                  ]}
                  fieldProps={{
                    onChange: (value) => setGroup(value),
                  }}
                />
              </ProForm>
            }
          />
        )}
      </Sider>
      <Content>
        <Tabs
          style={{
            width: '98%',
          }}
          className="mx-auto"
          size="small"
          hideAdd
          onChange={setActiveKey}
          activeKey={activeKey}
          type="editable-card"
          onEdit={onEdit}
        >
          {panes.map((pane) => (
            <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
              {pane.content}
            </TabPane>
          ))}
        </Tabs>
        {/* {selectedKeys[0] == RouteNames.MATERIAL_STORE && (
          <MaterialStoreSearch />
        )} */}
        {/* {selectedKeys[0] == RouteNames.PICKSLIPS && <PickSlip />}{' '} */}
      </Content>
    </Layout>
  );
};

export default MaterialsStore;
