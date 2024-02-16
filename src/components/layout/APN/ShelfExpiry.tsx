import { ProCard, ProColumns } from '@ant-design/pro-components';
import {
  Button,
  Layout,
  Menu,
  MenuProps,
  Modal,
  Space,
  TimePicker,
  message,
} from 'antd';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
import RequirementItems from '@/components/store/RequirementItems';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteNames } from '@/router';
import { getItem, handleFileSelect } from '@/services/utilites';
import { WarningOutlined } from '@ant-design/icons';
import ShelfExpiryFilterForm from '../shelfExpiry/ShelfExpiryFilterForm';
import ContextMenuWrapper from '@/components/shared/ContextMenuWrapperProps';
import FilesSelector from '@/components/shared/FilesSelector';
import EditableTable from '@/components/shared/Table/EditableTable';
import { createBookingItem, updateManyMaterialItems } from '@/utils/api/thunks';
import {
  TransactionOutlined,
  EditOutlined,
  ApartmentOutlined,
  PrinterOutlined,
  SaveOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import GeneretedTransferPdf from '@/components/pdf/GeneretedTransferLabels';
import { USER_ID } from '@/utils/api/http';

const ShelfExpiry: FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any>([]);
  type MenuItem = Required<MenuProps>['items'][number];
  const [openKeys, setOpenKeys] = useState(['sub1', 'sub2']);
  const [selectedKey, setSelectedKey] = useState<string>(
    RouteNames.BASETASKLIST
  );
  // const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
  //   const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
  //   if (rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
  //     setOpenKeys(keys);
  //   } else {
  //     setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
  //   }
  // };
  const [collapsed, setCollapsed] = useState(false);
  const items: MenuItem[] = [
    getItem(<>{t('SHELF EXPIRY')} (BAN:359)</>, 'sub1', <WarningOutlined />),
  ];
  const handleCopy = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    navigator.clipboard.writeText(value);
  };
  const handleAdd = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    console.log('Добавить:', value);
  };

  const handleAddPick = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    console.log('Добавить Pick:', value);
  };
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('LOCAL_ID')}`,
      dataIndex: 'LOCAL_ID',
      key: 'LOCAL_ID',
      // tip: 'LOCAL_ID',
      ellipsis: true,
      width: '7%',
      formItemProps: {
        name: 'LOCAL_ID',
      },
      sorter: (a: any, b: any) => a.LOCAL_ID - b.LOCAL_ID, //

      // responsive: ['sm'],
    },

    {
      title: `${t('PN')}`,
      dataIndex: 'PART_NUMBER',
      key: 'PART_NUMBER',
      //tip: 'ITEM PART_NUMBER',
      // ellipsis: true,
      width: '12%',
      formItemProps: {
        name: 'PART_NUMBER',
      },
      render: (text: any, record: any) => {
        return (
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
                  { label: 'Part Tracking', action: handleAdd },
                  { label: 'PickSlip Request', action: handleAddPick },
                ],
              },
            ]}
          >
            <a
              onClick={() => {
                // dispatch(setCurrentProjectTask(record));
                // setOpenRequirementDrawer(true);
                // onReqClick(record);
              }}
            >
              {record.PART_NUMBER}
            </a>
          </ContextMenuWrapper>
        );
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'NAME_OF_MATERIAL',
      key: 'NAME_OF_MATERIAL',
      // tip: 'ITEM STORE',
      ellipsis: true,

      formItemProps: {
        name: 'NAME_OF_MATERIAL',
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('STORE')}`,
      dataIndex: 'STOCK',
      key: 'STOCK',
      // tip: 'ITEM STORE',
      ellipsis: true,
      width: '4%',
      formItemProps: {
        name: 'STOCK',
      },
      render: (text: any, record: any) => {
        return (
          <div
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              // setOpenRequirementDrawer(true);
              // onReqClick(record);
            }}
          >
            {record.STOCK}
          </div>
        );
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('CONDITION')}`,
      dataIndex: 'CONDITION',
      key: 'CONDITION',
      //tip: 'CONDITION',
      ellipsis: true,
      width: '10%',
      formItemProps: {
        name: 'CONDITION',
      },
      render: (text: any, record: any) => {
        return (
          <div
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              // setOpenRequirementDrawer(true);
              // onReqClick(record);
            }}
          >
            {record.CONDITION}
          </div>
        );
      },

      // responsive: ['sm'],
    },

    {
      title: `${t('LOCATION')}`,
      dataIndex: 'SHELF_NUMBER',
      key: 'SHELF_NUMBER',
      //tip: 'ITEM LOCATION',
      ellipsis: true,
      width: '7%',
      formItemProps: {
        name: 'SHELF_NUMBER',
      },

      // responsive: ['sm'],
    },

    {
      title: `${t('BATCH/SERIAL')}`,
      dataIndex: 'SERIAL_NUMBER',
      key: 'SERIAL_NUMBER',
      render: (text: any, record: any) =>
        record.SERIAL_NUMBER || record.SUPPLIER_BATCH_NUMBER,
      // остальные свойства...
    },
    {
      title: `${t('RESEIVING')}`,
      dataIndex: 'ORDER_NUMBER',
      key: 'ORDER_NUMBER',
      //tip: 'ITEM ORDER_NUMBER',
      ellipsis: true,
      width: '7%',
      formItemProps: {
        name: 'ORDER_NUMBER',
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('EXPIRY DATE')}`,
      dataIndex: 'PRODUCT_EXPIRATION_DATE',
      key: 'PRODUCT_EXPIRATION_DATE',
      //tip: 'ITEM EXPIRY DATE',
      ellipsis: true,
      valueType: 'date',
      width: '9%',
      formItemProps: {
        name: 'PRODUCT_EXPIRATION_DATE',
      },
      sorter: (a, b) => {
        if (a.PRODUCT_EXPIRATION_DATE && b.PRODUCT_EXPIRATION_DATE) {
          const aFinishDate = new Date(a.PRODUCT_EXPIRATION_DATE);
          const bFinishDate = new Date(b.PRODUCT_EXPIRATION_DATE);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
      },
      renderFormItem: () => {
        return <TimePicker />;
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('QTY')}`,
      dataIndex: 'QUANTITY',
      key: 'QUANTITY',
      width: '5%',
      responsive: ['sm'],
      search: false,
      render: (text, record) => {
        let backgroundColor;
        if (
          record?.PRODUCT_EXPIRATION_DATE &&
          new Date(record.PRODUCT_EXPIRATION_DATE) >= new Date()
        ) {
          backgroundColor = '#32CD32'; // Красный фон, если PRODUCT_EXPIRATION_DATE меньше текущей даты
        } // Зеленый фон по умолчанию
        if (record?.SHELF_NUMBER === 'TRANSFER') {
          backgroundColor = '#FFDB58'; // Желтый фон для SHELF_NUMBER 'TRANSFER'
        }
        if (
          record?.PRODUCT_EXPIRATION_DATE &&
          new Date(record.PRODUCT_EXPIRATION_DATE) < new Date()
        ) {
          backgroundColor = '#FF0000'; // Красный фон, если PRODUCT_EXPIRATION_DATE меньше текущей даты
        }
        return <div style={{ backgroundColor }}>{text}</div>;
      },
      sorter: (a, b) => a.QUANTITY - b.QUANTITY,
    },
    {
      title: `${t('UNIT')}`,
      dataIndex: 'UNIT_OF_MEASURE',
      key: 'UNIT_OF_MEASURE',
      responsive: ['sm'],
      width: '5%',
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: `${t('OWNER')}`,
      dataIndex: 'OWNER_SHORT_NAME',
      key: 'OWNER_SHORT_NAME',
      width: '6%',
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
    {
      title: `${t('DOC')}`,
      dataIndex: 'DOC',
      key: 'DOC',
      width: '7%',
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      render: (text, record, index) => {
        return record.FILES && record.FILES.length > 0 ? (
          <FilesSelector
            files={record.FILES || []}
            onFileSelect={handleFileSelect}
          />
        ) : (
          <></>
        );
      },
    },
  ];
  const [labelsOpenPrint, setOpenLabelsPrint] = useState<any>();
  const [rowKeys, setselectedRowKeys] = useState<any[]>([]);
  const [selectedParts, setSecectedParts] = useState<any>(null);
  const [onFilterTransferDEtails, setOnFilterTransferDEtails] =
    useState<any>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<any>([]);
  // const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const dispatch = useAppDispatch();
  const [partsToPrint, setPartsToPrint] = useState<any>([]);
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setselectedRowKeys(newSelectedRowKeys);
  };
  return (
    <Layout>
      <Sider
        className="h-[85vh] overflow-hidden"
        theme="light"
        width={370}
        style={
          {
            // marginLeft: 'auto',
            // background: 'rgba(255, 255, 255, 0.2)',
          }
        }
        // trigger
        collapsible
        // color="rgba(255, 255, 255, 0.2)"
        collapsed={collapsed}
        onCollapse={(value: boolean | ((prevState: boolean) => boolean)) =>
          setCollapsed(value)
        }
      >
        {/* {!collapsed && (
          <Title className="px-5" level={5}>
            <>{t('PARTS CONSUMPTION FORECAST (BAN:204)')}</>
          </Title>
        )} */}
        <Menu theme="light" mode="inline" items={items} openKeys={openKeys} />
        <div className="mx-auto px-5">
          <div
            style={{
              display: !collapsed ? 'block' : 'none',
            }}
          >
            <ShelfExpiryFilterForm
              onFilteredParts={function (record: any): void {
                setData(record);
              }}
            />
          </div>
        </div>
      </Sider>
      <Content className="pl-4">
        <div className="h-[82vh]  bg-white px-4 py-3  overflow-hidden flex flex-col justify-between gap-1">
          <div className="flex flex-col gap-5">
            <EditableTable
              showSearchInput={true}
              data={data}
              initialColumns={initialColumns}
              isLoading={false}
              menuItems={undefined}
              recordCreatorProps={false}
              onSelectedRowKeysChange={handleSelectedRowKeysChange}
              onMultiSelect={(record: any, rowIndex?: any) => {
                const materials = record.map((item: any) => item);
                // console.log(locationNames);
                setSelectedMaterials(materials);
              }}
              onRowClick={function (record: any, rowIndex?: any): void {
                setSelectedMaterials(
                  (prevSelectedItems: (string | undefined)[]) =>
                    prevSelectedItems && prevSelectedItems.includes(record._id)
                      ? []
                      : [record]
                );
              }}
              onSave={function (rowKey: any, data: any, row: any): void {}}
              yScroll={60}
              externalReload={function () {}}
            />
          </div>
          <div className="flex justify-between">
            <Space>
              <Button
                icon={<ArrowRightOutlined />}
                disabled={!rowKeys?.length}
                onClick={() => {
                  const currentCompanyID = localStorage.getItem('companyID');
                  Modal.confirm({
                    title: `${t(
                      'YOU WANT TRANSFER PARTS TO SCRAP LOCATION'
                    )}  ${'SCRAP'}`,
                    onOk: async () => {
                      Modal.confirm({
                        title: t('CONFIRM TRANSFER'),
                        okText: 'CONFIRM',
                        cancelText: 'CANCEL',
                        okButtonProps: {
                          style: { display: 'inline-block', margin: '1 auto' },
                        },
                        cancelButtonProps: {
                          style: { display: 'inline-block', margin: '1 auto' },
                        },
                        content: (
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Button
                              icon={<ArrowRightOutlined />}
                              onClick={() => {
                                setOpenLabelsPrint(true);

                                // Создаем новый массив с измененными значениями
                                const updatedSelectedParts =
                                  selectedMaterials.map((part: any) => ({
                                    ...part,
                                    SHELF_NUMBER: 'SCRAP',

                                    STOCK: selectedMaterials[0]?.STOCK,
                                  }));

                                // Обновляем partsToPrint в зависимости от условия
                                setPartsToPrint(updatedSelectedParts);
                              }}
                            >
                              PRINT NEW LABELS
                            </Button>
                          </div>
                        ),
                        onOk: async () => {
                          const result = await dispatch(
                            updateManyMaterialItems({
                              companyID: currentCompanyID || '',
                              ids: rowKeys,
                              // STOCK: selectedMaterials[0]?.STOCK,
                              LOCATION: 'SCRAP',
                              // OWNER: onFilterBookingDEtails?.owner || '',
                            })
                          );
                          if (result.meta.requestStatus === 'fulfilled') {
                            message.success(t('SCRAP PART SUCCESSFULY'));
                            setselectedRowKeys([]);
                            console.log(selectedMaterials);
                            selectedMaterials.forEach(async (result: any) => {
                              await dispatch(
                                createBookingItem({
                                  companyID: result.COMPANY_ID,
                                  data: {
                                    companyID: result.COMPANY_ID,
                                    userSing:
                                      localStorage.getItem('singNumber') || '',
                                    userID: USER_ID || '',
                                    createDate: new Date(),
                                    PART_NUMBER: result.PART_NUMBER,
                                    station:
                                      result?.WAREHOUSE_RECEIVED_AT || 'N/A',
                                    voucherModel: 'CHANGE_LOCATION',
                                    WAREHOUSE_RECEIVED_AT:
                                      result?.WAREHOUSE_RECEIVED_AT || 'N/A',
                                    SHELF_NUMBER: result?.SHELF_NUMBER,
                                    ORDER_NUMBER: result?.ORDER_NUMBER,
                                    PRICE: result?.PRICE,
                                    CURRENCY: result?.CURRENCY,
                                    QUANTITY: -result?.QUANTITY,
                                    SUPPLIER_BATCH_NUMBER:
                                      result?.SUPPLIER_BATCH_NUMBER,
                                    OWNER: result?.OWNER_SHORT_NAME,
                                    GROUP: result?.GROUP,
                                    TYPE: result?.TYPE,
                                    CONDITION: result?.CONDITION,
                                    NAME_OF_MATERIAL: result?.NAME_OF_MATERIAL,
                                    STOCK: result?.STOCK,
                                    RECEIVED_DATE: result?.RECEIVED_DATE,
                                    UNIT_OF_MEASURE: result.UNIT_OF_MEASURE,
                                    SUPPLIES_CODE: result?.SUPPLIES_CODE || '',
                                    SUPPLIES_LOCATION:
                                      result?.SUPPLIES_LOCATION || '',
                                    SUPPLIER_NAME: result?.SUPPLIER_NAME,
                                    SUPPLIER_SHORT_NAME:
                                      result?.SUPPLIER_SHORT_NAME,
                                    SUPPLIER_UNP: result?.SUPPLIER_UNP,
                                    SUPPLIES_ID: result?.SUPPLIES_ID,
                                    IS_RESIDENT: result?.IS_RESIDENT,
                                    ADD_UNIT_OF_MEASURE:
                                      result?.ADD_UNIT_OF_MEASURE,
                                    ADD_NAME_OF_MATERIAL:
                                      result?.ADD_NAME_OF_MATERIAL,
                                    ADD_PART_NUMBER: result?.ADD_PART_NUMBER,
                                    ADD_QUANTITY: result?.ADD_QUANTITY,
                                    OWNER_SHORT_NAME: result?.OWNER_SHORT_NAME,
                                    OWNER_LONG_NAME: result?.OWNER_LONG_NAME,
                                    PRODUCT_EXPIRATION_DATE:
                                      result?.PRODUCT_EXPIRATION_DATE,
                                    SERIAL_NUMBER: result.SERIAL_NUMBER,
                                    APPROVED_CERT: result?.APPROVED_CERT,
                                    AWB_REFERENCE: result?.AWB_REFERENCE || '',
                                    AWB_TYPE: result?.AWB_TYPE || '',
                                    AWB_NUMBER: result?.AWB_NUMBER || '',
                                    AWB_DATE: result?.AWB_DATE || '',
                                    RECEIVING_NUMBER: result?.RECEIVING_NUMBER,
                                    RECEIVING_ITEM_NUMBER:
                                      result.RECEIVING_ITEM_NUMBER,
                                    CERTIFICATE_NUMBER:
                                      result?.CERTIFICATE_NUMBER,
                                    CERTIFICATE_TYPE: result?.CERTIFICATE_TYPE,
                                    REVISION: result?.REVISION,
                                    IS_CUSTOMER_GOODS:
                                      result?.IS_CUSTOMER_GOODS,
                                    LOCAL_ID: result?.LOCAL_ID,
                                  },
                                })
                              );
                            });
                            result.payload.forEach(async (result: any) => {
                              await dispatch(
                                createBookingItem({
                                  companyID: result.COMPANY_ID,
                                  data: {
                                    companyID: result.COMPANY_ID,
                                    userSing:
                                      localStorage.getItem('singNumber') || '',
                                    userID: USER_ID || '',
                                    createDate: new Date(),
                                    PART_NUMBER: result.PART_NUMBER,
                                    station:
                                      result?.WAREHOUSE_RECEIVED_AT || 'N/A',
                                    voucherModel: 'CHANGE_LOCATION',
                                    WAREHOUSE_RECEIVED_AT:
                                      result?.WAREHOUSE_RECEIVED_AT || 'N/A',
                                    SHELF_NUMBER: result?.SHELF_NUMBER,
                                    ORDER_NUMBER: result?.ORDER_NUMBER,
                                    PRICE: result?.PRICE,
                                    CURRENCY: result?.CURRENCY,
                                    QUANTITY: result?.QUANTITY,
                                    SUPPLIER_BATCH_NUMBER:
                                      result?.SUPPLIER_BATCH_NUMBER,
                                    OWNER: result?.OWNER_SHORT_NAME,
                                    GROUP: result?.GROUP,
                                    TYPE: result?.TYPE,
                                    CONDITION: result?.CONDITION,
                                    NAME_OF_MATERIAL: result?.NAME_OF_MATERIAL,
                                    STOCK: result?.STOCK,
                                    RECEIVED_DATE: result?.RECEIVED_DATE,
                                    UNIT_OF_MEASURE: result.UNIT_OF_MEASURE,
                                    SUPPLIES_CODE: result?.SUPPLIES_CODE || '',
                                    SUPPLIES_LOCATION:
                                      result?.SUPPLIES_LOCATION || '',
                                    SUPPLIER_NAME: result?.SUPPLIER_NAME,
                                    SUPPLIER_SHORT_NAME:
                                      result?.SUPPLIER_SHORT_NAME,
                                    SUPPLIER_UNP: result?.SUPPLIER_UNP,
                                    SUPPLIES_ID: result?.SUPPLIES_ID,
                                    IS_RESIDENT: result?.IS_RESIDENT,
                                    ADD_UNIT_OF_MEASURE:
                                      result?.ADD_UNIT_OF_MEASURE,
                                    ADD_NAME_OF_MATERIAL:
                                      result?.ADD_NAME_OF_MATERIAL,
                                    ADD_PART_NUMBER: result?.ADD_PART_NUMBER,
                                    ADD_QUANTITY: result?.ADD_QUANTITY,
                                    OWNER_SHORT_NAME: result?.OWNER_SHORT_NAME,
                                    OWNER_LONG_NAME: result?.OWNER_LONG_NAME,
                                    PRODUCT_EXPIRATION_DATE:
                                      result?.PRODUCT_EXPIRATION_DATE,
                                    SERIAL_NUMBER: result.SERIAL_NUMBER,
                                    APPROVED_CERT: result?.APPROVED_CERT,
                                    AWB_REFERENCE: result?.AWB_REFERENCE || '',
                                    AWB_TYPE: result?.AWB_TYPE || '',
                                    AWB_NUMBER: result?.AWB_NUMBER || '',
                                    AWB_DATE: result?.AWB_DATE || '',
                                    RECEIVING_NUMBER: result?.RECEIVING_NUMBER,
                                    RECEIVING_ITEM_NUMBER:
                                      result.RECEIVING_ITEM_NUMBER,
                                    CERTIFICATE_NUMBER:
                                      result?.CERTIFICATE_NUMBER,
                                    CERTIFICATE_TYPE: result?.CERTIFICATE_TYPE,
                                    REVISION: result?.REVISION,
                                    IS_CUSTOMER_GOODS:
                                      result?.IS_CUSTOMER_GOODS,
                                    LOCAL_ID: result?.LOCAL_ID,
                                  },
                                })
                              );
                            });
                          }
                        },
                      });
                    },
                  });
                }}
                size="small"
              >
                {t('MOOVE TO SCRAP LOCATION')}
              </Button>
            </Space>
            <Modal
              title={t('PRINT LABEL')}
              open={labelsOpenPrint}
              width={'30%'}
              onCancel={() => {
                setOpenLabelsPrint(false);
                // setSecectedLocation(null);
                // setSecectedSingleLocation(null);
              }}
              footer={null}
            >
              <GeneretedTransferPdf
                key={Date.now()} // добавляем уникальный ключ
                // type="scrap"
                parts={partsToPrint}
              />
            </Modal>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default ShelfExpiry;
