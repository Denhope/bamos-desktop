// ts-nocheck
import { ProColumns, ProForm, ProFormSelect } from '@ant-design/pro-components';
import {
  Button,
  Col,
  Layout,
  Menu,
  MenuProps,
  Modal,
  Row,
  Select,
  Space,
  TimePicker,
  message,
} from 'antd';
const { Option } = Select;
import Sider from 'antd/es/layout/Sider';
import PartContainer from '@/components/woAdministration/PartContainer';
import { Content } from 'antd/es/layout/layout';
import RequirementItems from '@/components/store/RequirementItems';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteNames } from '@/router';
import {
  getItem,
  handleFileOpen,
  handleFileSelect,
  handleOpenReport,
  transformToIStockPartNumber,
} from '@/services/utilites';
import { WarningOutlined } from '@ant-design/icons';

import ContextMenuWrapper from '@/components/shared/ContextMenuWrapperProps';

import EditableTable from '@/components/shared/Table/EditableTable';
import { generateReport } from '@/utils/api/thunks';
import { PrinterOutlined, ArrowRightOutlined } from '@ant-design/icons';

import FileModalList from '@/components/shared/FileModalList';
import ShelfExpiryFilterForm from '../shelfExpiryNew/ShelfExpiryFilterForm';
import {
  useGetStorePartsQuery,
  useUpdateStorePartsMutation,
} from '@/features/storeAdministration/PartsApi';
import ReportEXEL from '@/components/shared/ReportEXEL';
// import ReportPrintLabel from '@/components/shared/ReportPrintLabel';
// import ReportPrintQR from '@/components/shared/ReportPrintQR';
import { useAddBookingMutation } from '@/features/bookings/bookingApi';
import { useGetLocationsQuery } from '@/features/storeAdministration/LocationApi';

import { ColDef } from 'ag-grid-community';
import ReportPrintQR from '@/components/shared/ReportPrintQR';
import ReportPrintLabel from '@/components/shared/ReportPrintLabel';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';

const ShelfExpiryNew: FC = () => {
  const [reportData, setReportData] = useState<any>(false);
  const fetchAndHandleReport = async (reportTitle: string) => {
    setReportData(true);
  };

  const { t } = useTranslation();

  type MenuItem = Required<MenuProps>['items'][number];
  const [openKeys, setOpenKeys] = useState(['sub1', 'sub2']);
  const [selectedKey, setSelectedKey] = useState<string>(
    RouteNames.BASETASKLIST
  );

  const [collapsed, setCollapsed] = useState(false);
  const items: MenuItem[] = [
    getItem(<>{t('SHELF EXPIRY')}</>, 'sub1', <WarningOutlined />),
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
  // const initialColumns: ProColumns<any>[] = [
  //   {
  //     title: `${t('LOCAL_ID')}`,
  //     dataIndex: 'LOCAL_ID',
  //     key: 'LOCAL_ID',
  //     // tooltip: 'LOCAL_ID',
  //     ellipsis: true,
  //     width: 100,
  //     formItemProps: {
  //       name: 'LOCAL_ID',
  //     },
  //     sorter: (a: any, b: any) => a.LOCAL_ID - b.LOCAL_ID, //

  //     // responsive: ['sm'],
  //   },

  //   {
  //     title: `${t('PN')}`,
  //     dataIndex: 'PART_NUMBER',
  //     key: 'PART_NUMBER',
  //     //tooltip: 'ITEM PART_NUMBER',
  //     // ellipsis: true,
  //     width: 100,
  //     formItemProps: {
  //       name: 'PART_NUMBER',
  //     },
  //     render: (text: any, record: any) => {
  //       return (
  //         <ContextMenuWrapper
  //           items={[
  //             {
  //               label: 'Copy',
  //               action: handleCopy,
  //             },
  //             {
  //               label: 'Open with',
  //               action: () => {},
  //               submenu: [
  //                 { label: 'PART TRACKING', action: handleAdd },
  //                 { label: 'PICKSLIP REQUEST', action: handleAddPick },
  //               ],
  //             },
  //           ]}
  //         >
  //           <a
  //             onClick={() => {
  //               // dispatch(setCurrentProjectTask(record));
  //               // setOpenRequirementDrawer(true);
  //               // onReqClick(record);
  //             }}
  //           >
  //             {record.PART_NUMBER}
  //           </a>
  //         </ContextMenuWrapper>
  //       );
  //     },

  //     // responsive: ['sm'],
  //   },
  //   {
  //     title: `${t('DESCRIPTION')}`,
  //     dataIndex: 'NAME_OF_MATERIAL',
  //     key: 'NAME_OF_MATERIAL',
  //     // tooltip: 'ITEM STORE',
  //     ellipsis: true,

  //     formItemProps: {
  //       name: 'NAME_OF_MATERIAL',
  //     },

  //     // responsive: ['sm'],
  //   },
  //   {
  //     title: `${t('STORE')}`,
  //     dataIndex: 'SHELF_NUMBER',
  //     key: 'SHELF_NUMBER',
  //     //tooltip: 'ITEM LOCATION',
  //     ellipsis: true,
  //     width: '7%',

  //     render: (text: any, record: any) => record?.storeID?.storeShortName,
  //     // остальные свойства...

  //     responsive: ['sm'],
  //   },
  //   {
  //     title: `${t('CONDITION')}`,
  //     dataIndex: 'CONDITION',
  //     key: 'CONDITION',
  //     //tooltip: 'CONDITION',
  //     ellipsis: true,
  //     width: 100,
  //     formItemProps: {
  //       name: 'CONDITION',
  //     },
  //     render: (text: any, record: any) => {
  //       return (
  //         <div
  //           onClick={() => {
  //             // dispatch(setCurrentProjectTask(record));
  //             // setOpenRequirementDrawer(true);
  //             // onReqClick(record);
  //           }}
  //         >
  //           {record.CONDITION}
  //         </div>
  //       );
  //     },

  //     // responsive: ['sm'],
  //   },

  //   {
  //     title: `${t('LOCATION')}`,
  //     dataIndex: 'SHELF_NUMBER',
  //     key: 'SHELF_NUMBER',
  //     //tooltip: 'ITEM LOCATION',
  //     ellipsis: true,
  //     width: 100,
  //     formItemProps: {
  //       name: 'SHELF_NUMBER',
  //     },
  //     render: (text: any, record: any) => record?.locationID?.locationName,

  //     responsive: ['sm'],
  //   },

  //   {
  //     title: `${t('BATCH/SERIAL')}`,
  //     dataIndex: 'SERIAL_NUMBER',
  //     width: 100,
  //     key: 'SERIAL_NUMBER',
  //     render: (text: any, record: any) =>
  //       record.SERIAL_NUMBER || record.SUPPLIER_BATCH_NUMBER,
  //     // остальные свойства...
  //   },
  //   {
  //     title: `${t('RESEIVING')}`,
  //     dataIndex: 'ORDER_NUMBER',
  //     key: 'ORDER_NUMBER',
  //     //tooltip: 'ITEM ORDER_NUMBER',
  //     ellipsis: true,
  //     width: 100,
  //     formItemProps: {
  //       name: 'ORDER_NUMBER',
  //     },

  //     // responsive: ['sm'],
  //   },
  //   {
  //     title: `${t('LAST INSPECT')}`,
  //     dataIndex: 'estimatedDueDate',
  //     key: 'estimatedDueDate',
  //     responsive: ['sm'],
  //     ellipsis: true,
  //     valueType: 'date',
  //     width: 100,
  //     search: false,
  //     // sorter: (a, b) => a.unit.length - b.unit.length,
  //   },

  //   {
  //     title: `${t('INTERVAL')}`,
  //     dataIndex: 'intervalMOS',
  //     key: 'intervalMOS',
  //     responsive: ['sm'],

  //     ellipsis: true,
  //     width: 100,
  //     search: false,
  //     // sorter: (a, b) => a.unit.length - b.unit.length,
  //   },
  //   {
  //     title: `${t('EXPIRY DATE')}`,
  //     dataIndex: 'PRODUCT_EXPIRATION_DATE',
  //     key: 'PRODUCT_EXPIRATION_DATE',
  //     //tooltip: 'ITEM EXPIRY DATE',
  //     ellipsis: true,
  //     valueType: 'date',
  //     width: 100,
  //     responsive: ['sm'],

  //     sorter: (a, b) => {
  //       if (
  //         a.PRODUCT_EXPIRATION_DATE ||
  //         (a?.nextDueMOS && b.PRODUCT_EXPIRATION_DATE) ||
  //         b?.nextDueMOS
  //       ) {
  //         const aFinishDate = new Date(
  //           a.PRODUCT_EXPIRATION_DATE || a?.nextDueMOS
  //         );
  //         const bFinishDate = new Date(
  //           b.PRODUCT_EXPIRATION_DATE || b?.nextDueMOS
  //         );
  //         return aFinishDate.getTime() - bFinishDate.getTime();
  //       } else {
  //         return 0; // default value
  //       }
  //     },
  //     render(value: any, record: any) {
  //       // Преобразование даты в более читаемый формат
  //       const date = new Date(
  //         record.PRODUCT_EXPIRATION_DATE || record?.nextDueMOS
  //       );
  //       const formattedDate =
  //         (record.PRODUCT_EXPIRATION_DATE || record?.nextDueMOS) &&
  //         date.toLocaleDateString();
  //       return formattedDate;
  //     },
  //   },
  //   {
  //     title: `${t('QTY')}`,
  //     dataIndex: 'QUANTITY',
  //     key: 'QUANTITY',
  //     width: 100,
  //     responsive: ['sm'],
  //     search: false,
  //     render: (text, record) => {
  //       let backgroundColor;
  //       if (
  //         record?.PRODUCT_EXPIRATION_DATE ||
  //         (record?.nextDueMOS &&
  //           new Date(record.PRODUCT_EXPIRATION_DATE || record?.nextDueMOS) >=
  //             new Date())
  //       ) {
  //         backgroundColor = '#32CD32'; // Красный фон, если PRODUCT_EXPIRATION_DATE меньше текущей даты
  //       } // Зеленый фон по умолчанию
  //       if (record?.SHELF_NUMBER === 'TRANSFER') {
  //         backgroundColor = '#FFDB58'; // Желтый фон для SHELF_NUMBER 'TRANSFER'
  //       }
  //       if (
  //         record?.PRODUCT_EXPIRATION_DATE ||
  //         (record?.nextDueMOS &&
  //           new Date(record.PRODUCT_EXPIRATION_DATE || record?.nextDueMOS) <
  //             new Date())
  //       ) {
  //         backgroundColor = '#FF0000'; // Красный фон, если PRODUCT_EXPIRATION_DATE меньше текущей даты
  //       }
  //       return <div style={{ backgroundColor }}>{text}</div>;
  //     },
  //     // sorter: (a, b) => a.unit.length - b.unit.length,
  //   },
  //   {
  //     title: `${t('UNIT')}`,
  //     dataIndex: 'UNIT_OF_MEASURE',
  //     key: 'UNIT_OF_MEASURE',
  //     responsive: ['sm'],
  //     width: 100,
  //     search: false,
  //     // sorter: (a, b) => a.unit.length - b.unit.length,
  //   },

  //   {
  //     title: `${t('OWNER')}`,
  //     dataIndex: 'OWNER_SHORT_NAME',
  //     key: 'OWNER_SHORT_NAME',
  //     width: 100,
  //     ellipsis: true,
  //     editable: (text, record, index) => {
  //       return false;
  //     },
  //     search: false,
  //   },
  //   {
  //     title: `${t('DOC')}`,
  //     dataIndex: 'DOC',
  //     key: 'DOC',
  //     width: 100,
  //     ellipsis: true,
  //     editable: (text, record, index) => {
  //       return false;
  //     },
  //     render: (text, record, index) => {
  //       return record.FILES && record.FILES.length > 0 ? (
  //         <FileModalList
  //           files={record?.FILES}
  //           onFileSelect={function (file: any): void {
  //             handleFileSelect({
  //               id: file?.id,
  //               name: file?.name,
  //             });
  //           }}
  //           onFileOpen={function (file: any): void {
  //             handleFileOpen(file);
  //           }}
  //         />
  //       ) : (
  //         <></>
  //       );
  //     },
  //   },
  // ];
  type CellDataType = 'text' | 'number' | 'date' | 'boolean';

  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType;
  }

  const [columnDefs, setColumnDefs] = useState<ExtendedColDef[]>([
    {
      headerName: `${t('LOCAL_ID')}`,
      field: 'LOCAL_ID',
      editable: false,
      cellDataType: 'text',
    },
    {
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER',
      editable: false,
      cellDataType: 'text',
    },
    {
      field: 'NAME_OF_MATERIAL',
      headerName: `${t('DESCRIPTION')}`,
      cellDataType: 'text',
    },
    {
      field: 'GROUP',
      headerName: `${t('GROUP')}`,
      cellDataType: 'text',
    },
    {
      field: 'TYPE',
      headerName: `${t('TYPE')}`,
      cellDataType: 'text',
    },
    {
      field: 'QUANTITY',
      editable: false,
      filter: false,
      headerName: `${t('QTY')}`,
      cellDataType: 'number',
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('UNIT OF MEASURE')}`,
      cellDataType: 'text',
    },
    {
      field: 'STOCK',
      editable: false,
      filter: false,
      headerName: `${t('STORE')}`,
      cellDataType: 'text',
    },
    {
      field: 'LOCATION',
      editable: false,
      filter: false,
      headerName: `${t('LOCATION')}`,
      cellDataType: 'text',
    },
    {
      field: 'SERIAL_NUMBER',
      editable: false,
      filter: false,
      headerName: `${t('BATCH/SERIAL')}`,
      cellDataType: 'text',
    },
    {
      field: 'CONDITION',
      editable: false,
      filter: false,
      headerName: `${t('CONDITION')}`,
      cellDataType: 'text',
    },
    {
      field: 'PRODUCT_EXPIRATION_DATE',
      editable: false,
      filter: false,
      headerName: `${t('EXPIRY DATE')}`,
      cellDataType: 'date',
      valueFormatter: (params: any) => {
        if (!params.value) return ''; // Проверка отсутствия значения
        const date = new Date(params.value);
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      },
    },

    // {
    //   field: 'reservedQTY',
    //   editable: false,
    //   filter: false,
    //   headerName: `${t('RESERVED QTY')}`,
    //   cellDataType: 'number',
    // },

    {
      field: 'OWNER',
      editable: false,
      filter: false,
      headerName: `${t('OWNER')}`,
      cellDataType: 'text',
    },

    {
      field: 'RECEIVED_DATE',
      editable: false,
      filter: false,
      headerName: `${t('RECEIVED DATE')}`,
      cellDataType: 'date',
      valueFormatter: (params: any) => {
        if (!params.value) return ''; // Проверка отсутствия значения
        const date = new Date(params.value);
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      },
    },
  ]);

  const [labelsOpenPrint, setOpenLabelsPrint] = useState<any>();
  const [rowKeys, setselectedRowKeys] = useState<any[]>([]);

  useState<any>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<any>([]);
  // const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [partsToPrint, setPartsToPrint] = useState<any>([]);
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setselectedRowKeys(newSelectedRowKeys);
  };
  const [selectedSerchValues, setSelectedSerchValues] = useState<any>(null);
  const {
    data: parts,
    isLoading: partsQueryLoading,
    isFetching: partsLoadingF,
    refetch,
  } = useGetStorePartsQuery(
    selectedSerchValues
      ? {
          locationID: selectedSerchValues.locationID,
          stationID: selectedSerchValues.stationID,
          storeID: selectedSerchValues.storeID,
          localID: selectedSerchValues.label,
          partNumberID: selectedSerchValues.partNumberID,
          SERIAL_NUMBER: selectedSerchValues.serialNumber,
          startExpityDate:
            selectedSerchValues?.dateIn && selectedSerchValues?.dateIn[0],
          endExpityDate: selectedSerchValues?.dateIn
            ? selectedSerchValues?.dateIn[1]
            : selectedSerchValues?.datePickerValue,
          GROUP: selectedSerchValues.GROUP,
          TYPE: selectedSerchValues.TYPE,
          toolTypeID: selectedSerchValues.toolTypeID,
          toolCodeID: selectedSerchValues.toolCodeID,
        }
      : {},
    {
      skip: !selectedSerchValues,
    }
  );

  useEffect(() => {
    const fetchData = async () => {
      if (reportData && selectedSerchValues) {
        const companyID = localStorage.getItem('companyID');
        const queryParams = {
          title: 'TOOLS_EXPIRY_REPORT',
          token: localStorage.getItem('token'),
          locationID: selectedSerchValues.locationID,
          //
          storeID: selectedSerchValues.storeID,
          localID: selectedSerchValues.label,
          partNumberID: selectedSerchValues.partNumberID,
          SERIAL_NUMBER: selectedSerchValues.serialNumber,
          startExpityDate:
            selectedSerchValues?.dateIn && selectedSerchValues?.dateIn[0],
          endExpityDate: selectedSerchValues?.dateIn
            ? selectedSerchValues?.dateIn[1]
            : selectedSerchValues?.datePickerValue,
          GROUP: selectedSerchValues.GROUP,
          TYPE: selectedSerchValues.TYPE,
          ids: rowKeys,
        };

        try {
          // Вызываем функцию для генерации отчета
          setReportDataLoading(true);
          const reportDataQ = await generateReport(
            companyID,
            queryParams,
            localStorage.getItem('token')
          );

          handleOpenReport(reportDataQ);
          setReportDataLoading(false);

          // Устанавливаем состояние reportData в false
          setReportData(false);
          // return reportDataQ;
        } catch (error) {
          // Обрабатываем ошибку при загрузке отчета
          console.error('Ошибка при загрузке отчета:', error);
          setReportData(false);
          setReportDataLoading(false);
        }
      }
    };

    fetchData();
  }, [selectedSerchValues, reportData]);
  const [selectedLocationId, setSelectedLocationId] = useState<null | string>(
    null
  );
  const [updateStoreParts] = useUpdateStorePartsMutation({});
  const [addAccessBooking] = useAddBookingMutation({});
  const {
    data: locations,
    isLoading,
    refetch: refetchLocations,
  } = useGetLocationsQuery(
    {
      storeID: selectedSerchValues?.storeID,
    },
    {
      skip: !selectedSerchValues?.storeID,
    }
  );

  const loctionsCodesValueEnum = locations
    ? locations.reduce((enumObj, location) => {
        if (location && location.id !== undefined) {
          enumObj[location.id] = String(location.locationName).toUpperCase();
        }
        return enumObj;
      }, {} as { [key: string]: string })
    : {};

  const data = [
    { name: 'John Doe', age: 28, address: '123 Main St' },
    { name: 'Jane Smith', age: 34, address: '456 Maple Ave' },
    { name: 'Sam Johnson', age: 45, address: '789 Elm St' },
  ];

  const transformedPartNumbers = useMemo(() => {
    return transformToIStockPartNumber(parts || []);
  }, [parts]);
  const [reportDataLoading, setReportDataLoading] = useState<boolean>(false);
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        className="h-screen overflow-hidden"
        theme="light"
        width={470}
        // trigger
        collapsible
        // color="rgba(255, 255, 255, 0.2)"
        collapsed={collapsed}
        onCollapse={(value: boolean | ((prevState: boolean) => boolean)) =>
          setCollapsed(value)
        }
      >
        <Menu theme="light" mode="inline" items={items} openKeys={openKeys} />
        <div className="mx-auto px-5">
          <div
            style={{
              display: !collapsed ? 'block' : 'none',
            }}
          >
            <ShelfExpiryFilterForm
              onSubmit={function (data: any): void {
                setSelectedSerchValues(data);
              }}
            />
          </div>
        </div>
      </Sider>
      <Content className="pl-4">
        <div className="h-screen overflow-hidden flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-5 overflow-hidden">
            <Row justify={'space-between'}>
              <Button
                danger
                icon={<ArrowRightOutlined />}
                disabled={!rowKeys?.length || !selectedSerchValues?.storeID}
                onClick={() => {
                  Modal.confirm({
                    title: `${t(
                      'YOU WANT TRANSFER PARTS TO UNSERVICE LOCATION'
                    )} `,
                    content: (
                      <Space direction="vertical">
                        <ProForm size={'small'} submitter={false}>
                          <ProFormSelect
                            placeholder={''}
                            showSearch
                            name="targetLocationID"
                            label={t('LOCATION')}
                            width="sm"
                            valueEnum={loctionsCodesValueEnum || {}}
                            disabled={!selectedSerchValues?.storeID}
                            onChange={(value: string) => {
                              setSelectedLocationId(value);
                              setSelectedLocationId(value);
                              console.log(value);
                            }}
                          />
                        </ProForm>
                      </Space>
                    ),
                    onOk: async () => {
                      Modal.confirm({
                        title: t('CONFIRM TRANSFER'),
                        okText: 'CONFIRM',
                        cancelText: 'CANCEL',
                        okButtonProps: {
                          style: {
                            display: 'inline-block',
                            margin: '1 auto',
                          },
                        },
                        cancelButtonProps: {
                          style: {
                            display: 'inline-block',
                            margin: '1 auto',
                          },
                        },

                        onOk: async () => {
                          try {
                            if (rowKeys && selectedLocationId) {
                              await updateStoreParts({
                                partsIds: rowKeys,
                                locationID: selectedLocationId,
                                storeID: selectedSerchValues?.storeID,
                              }).unwrap();
                              const addBookingResponse = await addAccessBooking(
                                {
                                  booking: {
                                    voucherModel: 'CHANGE_LOCATION',
                                    partsIDs: rowKeys,
                                  },
                                }
                              ).unwrap();

                              refetch();
                              message.success(t('PARTS SUCCESSFULLY TRANSFER'));
                              setSelectedLocationId('');
                            }
                          } catch (error) {
                            message.error(t('ERROR TRANSFER PARTS'));
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
              {/* <Col>
                <Button
                  disabled={!rowKeys?.length || !selectedSerchValues?.storeID}
                  danger
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => fetchAndHandleReport('dddddddddd')}
                >
                  {` ${t('CHANCE EXPIRY DATE')}`}
                </Button>
              </Col> */}
              <div className="flex gap-5">
                <Col style={{ textAlign: 'right' }}>
                  <Space>
                    <ReportPrintLabel
                      xmlTemplate={''}
                      data={selectedMaterials}
                      ids={rowKeys}
                      isDisabled={!rowKeys.length}
                    ></ReportPrintLabel>
                    <ReportEXEL
                      isDisabled={!rowKeys.length}
                      headers={{
                        LOCAL_ID: `${t('LABEL')}`,
                        PART_NUMBER: `${t('PN')}`,
                        NAME_OF_MATERIAL: `${t('DESCRIPTION')}`,
                        SERIAL_NUMBER: `${t('BATCH/SERIAL')}`,
                        QUANTITY: `${t('QTY')}`,
                        GROUP: `${t('GROUP')}`,
                        UNIT_LIMIT: `${t('UNIT_LIMIT')}`,
                        TOOL_TYPE_CODE: `${t('TOOL TYPE')}`,
                        TOOL_GROUP_CODE: `${t('TOOL GROUP')}`,
                        estimatedDueDate: `${t('LAST INSPECT')}`,
                        intervalMOS: `${t('INTERVAL')}`,
                        nextDueMOS: `${t('EXPIRY DATE')}`,

                        'storeID.storeShortName': `${t('STORE')}`,
                        'locationID.locationName': `${t('LOCATION')}`,
                      }}
                      data={selectedMaterials}
                      fileName={'EXPIRES_REPORT_'}
                    ></ReportEXEL>
                  </Space>
                </Col>
                <Col>
                  <ReportPrintQR
                    openSettingsModal
                    pageBreakAfter={false}
                    isDisabled={!rowKeys.length}
                    data={selectedMaterials}
                    ids={rowKeys}
                  ></ReportPrintQR>
                </Col>
                <Col>
                  <PermissionGuard
                    requiredPermissions={[Permission.PRINT_REPORT_EXPIRY]}
                  >
                    <Button
                      loading={reportDataLoading}
                      icon={<PrinterOutlined />}
                      size="small"
                      onClick={() => fetchAndHandleReport('dddddddddd')}
                      disabled={!selectedSerchValues}
                    >
                      {`${t('PRINT REPORT')}`}
                    </Button>
                  </PermissionGuard>
                </Col>
              </div>
            </Row>

            <PartContainer
              isLoading={partsQueryLoading || partsLoadingF}
              isFilesVisiable={true}
              isVisible={true}
              pagination={true}
              isAddVisiable={true}
              isButtonVisiable={false}
              isEditable={true}
              height={'77vh'}
              columnDefs={columnDefs}
              partNumbers={[]}
              isChekboxColumn={true}
              onUpdateData={(data: any[]): void => {}}
              rowData={transformedPartNumbers}
              onCheckItems={setselectedRowKeys}
              // onRowSelect={(data: any): void => {
              //   setSelectedMaterials(
              //     (prevSelectedItems: (string | undefined)[]) =>
              //       prevSelectedItems && prevSelectedItems.includes(data?._id)
              //         ? []
              //         : [data]
              //   );
              // }}
              onRowSelect={(data: any): void => {
                setSelectedMaterials(data);
              }}
            />
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default ShelfExpiryNew;
