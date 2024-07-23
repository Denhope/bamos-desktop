import { Button, Col, MenuProps, Modal, Row, Space, message } from 'antd';

import React, { FC, useEffect, useMemo, useState } from 'react';

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
import { ColDef } from 'ag-grid-community';
import { format } from 'date-fns';
import ReportPrintLabel from '@/components/shared/ReportPrintLabel';
import ReportPrintQR from '@/components/shared/ReportPrintQR';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';

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
      : {}, // This will prevent the query from running if reqCode is null or does not have an id
    {
      skip: !selectedSerchValues,
    }
  );
  console.log('partsQueryLoading:', partsQueryLoading);
  console.log('partsLoadingF:', partsLoadingF);

  const [addAccessBooking] = useAddBookingMutation({});
  const handleSubmit = async (store: any) => {
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
            const addBookingResponse = await addAccessBooking({
              booking: {
                voucherModel: 'CHANGE_LOCATION',
                partsIDs: rowKeys,
                locationID: selectedTargetValues.targetLocationID,
                storeID: selectedTargetValues.targetStoreID,
                locationFromID: selectedSerchValues.locationIDFrom,
                storeFromID: selectedSerchValues.storeIDFrom,
              },
            }).unwrap();

            refetch();
            message.success(t('PARTS SUCCESSFULLY TRANSFER'));
          }
        } catch (error) {
          message.error(t('ERROR TRANSFER PARTS'));
        }
      },
    });
  };
  const [reportData, setReportData] = useState<any>(false);
  const [reportDataLoading, setReportDataLoading] = useState<any>(false);
  const fetchAndHandleReport = async (reportTitle: string) => {
    setReportData(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (reportData && selectedSerchValues) {
        const companyID = localStorage.getItem('companyID');
        const queryParams = {
          title: 'PARTS_EXPIRY_REPORT',
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
          setReportDataLoading(false);
          setReportData(false);
        }
      }
    };

    fetchData();
  }, [selectedSerchValues, reportData]);

  type CellDataType = 'text' | 'number' | 'date' | 'boolean';

  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType;
  }

  const columnDefs = useMemo(
    () => [
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
        field: 'SUPPLIER_BATCH_NUMBER',
        editable: false,
        filter: false,
        headerName: `${t('BATCH No')}`,
        cellDataType: 'text',
      },
      {
        field: 'SERIAL_NUMBER',
        editable: false,
        filter: false,
        headerName: `${t('SERIAL No')}`,
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
      {
        field: 'OWNER',
        editable: false,
        filter: false,
        headerName: `${t('OWNER')}`,
        cellDataType: 'text',
      },
      {
        field: 'RECEIVING_NUMBER',
        editable: false,
        filter: false,
        headerName: `${t('RECEIVING')}`,
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
    ],
    [t]
  );

  const handleOpenReport = (reportData: any) => {
    Modal.confirm({
      title: t('PARTS EXPIRY REPORT'),
      content: reportData,
      width: '80%',
      onCancel: () => {},
    });
  };

  const transformedPartNumbers = useMemo(() => {
    return transformToIStockPartNumber(parts || []);
  }, [parts]);
  return (
    <div className="h-[82vh]    overflow-hidden flex flex-col justify-between ">
      <div className="flex flex-col gap-5 overflow-hidden ">
        <div className=" bg-white">
          <TransferPartAdmin
            onDataTargetUpdate={function (data: any): void {
              setSelectedTargetValues(data);
            }}
            onSubmit={function (data: any): void {
              setSelectedSerchValues(data);
              // setSelectedTargetValues(null);
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
              <PermissionGuard
                requiredPermissions={[
                  Permission.PART_TRANSFER_ACTIONS,
                  Permission.PART_EDIT_ACTIONS,
                ]}
              >
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
              </PermissionGuard>
            </Col>
          </div>
          <div className="flex gap-5">
            <Col style={{ textAlign: 'right' }}>
              <Space>
                <PermissionGuard requiredPermissions={[Permission.PRINT_LABEL]}>
                  <ReportPrintLabel
                    xmlTemplate={''}
                    data={[]}
                    ids={rowKeys}
                    isDisabled={!rowKeys.length}
                  ></ReportPrintLabel>
                </PermissionGuard>
                {/* <PermissionGuard
                  requiredPermissions={[
                    Permission.PART_TRANSFER_ACTIONS,
                    Permission.EXPORT,
                  ]}
                > */}
                {/* <ReportEXEL
                    isDisabled={!rowKeys.length}
                    headers={{
                      LOCAL_ID: 'НОМЕР БИРКИ',
                      PART_NUMBER: 'НАМЕНКЛАТУРА',
                      NAME_OF_MATERIAL: 'ОПИСАНИЕ',
                      SERIAL_NUMBER: 'СЕРИЙНЫЙ НОМЕР/НОМЕР ПАРТИИ',
                      QUANTITY: 'КОЛИЧЕСТВО',
                      GROUP: 'ГРУППА',
                      estimatedDueDate: 'КРАЙНЯЯ ДАТА ПОВЕРКИ',
                      nextDueMOS: 'СЛЕДУЮЩЯЯ ДАТА ПОВЕРКИ',
                      'storeID.storeShortName': 'СКЛАД',
                      'locationID.locationName': 'ЛОКАЦИЯ',
                    }}
                    data={selectedParts}
                    fileName={'PARTS_REPORTS_'}
                  ></ReportEXEL> */}
                {/* </PermissionGuard> */}
              </Space>
            </Col>
            <Col>
              <PermissionGuard requiredPermissions={[Permission.PRINT_LABEL]}>
                <ReportPrintQR
                  openSettingsModal
                  pageBreakAfter={false}
                  // qrCodeSize={32}
                  // fontSize={5}
                  isDisabled={!rowKeys.length}
                  data={selectedParts}
                  ids={rowKeys}
                ></ReportPrintQR>
              </PermissionGuard>
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

        <div className="">
          {/* <PartsTransferList
            onSelectedParts={function (record: any): void {
              setSecectedParts(record);
            }}
            isLoading={partsQueryLoading || partsLoadingF}
            scrollY={37}
            parts={parts}
            onSelectedIds={function (record: any): void {
              setselectedRowKeys(record);
            }}
          ></PartsTransferList> */}

          <PartContainer
            isLoading={partsQueryLoading || partsLoadingF}
            isFilesVisiable={true}
            isVisible={true}
            pagination={true}
            isAddVisiable={true}
            isButtonVisiable={false}
            isEditable={true}
            height={'52vh'}
            columnDefs={columnDefs}
            partNumbers={[]}
            isChekboxColumn={true}
            onUpdateData={(data: any[]): void => {}}
            rowData={transformedPartNumbers}
            onCheckItems={setselectedRowKeys}
            onRowSelect={(data: any[]): void => {
              setSecectedParts([data]);
            }}
            onDRowSelect={(data: any[]): void => {
              // setSecectedParts([data]);
              setOpenPartsModify(true);
            }}
            // isLoading={false}
          />
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
              // [data];
              setselectedRowKeys(data._id);
              // console.log(data);
            }}
            currentPart={
              // null
              selectedParts && selectedParts.length && selectedParts[0]
            }
          />
        </Modal>
      </div>
    </div>
  );
};

export default PartsTransferNew;
