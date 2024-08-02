// @ts-nocheck
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
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
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

import { ColDef, ColumnResizedEvent, GridReadyEvent } from 'ag-grid-community';
import ReportPrintQR from '@/components/shared/ReportPrintQR';
import ReportPrintLabel from '@/components/shared/ReportPrintLabel';
import PartsTable from '@/components/shared/Table/PartsTable';
import { RootState } from '@/store';
import { setColumnWidthEzpiry } from '@/store/reducers/columnWidthsExpirySlice';
import { useSelector, useDispatch } from 'react-redux';

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

  type CellDataType = 'text' | 'number' | 'date' | 'boolean';

  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType;
  }
  const columnWidthsExpiry = useSelector(
    (state: RootState) => state.columnWidthsExpiry
  );
  const columnDefs = useMemo(
    () => [
      {
        field: 'RECEIVED_DATE',
        editable: false,
        filter: false,
        headerName: `${t('RECEIVED DATE')}`,
        cellDataType: 'date',
        width: columnWidthsExpiry['RECEIVED_DATE'] || 150,
        valueFormatter: (params: any) => {
          if (!params.value) return '';
          const date = new Date(params.value);
          return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });
        },
      },
      {
        headerName: `${t('LOCAL_ID')}`,
        field: 'LOCAL_ID',
        editable: false,
        cellDataType: 'text',
        width: columnWidthsExpiry['LOCAL_ID'],
      },
      {
        headerName: `${t('PART No')}`,
        field: 'PART_NUMBER',
        editable: false,
        cellDataType: 'text',
        width: columnWidthsExpiry['PART_NUMBER'],
      },
      {
        field: 'NAME_OF_MATERIAL',
        headerName: `${t('DESCRIPTION')}`,
        cellDataType: 'text',
        width: columnWidthsExpiry['NAME_OF_MATERIAL'],
      },
      {
        field: 'GROUP',
        headerName: `${t('GROUP')}`,
        cellDataType: 'text',
        width: columnWidthsExpiry['GROUP'],
      },
      {
        field: 'TYPE',
        headerName: `${t('TYPE')}`,
        cellDataType: 'text',
        width: columnWidthsExpiry['TYPE'],
      },
      {
        field: 'QUANTITY',
        editable: false,
        filter: false,
        headerName: `${t('QTY')}`,
        cellDataType: 'number',
        width: columnWidthsExpiry['QUANTITY'],
      },
      {
        field: 'UNIT_OF_MEASURE',
        editable: false,
        filter: false,
        headerName: `${t('UNIT OF MEASURE')}`,
        cellDataType: 'text',
        width: columnWidthsExpiry['UNIT_OF_MEASURE'],
      },
      {
        field: 'STOCK',
        editable: false,
        filter: false,
        headerName: `${t('STORE')}`,
        cellDataType: 'text',
        width: columnWidthsExpiry['STOCK'],
      },
      {
        field: 'LOCATION',
        editable: false,
        filter: false,
        headerName: `${t('LOCATION')}`,
        cellDataType: 'text',
        width: columnWidthsExpiry['LOCATION'],
      },
      {
        field: 'SUPPLIER_BATCH_NUMBER',
        editable: false,
        filter: false,
        headerName: `${t('BATCH No')}`,
        cellDataType: 'text',
        width: columnWidthsExpiry['SUPPLIER_BATCH_NUMBER'],
      },
      {
        field: 'SERIAL_NUMBER',
        editable: false,
        filter: false,
        headerName: `${t('SERIAL No')}`,
        cellDataType: 'text',
        width: columnWidthsExpiry['SERIAL_NUMBER'],
      },
      {
        field: 'CONDITION',
        editable: false,
        filter: false,
        headerName: `${t('CONDITION')}`,
        cellDataType: 'text',
        width: columnWidthsExpiry['CONDITION'],
      },
      {
        field: 'PRODUCT_EXPIRATION_DATE',
        editable: false,
        filter: false,
        width: columnWidthsExpiry['PRODUCT_EXPIRATION_DATE'],
        headerName: `${t('EXPIRY DATE')}`,
        cellDataType: 'date',
        valueFormatter: (params: any) => {
          if (!params.value) return '';
          const date = new Date(params.value);
          return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
        },
      },
      {
        field: 'OWNER',
        editable: false,
        filter: false,
        headerName: `${t('OWNER')}`,
        cellDataType: 'text',
        width: columnWidthsExpiry['OWNER'],
      },
      {
        field: 'RECEIVING_NUMBER',
        editable: false,
        filter: false,
        headerName: `${t('RECEIVING')}`,
        cellDataType: 'text',
        width: columnWidthsExpiry['RECEIVING_NUMBER'],
      },
    ],
    [t, columnWidthsExpiry]
  );

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

  const dispatch = useDispatch();
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);

  const saveColumnState = useCallback(
    (event: ColumnResizedEvent) => {
      if (event.columns) {
        event.columns.forEach((column) => {
          dispatch(
            setColumnWidthEzpiry({
              field: column.getColId(),
              width: column.getActualWidth(),
            })
          );
        });
      }
    },
    [dispatch]
  );

  const restoreColumnState = useCallback(
    (event: GridReadyEvent) => {
      Object.keys(columnWidthsExpiry).forEach((field) => {
        const column = event.columnApi.getColumn(field, 'clientSide');
        if (column) {
          column.setColumnWidthEzpiry(columnWidthsExpiry[field]);
        }
      });
    },
    [columnWidthsExpiry]
  );

  const transformedPartNumbers = useMemo(() => {
    return transformToIStockPartNumber(parts || []);
  }, [parts]);
  const [reportDataLoading, setReportDataLoading] = useState<boolean>(false);
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        className="h-screen overflow-hidden"
        theme="light"
        width={350}
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
                        PRODUCT_EXPIRATION_DATE: `${t('EXPIRY DATE')}`,

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
                  <Button
                    loading={reportDataLoading}
                    icon={<PrinterOutlined />}
                    size="small"
                    onClick={() => fetchAndHandleReport('dddddddddd')}
                    disabled={!selectedSerchValues}
                  >
                    {`${t('PRINT REPORT')}`}
                  </Button>
                </Col>
              </div>
            </Row>
            <div style={containerStyle}>
              <div style={gridStyle} className={'ag-theme-alpine'}>
                <PartsTable
                  isLoading={partsQueryLoading || partsLoadingF}
                  isFilesVisiable={true}
                  isVisible={true}
                  pagination={true}
                  isAddVisiable={true}
                  isButtonVisiable={false}
                  height={'77vh'}
                  rowData={transformedPartNumbers}
                  columnDefs={columnDefs}
                  onAddRow={function (): void {}}
                  onDelete={function (id: string): void {}}
                  onSave={function (data: any): void {}}
                  onCellValueChanged={function (params: any): void {}} // onAddRow={onAddRow}
                  onRowSelect={setSelectedMaterials}
                  onCheckItems={setselectedRowKeys}
                  partNumbers={[]}
                  isChekboxColumn={true}
                  onColumnResized={saveColumnState}
                  onGridReady={restoreColumnState}
                />
              </div>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default ShelfExpiryNew;
