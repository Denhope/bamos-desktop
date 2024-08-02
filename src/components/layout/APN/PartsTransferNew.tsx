//@ts-nocheck
import {
  Button,
  Col,
  MenuProps,
  Modal,
  Row,
  Space,
  message,
  notification,
} from 'antd';
import React, { FC, useEffect, useMemo, useState, useCallback } from 'react';
import {
  getItem,
  handleOpenReport,
  transformToIStockPartNumber,
} from '@/services/utilites';
import {
  TransactionOutlined,
  EditOutlined,
  SaveOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import TransferPartAdmin from '@/components/transferParts/TransferPartAdmin';
import {
  useGetStorePartsQuery,
  useUpdateStorePartsMutation,
} from '@/features/storeAdministration/PartsApi';
import { useAddBookingMutation } from '@/features/bookings/bookingApi';
import ReportEXEL from '@/components/shared/ReportEXEL';
import OriginalStoreEntry from '@/components/transferParts/OriginalStoreEntry';
import { generateReport } from '@/utils/api/thunks';
import { useTranslation } from 'react-i18next';
import PartContainer from '@/components/woAdministration/PartContainer';
import { ColDef, ColumnResizedEvent, GridReadyEvent } from 'ag-grid-community';
import ReportPrintLabel from '@/components/shared/ReportPrintLabel';
import ReportPrintQR from '@/components/shared/ReportPrintQR';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import PartsTable from '@/components/shared/Table/PartsTable';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setColumnWidth } from '@/store/reducers/columnWidthsSlice';
// import { RootState } from './store';
// import { setColumnWidth } from './columnWidthsSlice';

const PartsTransferNew: FC = () => {
  const { t } = useTranslation();
  const [rowKeys, setselectedRowKeys] = useState<any[]>([]);
  const [selectedParts, setSecectedParts] = useState<any>(null);
  type MenuItem = Required<MenuProps>['items'][number];
  const items: MenuItem[] = [
    getItem(
      <>{t('PARTS TRANSFER (BAN:222)')}</>,
      'sub1',
      <TransactionOutlined />
    ),
  ];
  const [selectedSerchValues, setSelectedSerchValues] = useState<any>(null);
  const [selectedTargetValues, setSelectedTargetValues] = useState<any>(null);
  const [partsOpenModify, setOpenPartsModify] = useState<boolean>(false);
  const [updateStoreParts] = useUpdateStorePartsMutation({});

  const {
    data: parts,
    isLoading: partsQueryLoading,
    isFetching: partsLoadingF,
    refetch,
  } = useGetStorePartsQuery(
    selectedSerchValues
      ? {
          locationID: selectedSerchValues.locationIDFrom,
          stationID: selectedSerchValues.stationID,
          storeID: selectedSerchValues.storeIDFrom,
          localID: selectedSerchValues.label,
          partNumberID: selectedSerchValues.partNumberID,
        }
      : {},
    {
      skip: !selectedSerchValues,
    }
  );

  const [addAccessBooking] = useAddBookingMutation({});
  const handleSubmit = useCallback(
    async (store: any) => {
      Modal.confirm({
        title: t('ARE YOU SURE, YOU WANT TO TRANSFER THIS PARTS?'),
        onOk: async () => {
          try {
            if (rowKeys) {
              await updateStoreParts({
                partsIds: rowKeys,
                locationID: selectedTargetValues.targetLocationID,
                storeID: selectedTargetValues.targetStoreID,
              }).unwrap();
              // const addBookingResponse = await addAccessBooking({
              //   booking: {
              //     voucherModel: 'CHANGE_LOCATION',
              //     partsIDs: rowKeys,
              //     locationID: selectedTargetValues.targetLocationID,
              //     storeID: selectedTargetValues.targetStoreID,
              //     storeFromID: selectedSerchValues.storeIDFrom,
              //     locationIDFrom: selectedSerchValues?.locationIDFrom,
              //   },
              // }).unwrap();

              // refetch();
              notification.success({
                message: t('PARTS SUCCESSFULLY TRANSFER'),
                description: t('The  part has been successfully update.'),
              });
            }
          } catch (error) {
            message.error(t('ERROR TRANSFER PARTS'));
          }
        },
      });
    },
    [
      rowKeys,
      selectedTargetValues,
      selectedSerchValues,
      updateStoreParts,
      addAccessBooking,
      // refetch,
      t,
    ]
  );

  const [reportData, setReportData] = useState<any>(false);
  const [reportDataLoading, setReportDataLoading] = useState<any>(false);
  const fetchAndHandleReport = useCallback(async (reportTitle: string) => {
    setReportData(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (reportData && selectedSerchValues) {
        const companyID = localStorage.getItem('companyID');
        const queryParams = {
          title: 'PARTS_EXPIRY_REPORT',
          token: localStorage.getItem('token'),
          locationID: selectedSerchValues.locationID,
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
          setReportDataLoading(true);
          const reportDataQ = await generateReport(
            companyID,
            queryParams,
            localStorage.getItem('token')
          );

          handleOpenReport(reportDataQ);
          setReportDataLoading(false);
          setReportData(false);
        } catch (error) {
          console.error('Ошибка при загрузке отчета:', error);
          setReportDataLoading(false);
          setReportData(false);
        }
      }
    };

    fetchData();
  }, [selectedSerchValues, reportData, rowKeys]);

  type CellDataType = 'text' | 'number' | 'date' | 'boolean';
  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType;
  }

  const columnWidths = useSelector((state: RootState) => state.columnWidths);
  const dispatch = useDispatch();

  const columnDefs = useMemo(
    () => [
      {
        field: 'RECEIVED_DATE',
        editable: false,
        filter: false,
        headerName: `${t('RECEIVED DATE')}`,
        cellDataType: 'date',
        width: columnWidths['RECEIVED_DATE'] || 150,
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
        width: columnWidths['LOCAL_ID'],
      },
      {
        headerName: `${t('PART No')}`,
        field: 'PART_NUMBER',
        editable: false,
        cellDataType: 'text',
        width: columnWidths['PART_NUMBER'],
      },
      {
        field: 'NAME_OF_MATERIAL',
        headerName: `${t('DESCRIPTION')}`,
        cellDataType: 'text',
        width: columnWidths['NAME_OF_MATERIAL'],
      },
      {
        field: 'GROUP',
        headerName: `${t('GROUP')}`,
        cellDataType: 'text',
        width: columnWidths['GROUP'],
      },
      {
        field: 'TYPE',
        headerName: `${t('TYPE')}`,
        cellDataType: 'text',
        width: columnWidths['TYPE'],
      },
      {
        field: 'QUANTITY',
        editable: false,
        filter: false,
        headerName: `${t('QTY')}`,
        cellDataType: 'number',
        width: columnWidths['QUANTITY'],
      },
      {
        field: 'UNIT_OF_MEASURE',
        editable: false,
        filter: false,
        headerName: `${t('UNIT OF MEASURE')}`,
        cellDataType: 'text',
        width: columnWidths['UNIT_OF_MEASURE'],
      },
      {
        field: 'STOCK',
        editable: false,
        filter: false,
        headerName: `${t('STORE')}`,
        cellDataType: 'text',
        width: columnWidths['STOCK'],
      },
      {
        field: 'LOCATION',
        editable: false,
        filter: false,
        headerName: `${t('LOCATION')}`,
        cellDataType: 'text',
        width: columnWidths['LOCATION'],
      },
      {
        field: 'SUPPLIER_BATCH_NUMBER',
        editable: false,
        filter: false,
        headerName: `${t('BATCH No')}`,
        cellDataType: 'text',
        width: columnWidths['SUPPLIER_BATCH_NUMBER'],
      },
      {
        field: 'SERIAL_NUMBER',
        editable: false,
        filter: false,
        headerName: `${t('SERIAL No')}`,
        cellDataType: 'text',
        width: columnWidths['SERIAL_NUMBER'],
      },
      {
        field: 'CONDITION',
        editable: false,
        filter: false,
        headerName: `${t('CONDITION')}`,
        cellDataType: 'text',
        width: columnWidths['CONDITION'],
      },
      {
        field: 'PRODUCT_EXPIRATION_DATE',
        editable: false,
        filter: false,
        width: columnWidths['PRODUCT_EXPIRATION_DATE'],
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
        width: columnWidths['OWNER'],
      },
      {
        field: 'RECEIVING_NUMBER',
        editable: false,
        filter: false,
        headerName: `${t('RECEIVING')}`,
        cellDataType: 'text',
        width: columnWidths['RECEIVING_NUMBER'],
      },
    ],
    [t, columnWidths]
  );

  const handleOpenReport = useCallback(
    (reportData: any) => {
      Modal.confirm({
        title: t('PARTS EXPIRY REPORT'),
        content: reportData,
        width: '80%',
        onCancel: () => {},
      });
    },
    [t]
  );

  const transformedPartNumbers = useMemo(() => {
    return transformToIStockPartNumber(parts || []);
  }, [parts]);

  const handleCheckItems = useCallback(
    (selectedKeys: React.Key[]) => {
      setselectedRowKeys(selectedKeys);
    },
    [parts]
  );

  const handleRowSelect = useCallback(
    (data: any[]) => {
      setSecectedParts(data);
    },
    [parts]
  );

  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);

  const saveColumnState = useCallback(
    (event: ColumnResizedEvent) => {
      if (event.columns) {
        event.columns.forEach((column) => {
          dispatch(
            setColumnWidth({
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
      Object.keys(columnWidths).forEach((field) => {
        const column = event.columnApi.getColumn(field, 'clientSide');
        if (column) {
          column.setActualWidth(columnWidths[field]);
        }
      });
    },
    [columnWidths]
  );

  return (
    <div className="h-[82vh] overflow-hidden flex flex-col justify-between">
      <div className="flex flex-col gap-5 overflow-hidden">
        <div className="bg-white">
          <TransferPartAdmin
            onDataTargetUpdate={function (data: any): void {
              setSelectedTargetValues(data);
            }}
            onSubmit={function (data: any): void {
              setSelectedSerchValues(data);
            }}
          ></TransferPartAdmin>
        </div>
        <Row justify={'space-between'}>
          <div className="flex gap-5">
            <Col>
              <PermissionGuard
                requiredPermissions={[Permission.PART_TRANSFER_ACTIONS]}
              >
                <Button
                  type={'primary'}
                  disabled={!rowKeys.length || !selectedTargetValues}
                  size="small"
                  icon={<SaveOutlined />}
                  onClick={handleSubmit}
                >
                  {t('TRANSFER PARTS')}
                </Button>
              </PermissionGuard>
            </Col>
            <Col>
              <Button
                danger
                disabled={!rowKeys.length || rowKeys.length != 1}
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setOpenPartsModify(true);
                }}
              >
                {t('EDIT')}
              </Button>
            </Col>
          </div>
          <div className="flex gap-5">
            <Col style={{ textAlign: 'right' }}>
              <Space>
                <ReportPrintLabel
                  xmlTemplate={''}
                  data={[]}
                  ids={rowKeys}
                  isDisabled={!rowKeys.length}
                ></ReportPrintLabel>
                <ReportEXEL
                  isDisabled={!rowKeys.length}
                  headers={{
                    LOCAL_ID: 'НОМЕР БИРКИ',
                    PART_NUMBER: 'НАМЕНКЛАТУРА',
                    NAME_OF_MATERIAL: 'ОПИСАНИЕ',
                    SERIAL_NUMBER: 'СЕРИЙНЫЙ НОМЕР/НОМЕР ПАРТИИ',
                    QUANTITY: 'КОЛИЧЕСТВО',
                    GROUP: 'ГРУППА',
                    'storeID.storeShortName': 'СКЛАД',
                    'locationID.locationName': 'ЛОКАЦИЯ',
                    PRODUCT_EXPIRATION_DATE: 'СРОК ГОДНОСТИ',
                    estimatedDueDate: 'КРАЙНЯЯ ДАТА ПОВЕРКИ',
                    nextDueMOS: 'СЛЕДУЮЩЯЯ ДАТА ПОВЕРКИ',
                  }}
                  data={selectedParts}
                  fileName={'PARTS_REPORTS_'}
                ></ReportEXEL>
              </Space>
            </Col>
            <Col>
              <ReportPrintQR
                openSettingsModal
                pageBreakAfter={false}
                isDisabled={!rowKeys.length}
                data={selectedParts}
                ids={rowKeys}
              ></ReportPrintQR>
            </Col>
          </div>
        </Row>
        <div style={containerStyle}>
          <div style={gridStyle} className={'ag-theme-alpine'}>
            <PartsTable
              isLoading={partsQueryLoading}
              isFilesVisiable={true}
              isVisible={true}
              pagination={true}
              isAddVisiable={true}
              isButtonVisiable={false}
              height={'52vh'}
              rowData={transformedPartNumbers}
              columnDefs={columnDefs}
              onAddRow={function (): void {}}
              onDelete={function (id: string): void {}}
              onSave={function (data: any): void {}}
              onCellValueChanged={function (params: any): void {}} // onAddRow={onAddRow}
              onRowSelect={handleRowSelect}
              onDRowSelect={() => setOpenPartsModify(true)}
              onCheckItems={handleCheckItems}
              partNumbers={[]}
              isChekboxColumn={true}
              onColumnResized={saveColumnState}
              onGridReady={restoreColumnState}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <Modal
          title={t('STORE ENTRY')}
          open={partsOpenModify}
          width={'90%'}
          onCancel={() => setOpenPartsModify(false)}
          footer={null}
        >
          <OriginalStoreEntry
            onUpdatePart={(data: any) => {
              // setselectedRowKeys(data._id);
            }}
            currentPart={partsOpenModify && selectedParts}
          />
        </Modal>
      </div>
    </div>
  );
};

export default PartsTransferNew;
