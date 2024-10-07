import React, { useState, useEffect, FC, useMemo } from 'react';
import {
  Checkbox,
  Empty,
  Form,
  Input,
  Layout,
  Menu,
  MenuProps,
  Row,
  Space,
  Tabs,
  Divider,
} from 'antd';
import { useNavigate } from 'react-router-dom';

import { RouteNames } from '@/router';

import { ShoppingCartOutlined } from '@ant-design/icons';

import TabPane, { TabPaneProps } from 'antd/es/tabs/TabPane';

import { getFilteredPartNumber } from '@/utils/api/thunks';
import { useAppDispatch } from '@/hooks/useTypedSelector';

import { useTranslation } from 'react-i18next';

import {
  ModalForm,
  ProCard,
  ProForm,
  ProFormCheckbox,
  ProFormSelect,
} from '@ant-design/pro-components';
import SearchSelect from '@/components/shared/form/SearchSelect';

import StockInfo from '@/components/store/search/stockInfo/StockInfo';
import {
  setFilteredCurrentStockItems,
  setSelectedFlterDate,
  setSelectedMaterial,
} from '@/store/reducers/StoreLogisticSlice';
import { getItem, transformToIAltPartNumber } from '@/services/utilites';
import Title from 'antd/es/typography/Title';
import ContextMenuWrapper from '@/components/shared/ContextMenuWrapperProps';
import AlternativeTable, { Aternative } from '../AlternativeTable';

import PartNumberSearch from '@/components/store/search/PartNumberSearch';
import StockInfoNew from '@/components/store/search/stockInfo/StockInfoNew';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import Alternates from '../partAdministration/tabs/mainView/Alternates';
import PartContainer from '@/components/woAdministration/PartContainer';
import { ColDef } from 'ag-grid-community';
import { format } from 'date-fns';
import { useGetAltsPartNumbersQuery } from '@/features/partAdministration/altPartApi';

const { Sider, Content } = Layout;

const StockInformationNew: FC = () => {
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
  const { data: altPartNumbers, isLoading: altLoading } =
    useGetAltsPartNumbersQuery(
      {
        partNumberID: selectedPN?._id,
      },
      {
        skip: !selectedPN?._id,
      }
    );
  const transformedAltPartNumbers = useMemo(() => {
    return transformToIAltPartNumber(altPartNumbers || []);
  }, [altPartNumbers]);

  const [openStoreFindModal, setOpenStoreFind] = useState(false);
  const {
    data: partNumbers,
    isLoading: partLoading,
    isError,
  } = useGetPartNumbersQuery({
    group: form.getFieldValue('GROUP'),
    type: form.getFieldValue('TYPE'),
  });
  // const [updatetOrderMaterials, setUpdatedOrderMaterials] = useState(null);
  const partValueEnum: Record<string, any> =
    partNumbers?.reduce((acc, partNumber) => {
      if (partNumber._id) {
        acc[partNumber._id] = partNumber;
      }
      return acc;
    }, {} as Record<string, any>) || {};
  type CellDataType = 'text' | 'number' | 'date' | 'boolean';

  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType;
  }
  const [columnDefs, setColumnDefs] = useState<ExtendedColDef[]>([
    {
      headerName: `${t('ALTERNATE-PART')}`,
      field: 'ALTERNATIVE',
      editable: false,
      cellDataType: 'text',
    },
    {
      field: 'ALTERNATIVE_DESCRIPTION',
      headerName: `${t('ALT. DESCRIPTION')}`,
      cellDataType: 'text',
    },
    {
      field: 'GROUP',
      headerName: `${t('ALT. GROUP')}`,
      cellDataType: 'text',
    },
    {
      field: 'TYPE',
      headerName: `${t('ALT. TYPE')}`,
      cellDataType: 'text',
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('ALT. UNIT OF MEASURE')}`,
      cellDataType: 'text',
    },

    {
      headerName: `${t('APPROVED BY')}`,
      field: 'APPROVED',
      cellDataType: 'text',
      valueFormatter: (params) =>
        params.value ? params.value.toUpperCase() : '',
    },
    {
      headerName: `${t('APPROVED DATE')}`,
      field: 'createDate',
      cellDataType: 'date',
      valueFormatter: (params) => {
        if (!params.value) return '';
        return format(new Date(params.value), 'dd.MM.yyyy');
      },
    },
  ]);
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
              submitter={false}
              onFinish={async (values: any) => {}}
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
                {/* <ProFormCheckbox.Group
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
                /> */}
              </Space>

              <ProFormCheckbox.Group
                labelAlign="left"
                name="GROUP"
                fieldProps={{
                  onChange: (value) => setGroup(value),
                }}
                options={[
                  { label: `${t('TOOL')}`, value: 'TOOL' },
                  { label: `${t('ROT')}`, value: 'ROT' },
                  { label: `${t('CONS')}`, value: 'CONS' },
                  { label: `${t('GSE')}`, value: 'GSE' },
                  { label: `${t('CHEM')}`, value: 'CHEM' },
                ].map((option) => ({
                  ...option,
                  style: { display: 'flex', flexWrap: 'wrap' }, // Добавьте эту строку
                }))}
              />
              <ProFormSelect
                showSearch
                rules={[{ required: true }]}
                width={'lg'}
                name="partNumberID"
                label={`${t(`PART No`)}`}
                // value={partNumber}
                onChange={(value, data: any) => {
                  setSelectedPN(data.data);
                  console.log(data.data);
                }}
                options={Object.entries(partValueEnum).map(([key, part]) => ({
                  label: part.PART_NUMBER,
                  value: key,
                  data: part,
                }))}
              />
            </ProForm>
            <div className="h-[69vh] px-5 overflow-hidden flex flex-col justify-between">
              <Divider></Divider>
              {selectedPN ? (
                <PartContainer
                  isLoading={altLoading}
                  isVisible={false}
                  pagination={false}
                  isAddVisiable={true}
                  isButtonVisiable={false}
                  isEditable={true}
                  height={'34vh'}
                  columnDefs={columnDefs}
                  partNumbers={[]}
                  onUpdateData={(data: any[]): void => {}}
                  rowData={selectedPN ? transformedAltPartNumbers : []}
                />
              ) : (
                <Empty />
              )}
            </div>
            {/* <ModalForm
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
            </ModalForm> */}
          </div>
        )}
      </Sider>
      <Content className="pl-4">
        <div className="h-[82vh] overflow-hidden flex flex-col justify-between gap-5">
          <StockInfoNew
            searchValues={{ isAlternates: isAltertative, isAllDate: isAllDate }}
            selectedItem={selectedPN}
          ></StockInfoNew>
        </div>
      </Content>
    </Layout>
  );
};

export default StockInformationNew;
