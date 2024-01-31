import {
  Button,
  DatePicker,
  Form,
  Input,
  Layout,
  Menu,
  MenuProps,
  Modal,
  Select,
  Space,
  TimePicker,
  message,
} from 'antd';
import Sider from 'antd/es/layout/Sider';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { getItem } from '@/services/utilites';
import PickSlipFiltered from '@/components/store/pickSlip/PickSlipFiltered';
import { Content } from 'antd/es/layout/layout';
import MaterialOrdersList from '@/components/store/matOrders/MaterialOrders';
import { ProCard, ProColumns, ProForm } from '@ant-design/pro-components';
import EditableSelectedPickSlip from '@/components/shared/Table/EditableSelectedPickSlip';
import UserSearchForm from '@/components/shared/form/UserSearchProForm';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import { UserResponce } from '@/models/IUser';
import {
  createBookingItem,
  createReturnSlip,
  getFilteredShops,
  postNewReceivingItem,
  postNewStoreItem,
  updatedMaterialOrdersById,
} from '@/utils/api/thunks';
import GeneretedPickSlip from '@/components/pdf/GeneretedPickSlip';
import {
  setUpdatedMaterialOrder,
  setUpdatedMaterialOrderCancel,
} from '@/store/reducers/StoreLogisticSlice';
import GeneretedReturnSlip from '@/components/pdf/GeneretedReturnSlip';
import DoubleClickPopover from '@/components/shared/form/DoubleClickProper';
import PartNumberSearch from '@/components/store/search/PartNumberSearch';
import { t } from 'i18next';
import { render } from 'react-dom';
import SearchTable from '../SearchElemTable';
import { USER_ID } from '@/utils/api/http';

const PickSlipCancel: FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();
  const [LOCATION, setLOCATION] = useState([]); //

  type MenuItem = Required<MenuProps>['items'][number];
  const items: MenuItem[] = [
    getItem(
      <>{t('CANCEL PICKSLIP (BAN:309)')}</>,
      'sub1',
      <ShoppingCartOutlined />
    ),
    // ]
    // ),
  ];
  const { RangePicker } = DatePicker;
  const [selectedLocation, setSecectedLocation] = useState<any>(null);
  const [selectedSingleLocation, setSecectedSingleLocation] =
    useState<any>(null);
  const [openLocationViewer, setOpenLocationViewer] = useState<boolean>(false);
  const [selectPickSlip, onSelectPickSlip] = useState<any>();
  const [tableData, setTableData] = useState<
    {
      QTYCANCEL(QTYCANCEL: any): unknown;
      status: any;
      materialID: string;
      id?: string;
      _id?: string;
      key: string;
      onBlock: any[];
      LOCATION_TO?: any;
      getFrom?: '';
    }[]
  >([]);
  useEffect(() => {
    if (tableData) {
      // Если модальное окно открыто
      const currentCompanyID = localStorage.getItem('companyID') || '';
      dispatch(
        getFilteredShops({
          companyID: currentCompanyID,
          shopShortName: tableData[0]?.getFrom,
        })
      ).then((action) => {
        if (action.meta.requestStatus === 'fulfilled') {
          const transformedData = action.payload[0].locations.map(
            (item: any) => ({
              ...item,
              APNNBR: item.locationName, // Преобразуем shopShortName в APNNBR
            })
          );

          setLOCATION(transformedData);
          // Обновляем состояние с преобразованными данными
        }
      });
    }
  }, [openLocationViewer]);

  const [openPickCancel, setOpenPickCancel] = useState(false);
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('PN')}`,
      dataIndex: 'PART_NUMBER',
      key: 'PART_NUMBER',
      ellipsis: true,
      formItemProps: {
        name: 'PART_NUMBER',
      },
      editable: (text, record, index) => {
        return false;
      },
      width: '10%',

      // responsive: ['sm'],
    },
    {
      title: `${t('SN/BN')}`,
      dataIndex: 'BATCH_ID',
      key: 'BATCH_ID',
      ellipsis: true,
      formItemProps: {
        name: 'BATCH_ID',
      },
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return <a>{record.foRealese ? record.foRealese.BATCH_ID : text}</a>;
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'NAME_OF_MATERIAL',
      key: 'NAME_OF_MATERIAL',
      // responsive: ['sm'],
      tip: 'Text Show',
      ellipsis: true, //
      width: '10%',
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: `${t('STORE')}`,
      dataIndex: 'STOCK',
      key: 'STOCK',
      // responsive: ['sm'],

      ellipsis: true, //

      editable: (text, record, index) => {
        return false;
      },
    },

    {
      title: `${t('LOCATION')}`,
      dataIndex: 'SHELF_NUMBER',
      key: 'SHELF_NUMBER',
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      formItemProps: {
        name: 'SHELF_NUMBER',
      },
      width: '8%',
      render: (text: any, record: any) => {
        return (
          <div>{record.foRealese ? record.foRealese.SHELF_NUMBER : text}</div>
        );
      },
    },
    {
      title: `${t('UNIT')}`,
      dataIndex: 'UNIT_OF_MEASURE',
      key: 'UNIT_OF_MEASURE',
      responsive: ['sm'],
      search: false,
      editable: (text, record, index) => {
        return false;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: 'BATCH ID',
      dataIndex: 'SUPPLIER_BATCH_NUMBER',
      // valueType: 'index',
      ellipsis: true,
      key: 'SUPPLIER_BATCH_NUMBER',
      width: '6%',

      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return (
          <div>
            {record?.foRealese ? record?.foRealese.SUPPLIER_BATCH_NUMBER : text}
          </div>
        );
      },
      // sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },

    {
      title: `${t('EXPIRES')}`,
      dataIndex: 'PRODUCT_EXPIRATION_DATE',
      key: 'PRODUCT_EXPIRATION_DATE',
      //tip: 'ITEM EXPIRY DATE',
      ellipsis: true,
      width: '6%',
      valueType: 'date',
      formItemProps: {
        name: 'PRODUCT_EXPIRATION_DATE',
      },
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return (
          <div>
            {record.foRealese ? record.foRealese.PRODUCT_EXPIRATION_DATE : text}
          </div>
        );
      },

      renderFormItem: () => {
        return <TimePicker />;
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('LABEL')}`,
      dataIndex: 'LOCAL_ID',
      key: 'LOCAL_ID',
      // responsive: ['sm'],
      tip: 'Text Show',
      ellipsis: true, //
      render: (text: any, record: any) => {
        return <a>{record.foRealese ? record.foRealese.LOCAL_ID : text}</a>;
      },
      editable: (text, record, index) => {
        return false;
      },
      // width: '20%',
    },
    {
      title: `${t('BOOKED')}`,
      dataIndex: 'QUANTITY_BOOK',
      key: 'QUANTITY_BOOK',
      ellipsis: true, //
      responsive: ['sm'],
      search: false,
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: `${t('CANCELLED')}`,
      ellipsis: true, //
      dataIndex: 'CANCELED_QUANTITY',
      key: 'CANCELED_QUANTITY',
      responsive: ['sm'],
      search: false,
      width: '7%',
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return (
          <div>{record?.CANCELED_QUANTITY ? record?.CANCELED_QUANTITY : 0}</div>
        );
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('CANCEL QTY')}`,
      dataIndex: 'QTYCANCEL',
      key: 'QTYCANCEL',
      responsive: ['sm'],
      search: false,
      width: '8%',
      valueType: 'digit',
      render: (text: any, record: any) => {
        return <div>{record?.QTYCANCEL ? record?.QTYCANCEL : 0}</div>;
      },
      editable: (text, record, index) => {
        return true;
      },
      // Добавьте валидацию формы
      // formItemProps: {
      //   rules: [
      //     {
      //       validator: async (_, value) => {
      //         if (value > record.QUANTITY_BOOK - record.CANCELED_QUANTITY) {
      //           throw new Error(
      //             'QTYCANCEL cannot be greater than QUANTITY_BOOK - CANCELED_QUANTITY'
      //           );
      //         }
      //       },
      //     },
      //   ],
      //   getValueFromEvent: (e) => {
      //     const { value } = e.target;
      //     if (value > record.QUANTITY_BOOK - record.CANCELED_QUANTITY) {
      //       return record.QUANTITY_BOOK - record.CANCELED_QUANTITY;
      //     }
      //     return value;
      //   },
      // },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: `${t('LOC. TO')}`,
      dataIndex: 'LOCATION_TO',
      key: 'LOCATION_TO',
      ellipsis: true,
      // valueType: 'select',
      editable: (text, record, index) => {
        return true;
      },
      filterSearch: true,
      // valueEnum: {
      //   'MSQ-REQ': { text: 'MSQ-REQ' },
      //   'MST-REQ': { text: 'MST-REQ' },
      // },

      // width: '6%',
      // render: (text: any, record: any) => {
      //   return <div>{record.LOCATION_TO ? record.LOCATION_TO : text}</div>;
      // },
      renderFormItem: (item2, { onChange }) => {
        return (
          <DoubleClickPopover
            content={
              <div className="flex my-0 mx-auto  h-[50vh] flex-col relative overflow-hidden">
                <ProCard
                  className="flex mx-auto justify-center align-middle"
                  style={{}}
                >
                  {LOCATION && (
                    <SearchTable
                      scroll={32}
                      data={LOCATION}
                      onRowClick={function (record: any, rowIndex?: any): void {
                        setSecectedLocation(record);
                        setOpenLocationViewer(false);
                      }}
                      onRowSingleClick={function (
                        record: any,
                        rowIndex?: any
                      ): void {
                        setSecectedSingleLocation(record);
                      }}
                    ></SearchTable>
                  )}
                </ProCard>
              </div>
            }
            overlayStyle={{ width: '50%' }}
          >
            <Input value={selectedLocation?.locationName} />
          </DoubleClickPopover>
        );
      },
      // responsive: ['sm'],
    },

    {
      title: `${t('Status')}`,
      key: 'status',
      width: '11%',
      valueType: 'select',
      filterSearch: true,
      filters: true,
      ellipsis: true, //
      editable: (text, record, index) => {
        return false;
      },
      // onFilter: true,
      valueEnum: {
        issued: { text: t('ISSUED'), status: 'Processing' },
        open: { text: t('NEW'), status: 'Error' },
        closed: { text: t('CLOSED'), status: 'Default' },
        cancelled: { text: t('CANCELLED'), status: 'Error' },
        partyCancelled: { text: t('PARTY_CANCELLED'), status: 'Error' },
        transfer: { text: t('TRANSFER'), status: 'Processing' },
        completed: { text: t('COMPLETED'), status: 'Success' },
      },

      dataIndex: 'status',
    },

    {
      title: `${t('OPTION')}`,
      valueType: 'option',
      key: 'option',
      // width: '9%',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record._id);
          }}
        >
          Edit
        </a>,
      ],
    },
  ];
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [form] = Form.useForm();
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const { filteredMaterialOrders, filteredPickSlipsForCancel } =
    useTypedSelector((state) => state.storesLogistic);
  const dispatch = useAppDispatch();
  const [selectedStoreUser, setSelectedStoreUser] =
    useState<UserResponce | null>();
  const [selectedСonsigneeUser, setSelectedСonsigneeUser] =
    useState<UserResponce | null>();
  const [openPickReturn, setOpenPickReturn] = useState(false);
  const [selectedReturnPickID, setSelectedReturnPickID] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    setModalVisible(false);
    setSelectedReturnPickID(null);
  }, [selectPickSlip]);
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
        <Menu theme="light" className="h-max" mode="inline" items={items} />
        <div className="mx-auto px-5">
          <div
            style={{
              display: !collapsed ? 'block' : 'none',
            }}
          >
            <PickSlipFiltered
              canselVoidType={true}
              onFilterPickSlip={() => null}
            ></PickSlipFiltered>
          </div>
        </div>
      </Sider>
      <Content className="pl-4">
        <div className="h-[82vh] overflow-hidden flex flex-col">
          <div className="h-[55%]">
            <MaterialOrdersList
              canselVoidType={true}
              data={[]}
              scroll={25}
              isLoading={false}
              onRowClick={(record) => {
                setSelectedRowKeys([]);
                onSelectPickSlip(record);
                setTableData(
                  record?.materials.flatMap(
                    (item: {
                      CANCELED_QUANTITY: any;
                      id: any;
                      QTYCANCEL: any;
                      LOCATION_TO: any;
                      QUANTITY_BOOK: any;
                      onBlock: any[];
                      status: any;
                    }) =>
                      item.onBlock.map((blockItem) => ({
                        ...blockItem,
                        status: item?.status,
                        QUANTITY_BOOK: item?.QUANTITY_BOOK,
                        LOCATION_TO: item?.LOCATION_TO || '',
                        QTYCANCEL: item?.QTYCANCEL || 0,
                        CANCELED_QUANTITY: item?.CANCELED_QUANTITY || 0,
                        materialID: item.id,
                      }))
                  ) || []
                );
              }}
              onDoubleRowClick={(record) => {
                // console.log(record);
                // console.log(tableData);
              }}
            ></MaterialOrdersList>
          </div>

          <EditableSelectedPickSlip
            data={tableData}
            initialColumns={initialColumns}
            isLoading={false}
            menuItems={[]}
            recordCreatorProps={false}
            onSelectedRowKeysChange={handleSelectedRowKeysChange}
            onRowClick={function (record: any, rowIndex?: any): void {}}
            onSave={function (rowKey: any, data: any, row: any): void {
              // Проверить, что QTYCANCEL не больше, чем QUANTITY_BOOK - CANCELED_QUANTITY
              if (
                data.QTYCANCEL >
                Number(data.QUANTITY_BOOK) - Number(data.CANCELED_QUANTITY || 0)
              ) {
                // Показать сообщение об ошибке
                message.error(
                  'QTYCANCEL cannot be greater than AVAILABLE QUANTITY'
                );

                data.QTYCANCEL =
                  Number(data.QUANTITY_BOOK) -
                  Number(data.CANCELED_QUANTITY || 0);
                data.status = 'cancelled';
              }
              if (
                data.QTYCANCEL <
                Number(data.QUANTITY_BOOK) - Number(data.CANCELED_QUANTITY || 0)
              ) {
                data.status = 'partyCancelled';
              }
              if (
                data.QTYCANCEL ===
                Number(data.QUANTITY_BOOK) - Number(data.CANCELED_QUANTITY || 0)
              ) {
                data.status = 'cancelled';
              }
              if (!data.LOCATION_TO) {
                message.error('SELECT LOCATION');
              }
              if (data.LOCATION_TO) {
                // Показать сообщение об ошибке
                // message.error('SELECT LOCATION');
                // console.log(data);

                // data.LOCATION_TO = selectedLocation?.locationName;
                if (
                  data.QTYCANCEL ==
                  Number(data.QUANTITY_BOOK) -
                    Number(data.CANCELED_QUANTITY || 0)
                ) {
                  data.status = 'cancelled';
                }
                if (
                  data.QTYCANCEL <
                  Number(data.QUANTITY_BOOK) -
                    Number(data.CANCELED_QUANTITY || 0)
                ) {
                  data.status = 'partyCancelled';
                }
                data.LOCATION_TO = selectedLocation?.locationName;
              }

              const index = tableData.findIndex((item) => item._id === rowKey);

              if (index > -1) {
                // Создать новый массив с обновленными данными
                const newData = [...tableData];
                // Заменить элемент в найденном индексе на новые данные
                data.LOCATION_TO = selectedLocation?.locationName;
                newData[index] = data;
                // Обновить состояние tableData
                setTableData(newData);
                // console.log(newData);
              }
            }}
            yScroll={30}
            externalReload={function () {
              throw new Error('Function not implemented.');
            }}
          ></EditableSelectedPickSlip>
          <div className="mt-auto">
            <Space>
              <Button
                disabled={!selectPickSlip}
                onClick={() => setOpenPickReturn(true)}
                size="small"
              >
                {t('PRINT')}
              </Button>
              <Button
                disabled={!selectedRowKeys.length}
                onClick={() => setOpenPickCancel(true)}
                size="small"
              >
                {t('CANCEL_PICKSLIP')}
              </Button>
            </Space>

            {openPickReturn && (
              <Select
                className="mx-5"
                // size="middle"
                style={{ width: 200 }}
                // placeholder="
                onChange={(value) => {
                  setSelectedReturnPickID(value);
                  setModalVisible(true);
                }}
              >
                {selectPickSlip?.returnPickIDs.map(
                  (item: { returnPickNumber: ReactNode; id: any }) => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.returnPickNumber}
                    </Select.Option>
                  )
                )}
              </Select>
            )}

            {/* {modalVisible && ( */}
            <Modal
              width={'50%'}
              title="RETURN SLIP"
              open={modalVisible}
              onOk={() => setModalVisible(false)}
              onCancel={() => {
                setOpenPickReturn(false);
                setModalVisible(false);
              }}
            >
              <GeneretedReturnSlip currentPickSlipID={selectedReturnPickID} />
            </Modal>
            {/* )} */}
          </div>
        </div>
      </Content>
      {/* <Modal
        title="PICKSLIP "
        open={openPickReturn}
        width={'60%'}
        onCancel={() => setOpenPickReturn(false)}
        footer={null}
      >
        <GeneretedPickSlip currentPickSlipID={selectPickSlip?.pickSlipID} />
      </Modal> */}
      <Modal
        title=""
        open={openPickCancel}
        width={'60%'}
        onCancel={() => setOpenPickCancel(false)}
        footer={null}
      >
        {' '}
        <ProForm
          size={'small'}
          form={form}
          autoComplete="off"
          onFinish={async (values: any) => {
            Modal.confirm({
              title: t('CONFIRM CANCEL'),
              onOk: async () => {
                const updatedMaterials = selectPickSlip.materials.map(
                  (item: any) => {
                    let newItem = { ...item };
                    const matchedItem = tableData.find(
                      (tableItem) => tableItem.materialID === item.id
                    );
                    if (matchedItem) {
                      newItem.status = matchedItem.status;
                      newItem.LOCATION_TO = matchedItem.LOCATION_TO;
                      newItem.CANCELED_QUANTITY =
                        Number(newItem.CANCELED_QUANTITY || 0) +
                        Number(matchedItem.QTYCANCEL);
                      if (newItem.onBlock && newItem.onBlock.length > 0) {
                        newItem.onBlock = newItem.onBlock.map(
                          (
                            block: { CANCELED_QUANTITY: any },
                            index: number
                          ) => {
                            if (index === 0) {
                              return {
                                ...block,
                                CANCELED_QUANTITY:
                                  Number(block.CANCELED_QUANTITY || 0) +
                                  Number(matchedItem.QTYCANCEL),
                                STATUS: matchedItem.status,
                                QTYCANCEL: Number(matchedItem.QTYCANCEL) || 0,
                              };
                            }
                            return block;
                          }
                        );
                      }
                      if (newItem.foRealesе && newItem.foRealesе.length > 0) {
                        newItem.foRealesе = newItem.foRealesе.map(
                          (
                            release: { CANCELED_QUANTITY: any },
                            index: number
                          ) => {
                            if (index === 0) {
                              return {
                                ...release,
                                CANCELED_QUANTITY:
                                  Number(release.CANCELED_QUANTITY || 0) +
                                  Number(matchedItem.QTYCANCEL),
                                STATUS: matchedItem.status,
                                QTYCANCEL: Number(matchedItem.QTYCANCEL) || 0,
                              };
                            }
                            return release;
                          }
                        );
                      }
                    }
                    return newItem;
                  }
                );

                let status = 'closed';
                if (
                  updatedMaterials.some(
                    (item: any) => item.status === 'partyCancelled'
                  )
                ) {
                  status = 'partyCancelled';
                } else if (
                  updatedMaterials.every(
                    (item: any) => item.status === 'cancelled'
                  )
                ) {
                  status = 'cancelled';
                }

                const result = await dispatch(
                  updatedMaterialOrdersById({
                    ...selectPickSlip,
                    status: status,
                    materials: updatedMaterials,
                    updateUserID: USER_ID,
                    updateDate: new Date(),
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  setOpenPickCancel(false);
                  onSelectPickSlip(result.payload);
                  const currentCompanyID = localStorage.getItem('companyID');
                  if (currentCompanyID) {
                    const result = await dispatch(
                      createReturnSlip({
                        materialAplicationId:
                          selectPickSlip._id || selectPickSlip.id || '',
                        status: 'closed',
                        materials: updatedMaterials.reduce(
                          (acc: any, item: any) => {
                            if (item?.onBlock) {
                              const onBlockWithLocation = item.onBlock.map(
                                (block: any) => ({
                                  ...block,
                                  LOCATION_TO: item.LOCATION_TO,
                                })
                              );
                              return acc.concat(onBlockWithLocation);
                            }
                            return acc;
                          },
                          []
                        ),
                        createDate: new Date(),
                        consigneeName: selectPickSlip.createBy,
                        storeMan: selectedStoreUser?.name,
                        storeManID: selectedStoreUser?._id || '',
                        recipient: selectedСonsigneeUser?.name,
                        recipientID: selectedСonsigneeUser?._id,
                        taskNumber: selectPickSlip.taskNumber,
                        registrationNumber: selectPickSlip.registrationNumber,
                        planeType: selectPickSlip.planeType,
                        projectWO: selectPickSlip.projectWO,
                        projectTaskWO: selectPickSlip.projectTaskWO,
                        materialAplicationNumber:
                          selectPickSlip.materialAplicationNumber,
                        additionalTaskID: selectPickSlip.additionalTaskID,
                        store: selectPickSlip.getFrom,
                        workshop: selectPickSlip.neededOn,
                        companyID: currentCompanyID,
                      })
                    );
                    if (result.meta.requestStatus === 'fulfilled') {
                      result.payload.registrationNumber &&
                        result.payload?.materials &&
                        result.payload?.materials.forEach(
                          async (resultItem: any) => {
                            resultItem?.QTYCANCEL &&
                              (await dispatch(
                                createBookingItem({
                                  companyID: resultItem.COMPANY_ID,
                                  data: {
                                    companyID: resultItem.COMPANY_ID,
                                    userSing: result.payload?.storeMan,
                                    userID: result.payload?.storeManID || '',
                                    createDate: new Date(),
                                    partNumber: resultItem.PART_NUMBER,
                                    station:
                                      resultItem?.WAREHOUSE_RECEIVED_AT ||
                                      'N/A',
                                    store: resultItem.STOCK,
                                    voucherModel: 'BACK_TO_STORE',
                                    location: resultItem?.LOCATION_TO,
                                    orderNumber: resultItem?.ORDER_NUMBER,
                                    price: resultItem?.PRICE,
                                    currency: resultItem?.CURRENCY,
                                    quantity: resultItem?.QTYCANCEL,
                                    owner: resultItem?.OWNER_SHORT_NAME,
                                    batchNumber:
                                      resultItem?.SUPPLIER_BATCH_NUMBER,
                                    serialNumber: resultItem?.SERIAL_NUMBER,
                                    partGroup: resultItem?.GROUP,
                                    partType: resultItem?.TYPE,
                                    condition: resultItem?.CONDITION,
                                    description: resultItem?.NAME_OF_MATERIAL,
                                    registrationNumber:
                                      result.payload?.registrationNumber,
                                    planeType:
                                      result.payload?.registrationNumber,
                                    projectWO: result.payload?.projectWO,
                                    workshop: result.payload?.workshop,
                                    projectTaskWO:
                                      result.payload?.projectTaskWO,
                                    additionalTaskID:
                                      result.payload?.additionalTaskID,
                                    label: resultItem?.LOCAL_ID,
                                  },
                                })
                              ));
                          }
                        );
                      const updatedReturnMaterialStore = await Promise.all(
                        result.payload?.materials.map(async (item: any) => {
                          const { _id, ...onBlockWithoutId } = item;
                          const onBlockWithLocation = {
                            ...onBlockWithoutId,
                            QUANTITY: item.QTYCANCEL,
                            IS_RETURNED: true,
                            SHELF_NUMBER: item?.LOCATION_TO,
                          };
                          await dispatch(postNewStoreItem(onBlockWithLocation));
                          return dispatch(
                            postNewReceivingItem({
                              ...onBlockWithLocation,
                              MATERIAL_STORE_ID: item?._id,
                              createDate: new Date(),
                              SHELF_NUMBER: item?.LOCATION_TO,
                            })
                          );
                        })
                      );
                      const result1 = await dispatch(
                        updatedMaterialOrdersById({
                          companyID: localStorage.getItem('companyID') || '',
                          _id: selectPickSlip._id,

                          updateUserID: USER_ID,
                          updateDate: new Date(),
                          returnPickIDs: selectPickSlip.returnPickIDs
                            ? [
                                ...selectPickSlip.returnPickIDs,
                                {
                                  id: result.payload.id,
                                  returnPickNumber:
                                    result.payload.returnSlipNumber,
                                  createDate: result.payload.createDate,
                                },
                              ]
                            : [
                                {
                                  id: result.payload.id,
                                  returnPickNumber:
                                    result.payload.returnSlipNumber,
                                  createDate: result.payload.createDate,
                                },
                              ],
                        })
                      );
                      const indexCancel = filteredPickSlipsForCancel.findIndex(
                        (itemR: any) => itemR._id === result1.payload._id
                      );
                      const index = filteredMaterialOrders.findIndex(
                        (itemR: any) => itemR._id === result1.payload._id
                      );
                      dispatch(
                        setUpdatedMaterialOrderCancel({
                          index: indexCancel,
                          item: result1.payload,
                        })
                      );
                      dispatch(
                        setUpdatedMaterialOrder({
                          index: index,
                          item: result1.payload,
                        })
                      );
                      setSelectedRowKeys([]);
                    }
                  }
                }
              },
            });
          }}
        >
          <div className="flex justify-between content-center h-[25vh] justify-items-center gap-2">
            <div
              style={{
                border: '0.5px solid #ccc',
                padding: '10px',
                marginBottom: '5px',
                borderRadius: '5px',
                // flex: 1,
              }}
            >
              <h4 className="storeman">{t('STOREMAN')}</h4>
              <ProForm.Item style={{ width: '100%' }}>
                <UserSearchForm
                  // performedName={localStorage.getItem('name')}
                  actionNumber={null}
                  // performedSing={localStorage.getItem('singNumber')}
                  onUserSelect={(user) => {
                    setSelectedStoreUser(user);
                  }}
                  reset={false}
                />
              </ProForm.Item>
            </div>
            <div
              style={{
                border: '0.5px solid #ccc',
                padding: '10px',
                marginBottom: '5px',
                borderRadius: '5px',
                // flex: 1,
              }}
            >
              <h4 className="mech">{t('MECH')}</h4>
              {/* <Form.Item style={{ width: '100%' }}> */}
              <UserSearchForm
                performedName={''}
                actionNumber={null}
                performedSing={''}
                onUserSelect={(user) => {
                  setSelectedСonsigneeUser(user);
                }}
                reset={false}
              />
              {/* </Form.Item> */}
            </div>
          </div>
        </ProForm>
      </Modal>
    </Layout>
  );
};

export default PickSlipCancel;
