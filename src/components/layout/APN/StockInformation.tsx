import React, { useState, useEffect, FC } from 'react';
import {
  Checkbox,
  Form,
  Input,
  Layout,
  Menu,
  MenuProps,
  Row,
  Space,
  Tabs,
} from 'antd';
import { useNavigate } from 'react-router-dom';

import { RouteNames } from '@/router';

import { ShoppingCartOutlined } from '@ant-design/icons';

import TabPane, { TabPaneProps } from 'antd/es/tabs/TabPane';

import {
  getFilteredItemsStockQuantity,
  getFilteredStockDetails,
  getFilteredTransferStockItems,
  getFilteredUnserviseStockItems,
  getFilteredPartNumber,
} from '@/utils/api/thunks';
import { useAppDispatch } from '@/hooks/useTypedSelector';

import { useTranslation } from 'react-i18next';

import {
  ModalForm,
  ProCard,
  ProForm,
  ProFormCheckbox,
} from '@ant-design/pro-components';
import SearchSelect from '@/components/shared/form/SearchSelect';

import StockInfo from '@/components/store/search/stockInfo/StockInfo';
import {
  setFilteredCurrentStockItems,
  setSelectedFlterDate,
  setSelectedMaterial,
} from '@/store/reducers/StoreLogisticSlice';
import { getItem } from '@/services/utilites';
import Title from 'antd/es/typography/Title';
import ContextMenuWrapper from '@/components/shared/ContextMenuWrapperProps';
import AlternativeTable, { Aternative } from '../AlternativeTable';

import PartNumberSearch from '@/components/store/search/PartNumberSearch';

const { Sider, Content } = Layout;

const StockInformstion: FC = () => {
  const [form] = Form.useForm();
  const [isReset, setIsReset] = useState(false);
  const [activeKey, setActiveKey] = useState<string>(''); // Используйте строку вместо массива
  const [data, setData] = useState<any>(null);
  const { t } = useTranslation();
  const [dataPN, setDataPN] = useState<any>([]);
  const [selectedPN, setSelectedPN] = useState<any>(null);
  const companyID = localStorage.getItem('companyID') || '';
  const [group, setGroup] = useState<any>();
  const [isAltertative, setIsAltertative] = useState<any>(true);
  const [isAllDate, setIsAllDAte] = useState<any>(true);
  const handleCopy = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    navigator.clipboard.writeText(value);
  };
  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();
  const handleAdd = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    console.log('Добавить:', value);
  };

  const handleAddPick = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    console.log('Добавить Pick:', value);
  };
  const handleSearch = async (value: any) => {
    if (value) {
      const result = await dispatch(
        getFilteredPartNumber({
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
    setIsReset(true); // затем обратно в true
    setIsReset(false); // сначала установите в false
  };
  type MenuItem = Required<MenuProps>['items'][number];
  const items: MenuItem[] = [
    getItem(
      <>{t('STOCK INFORMATION (BAN:221)')}</>,
      'sub1',
      <ShoppingCartOutlined />
    ),
    // ]
    // ),
  ];
  const dispatch = useAppDispatch();

  const [alternativeValues, setAlternative] = useState<Aternative[]>([]);

  useEffect(() => {
    const storedKeys = localStorage.getItem('selectedKeys');
    if (storedKeys) {
      // navigate(storedKey);
    }
  }, []);

  interface TabData extends TabPaneProps {
    key: string;
    title: string;
    content: React.ReactNode;
  }

  const [panes, setPanes] = useState<TabData[]>([]);
  const [collapsed, setCollapsed] = useState(false);

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
  };

  useEffect(() => {
    onMenuClick({ key: activeKey });
  }, [data]); // Зависимость от data

  useEffect(() => {
    if (localStorage.getItem('filteredPN')) {
      setSelectedPN(localStorage.getItem('filteredPN'));
    }
  }, []);

  const [initialPN, setInitialPN] = useState('');

  const [openStoreFindModal, setOpenStoreFind] = useState(false);
  const [updatetOrderMaterials, setUpdatedOrderMaterials] = useState(null);
  return (
    <Layout>
      <Sider
        className="h-[85vh] overflow-hidden"
        theme="light"
        style={{
          paddingBottom: 0,
          marginBottom: 0,
        }}
        width={350}
        // trigger
        collapsible
        collapsed={collapsed}
        onCollapse={(value: boolean | ((prevState: boolean) => boolean)) =>
          setCollapsed(value)
        }
      >
        <Menu
          theme="light"
          className="pt-5"
          // defaultSelectedKeys={['/']}
          mode="inline"
          items={items}
        />
        {!collapsed && (
          <div className="flex flex-col">
            <ProForm
              size="small"
              onReset={() => {
                setSelectedPN(null);
                setInitialPN('');
                setIsReset(true);
              }}
              //</Sider>}}ЪЪ
              className="p-5"
              style={{
                display: !collapsed ? 'block' : 'none',
                width: '100%',
                height: `${!collapsed ? '100%' : '35vh'}`,
              }}
              form={form}
              onFinish={async (values: any) => {
                if (selectedPN && selectedPN.PART_NUMBER) {
                  dispatch(setFilteredCurrentStockItems([]));
                  dispatch(setSelectedMaterial(selectedPN));
                  dispatch(setSelectedFlterDate(isAllDate));

                  const companyID = localStorage.getItem('companyID');

                  const result = await dispatch(
                    getFilteredItemsStockQuantity({
                      companyID: companyID,
                      PART_NUMBER: selectedPN.PART_NUMBER,
                      isAlternative: isAltertative,
                      isAllDate: isAllDate,
                    })
                  );

                  if (result.meta.requestStatus === 'fulfilled') {
                    const alternativeValues =
                      result.payload?.alternatives &&
                      result.payload?.alternatives.map(
                        (item: { ALTERNATIVE: any }) => item.ALTERNATIVE
                      );

                    const resultFilteredStockDetails = await dispatch(
                      getFilteredStockDetails({
                        companyID: companyID || '',
                        PART_NUMBER: selectedPN.PART_NUMBER,
                        alternatives: alternativeValues,
                        isAllDate: true,
                      })
                    );

                    const resultFilteredUnserviceDetails = await dispatch(
                      getFilteredUnserviseStockItems({
                        companyID: companyID || '',
                        PART_NUMBER: selectedPN.PART_NUMBER,
                        alternatives: alternativeValues,
                        condition: 'US/',
                      })
                    );

                    setDataPN(result.payload);
                    setAlternative(result.payload?.alternatives);
                    localStorage.setItem('filteredPN', selectedPN.PART_NUMBER);
                  }
                }
              }}
            >
              <Space>
                <ProFormCheckbox.Group
                  className="my-0 py-0"
                  initialValue={['true']}
                  labelAlign="left"
                  name="isAlternative"
                  fieldProps={{
                    onChange: (value) => setIsAltertative(value),
                  }}
                  options={[
                    { label: `${t('INCLUDE ALTERNATIVE')}`, value: 'true' },
                    // { label: 'Load all Exp. Dates', value: 'allDate' },
                  ].map((option) => ({
                    ...option,
                    style: { display: 'flex', flexWrap: 'wrap' }, // Добавьте эту строку
                  }))}
                />
                <ProFormCheckbox.Group
                  className="my-0 py-0"
                  //initialValue={['false']}
                  labelAlign="left"
                  name="isAllDAte"
                  fieldProps={{
                    onChange: (value) => setIsAllDAte(value),
                  }}
                  options={[{ label: `${t('ALL DATES')}`, value: 'true' }].map(
                    (option) => ({
                      ...option,
                      style: { display: 'flex', flexWrap: 'wrap' }, // Добавьте эту строку
                    })
                  )}
                />
              </Space>

              <ContextMenuWrapper
                items={[
                  {
                    label: 'Copy',
                    action: handleCopy,
                  },
                  {
                    label: 'Open with',
                    action: () => {},
                    submenu: [
                      { label: 'PART TRACKING', action: handleAdd },
                      { label: 'PICKSLIP REQUEST', action: handleAddPick },
                    ],
                  },
                ]}
              >
                <SearchSelect
                  initialValue={initialPN}
                  onDoubleClick={() => {
                    setOpenStoreFind(true);
                  }}
                  isReset={isReset}
                  onSearch={handleSearch}
                  optionLabel1="PART_NUMBER"
                  optionLabel2="DESCRIPTION"
                  onSelect={handleSelect}
                  label={`${t('PART No')}`}
                  tooltip={`${t('DOUBE CLICK OPEN PART No BOOK')}`}
                  rules={[]}
                  name={'PART_NUMBER'}
                />
              </ContextMenuWrapper>
              <ProFormCheckbox.Group
                labelAlign="left"
                name="GROUP"
                fieldProps={{
                  onChange: (value) => setGroup(value),
                }}
                options={[
                  { label: 'TOOL', value: 'TOOL' },
                  { label: 'ROT', value: 'ROT' },
                  { label: 'CONS', value: 'CONS' },
                  { label: 'GSE', value: 'GSE' },
                  { label: 'CHEM', value: 'CHEM' },
                ].map((option) => ({
                  ...option,
                  style: { display: 'flex', flexWrap: 'wrap' }, // Добавьте эту строку
                }))}
              />
            </ProForm>
            <AlternativeTable
              scrolly={59}
              data={alternativeValues}
              onRowClick={function (record: any, rowIndex?: any): void {
                throw new Error('Function not implemented.');
              }}
              onRowSingleClick={function (record: any, rowIndex?: any): void {
                throw new Error('Function not implemented.');
              }}
            ></AlternativeTable>
            <ModalForm
              // title={`Search on Store`}
              width={'70vw'}
              // placement={'bottom'}
              open={openStoreFindModal}
              // submitter={false}
              onOpenChange={setOpenStoreFind}
              onFinish={async function (
                record: any,
                rowIndex?: any
              ): Promise<void> {
                setOpenStoreFind(false);
                handleSelect(selectedSinglePN);
                setInitialPN(selectedSinglePN?.PART_NUMBER || '');
              }}
            >
              <PartNumberSearch
                initialParams={{ partNumber: '' }}
                scroll={45}
                onRowClick={function (record: any, rowIndex?: any): void {
                  setOpenStoreFind(false);
                  handleSelect(record);
                  setInitialPN(record.PART_NUMBER);
                }}
                isLoading={false}
                onRowSingleClick={function (record: any, rowIndex?: any): void {
                  setSecectedSinglePN(record);
                }}
              />
            </ModalForm>
          </div>
        )}
      </Sider>
      <Content className="pl-4">
        <ProCard className="h-[82vh] overflow-hidden">
          <StockInfo selectedItem={selectedPN}></StockInfo>
        </ProCard>
      </Content>
    </Layout>
  );
};

export default StockInformstion;
