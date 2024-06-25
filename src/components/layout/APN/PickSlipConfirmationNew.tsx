import { PrinterOutlined, SaveOutlined } from '@ant-design/icons';
import { Split } from '@geoffcox/react-splitter';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import PickslipRequestFilterForm from '../pickSlipConfirmationNew/PickslipRequestFilterForm';
import PartContainer from '@/components/woAdministration/PartContainer';
import { useTranslation } from 'react-i18next';
import { ColDef } from 'ag-grid-community';
import {
  transformToIStockPartNumber,
  transformToPickSlipItemBooked,
  transformToPickSlipItemItem,
} from '@/services/utilites';
import { useGetStorePartsQuery } from '@/features/storeAdministration/PartsApi';
import {
  useGetPickSlipsQuery,
  useUpdatePickSlipMutation,
} from '@/features/pickSlipAdministration/pickSlipApi';
import { useGetPickSlipItemsQuery } from '@/features/pickSlipAdministration/pickSlipItemsApi';
import { Button, Modal, Space, notification } from 'antd';
import {
  useAddPickSlipBookingsItemMutation,
  useUpdatePickSlipBookingsItemMutation,
} from '@/features/pickSlipAdministration/pickSlipBookingsItemsApi';
import BookedPartContainer from '../pickSlipConfirmationNew/BookedPartContainer';
import { USER_ID } from '@/utils/api/http';
import GeneretedPickSlip from '@/components/pdf/GeneretedPickSlip';
import GeneretedWorkLabels from '@/components/pdf/GeneretedWorkLabels';
import ReportPrintLabel from '@/components/shared/ReportPrintLabel';

type CellDataType = 'text' | 'number' | 'date' | 'boolean' | 'Object';

interface ExtendedColDef extends ColDef {
  cellDataType: CellDataType;
}

const PickSlipConfirmationNew: FC = () => {
  const { t } = useTranslation();
  const [pickSlipSearchValues, setpickSlipSearchValues] = useState<any>();
  const [currentPickSlipItem, setCurrentPickSlipItem] = useState<any>(null);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [rowDataForSecondContainer, setRowDataForSecondContainer] = useState<
    any[]
  >([]);

  const {
    data: pickSlips,
    isLoading,
    refetch: pickSlipRefetch,
  } = useGetPickSlipsQuery(
    {
      pickSlipNumberNew: pickSlipSearchValues?.pickSlipNumberNew || '',
    },
    {
      skip: !pickSlipSearchValues,
    }
  );

  const [addBookingsPickslip] = useAddPickSlipBookingsItemMutation({});
  const [updatePickSlip] = useUpdatePickSlipMutation({});
  const [updateBookingsPickslip] = useUpdatePickSlipBookingsItemMutation({});
  const [openPickSlip, setOpenPickSlip] = useState(false);
  const {
    data: parts,
    isLoading: partsQueryLoading,
    isFetching: partsLoadingF,
    refetch,
  } = useGetStorePartsQuery(
    {
      partNumberID: currentPickSlipItem?.requestedPartNumberID,
      storeID: pickSlips && pickSlips[0]?.getFromID?._id,
      includeAlternates: true,
      ifStockCulc: true,
    },
    {
      skip: !currentPickSlipItem?.requestedPartNumberID,
    }
  );

  const { data: pickSlipItems, refetch: refetchItems } =
    useGetPickSlipItemsQuery(
      { pickSlipID: pickSlips && pickSlips[0]?.id },
      { skip: !pickSlips }
    );

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

    {
      field: 'reservedQTY',
      editable: false,
      filter: false,
      headerName: `${t('RESERVED QTY')}`,
      cellDataType: 'number',
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
    {
      field: 'DOC_NUMBER',
      editable: false,
      filter: false,
      headerName: `${t('DOC_NUMBER')}`,
      cellDataType: 'text',
    },
    {
      field: 'DOC_TYPE',
      editable: false,
      filter: false,
      headerName: `${t('DOC_TYPE')}`,
      cellDataType: 'text',
    },
  ]);

  const [columnBookedDefs, setColumnBookedDefs] = useState<ExtendedColDef[]>([
    {
      headerName: `${t('REQUESTED PART No')}`,
      field: 'PART_NUMBER_REQUEST',
      editable: false,
      cellDataType: 'text',
    },

    {
      headerName: `${t('LOCAL_ID')}`,
      field: 'LOCAL_ID',
      editable: false,
      cellDataType: 'text',
    },
    {
      field: 'STORE',
      editable: false,
      filter: false,
      headerName: `${t('STORE')}`,
      cellDataType: 'text',
    },
    {
      field: 'LOCATION',
      editable: false,
      filter: false,
      headerName: `${t('LOCATION FROM')}`,
      cellDataType: 'text',
    },
    {
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER_BOOKED',
      editable: false,
      cellDataType: 'text',
    },
    {
      headerName: `${t('DESCRIPTION')}`,
      field: 'DESCRIPTION',
      editable: false,
      cellDataType: 'text',
    },

    {
      field: 'SERIAL_NUMBER',
      editable: false,
      filter: false,
      headerName: `${t('BATCH/SERIAL')}`,
      cellDataType: 'text',
    },
    // {
    //   field: 'CONDITION',
    //   editable: false,
    //   filter: false,
    //   headerName: `${t('CONDITION')}`,
    //   cellDataType: 'text',
    // },
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
      field: 'requestedQty',
      headerName: `${t('REQUESTED QTY')}`,
      cellDataType: 'number',
    },
    {
      field: 'availableQty',
      headerName: `${t('AVAILABLE QTY')}`,
      cellDataType: 'number',
    },
    {
      field: 'bookedQty',
      headerName: `${t('BOOKED QTY')}`,
      cellDataType: 'number',
      editable: true,
    },
    {
      field: 'canceledQty',
      headerName: `${t('CANCELED QTY')}`,
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
      field: 'OWNER',
      editable: false,
      filter: false,
      headerName: `${t('OWNER')}`,
      cellDataType: 'text',
    },
  ]);

  const transformedPartNumbers = useMemo(() => {
    return transformToIStockPartNumber(parts || []);
  }, [parts]);

  const transformedRequirements = useMemo(() => {
    return (
      pickSlips &&
      pickSlips[0] &&
      transformToPickSlipItemBooked(pickSlipItems || [])
    );
  }, [pickSlips && pickSlips[0], pickSlipItems]);

  const handleRowSelect = useCallback((row: any) => {
    setCurrentPickSlipItem(row);
    console.log(row);
  }, []);

  const handleRowSelectStoreParts = useCallback(
    (row: any) => {
      // console.log(row);
      if (currentPickSlipItem) {
        const updatedData = rowDataForSecondContainer.map((rowOld) =>
          rowOld.id === currentPickSlipItem.id
            ? {
                ...rowOld,
                partNumberIDBooked: row.partID,
                PART_NUMBER_BOOKED: row.PART_NUMBER,
                DESCRIPTION: row.NAME_OF_MATERIAL,
                SERIAL_NUMBER: row?.SERIAL_NUMBER || row?.SUPPLIER_BATCH_NUMBER,
                PRODUCT_EXPIRATION_DATE: row.SERIAL_NUMBER,
                UNIT_OF_MEASURE: row.UNIT_OF_MEASURE,
                LOCAL_ID: row?.LOCAL_ID,
                OWNER: row?.OWNER,
                STORE: row?.storeID?.storeShortName,
                LOCATION: row?.locationID?.locationName,
                availableQty: row?.QUANTITY,
                storeItemID: row?._id,
                files: row?.FILES,
              }
            : rowOld
        );
        // console.log(updatedData);
        setRowDataForSecondContainer(updatedData); // Убедитесь, что этот вызов не закомментирован
      }
    },
    [currentPickSlipItem, rowDataForSecondContainer]
  ); // Добавьте зависимости

  useEffect(() => {
    if (transformedRequirements && transformedRequirements.length > 0) {
      setRowDataForSecondContainer(transformedRequirements);
      // onUpdateData(fetchData);
    }
  }, [transformedRequirements]);
  const [issuedData, setIssuedRowData] = useState<any[]>([]);
  const handleSubmitINProgress = async () => {
    console.log('progressParts:', issuedData);

    const hasInvalidData = issuedData.some((item) => {
      if (item.bookedQty === undefined || item.bookedQty === null) {
        return true;
      }
      if (item.bookedQty > item.availableQty) {
        return true;
      }
      if (item.bookedQty > item.requestQuantity) {
        return true;
      }
      return false;
    });

    if (hasInvalidData) {
      notification.error({
        message: t('ERROR'),
        description: t(
          'Invalid data in the table. Please check the bookedQty quantities.'
        ),
      });
      return false;
    }

    try {
      for (const item of issuedData) {
        console.log(item);
        if (item.createUserID) {
          // Если есть createUserID, вызываем updateBookingsPickslip
          await updateBookingsPickslip({
            pickSlipBokingsItem: {
              id: item?.id || item?._id,
              status: 'progress',
              bookedQty: item?.bookedQty,
              storeItemID: item?.storeItemID?._id,
              requirementID: item?.requirementID?._id,
              partNumberID: item.partNumberID,
              requestedQty: item?.requestQuantity,
              requestedPartNumberID: item?.requestedPartNumberID,
              partNumberIDBooked: item?.partNumberIDBooked,
              pickSlipItemID: item?.pickSlipItemID,
              pickSlipID: item?.pickSlipID,
            },
            projectID: item?.projectID,
            projectTaskID: item?.projectTaskID,
          }).unwrap();
        } else {
          // Если нет createUserID, вызываем addBookingsPickslip
          await addBookingsPickslip({
            pickSlipItem: {
              status: item?.status,
              bookedQty: item?.bookedQty,
              storeItemID: item?.storeItemID,
              requirementID: item?.requirementID,
              partNumberID: item.partNumberID,
              requestedQty: item?.requestQuantity,
              requestedPartNumberID: item?.requestedPartNumberID,
              partNumberIDBooked: item?.partNumberIDBooked,
              pickSlipItemID: item?.pickSlipItemID,
              pickSlipID: item?.pickSlipID,
              storeManID: USER_ID,
            },
            projectID: item?.projectID,
            projectTaskID: item?.projectTaskID,
          }).unwrap();
        }
        pickSlipRefetch();
        refetchItems();
        notification.info({
          message: t('PARTS IN PROGRESS'),
          description: t('Parts in Progress'),
        });
      }
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Error creating or updating pick slip items.'),
      });
      return false;
    }
  };

  const handleSubmitComplete = async () => {
    console.log('progressParts:', issuedData);
    const hasInvalidData = issuedData.some((item) => {
      if (item.bookedQty === undefined || item.bookedQty === null) {
        return true;
      }
      if (item.bookedQty > item.availableQty) {
        return true;
      }
      if (item.bookedQty > item.requestQuantity) {
        return true;
      }
      return false;
    });
    if (hasInvalidData) {
      notification.error({
        message: t('ERROR'),
        description: t(
          'Invalid data in the table. Please check the bookedQty quantities.'
        ),
      });
      return false;
    }
    try {
      await updatePickSlip({
        pickSlip: {
          state: 'complete',
          id:
            (pickSlips && pickSlips[0]?._id) || (pickSlips && pickSlips[0]?.id),
        },
      }).unwrap();
      pickSlipRefetch();
      refetchItems();
      refetch();
      notification.info({
        message: t('PARTS COMPLETED'),
        description: t('Parts COMPLETED'),
      });
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Error update pick slip or pick slip items.'),
      });
      return false;
    }
  };
  const handleClose = async () => {
    console.log('progressParts:', issuedData);
    const hasInvalidData = issuedData.some((item) => {
      if (item.bookedQty === undefined || item.bookedQty === null) {
        return true;
      }
      if (item.bookedQty > item.availableQty) {
        return true;
      }
      if (item.bookedQty > item.requestQuantity) {
        return true;
      }
      return false;
    });
    if (hasInvalidData) {
      notification.error({
        message: t('ERROR'),
        description: t(
          'Invalid data in the table. Please check the bookedQty quantities.'
        ),
      });
      return false;
    }
    try {
      await updatePickSlip({
        pickSlip: {
          state: 'closed',
          id:
            (pickSlips && pickSlips[0]?._id) || (pickSlips && pickSlips[0]?.id),
        },
      }).unwrap();
      pickSlipRefetch();
      refetchItems();
      refetch();
      notification.info({
        message: t('CLOSE PICKSLIP'),
        description: t('PICKSLIP CLOSE'),
      });
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Error update pick slip or pick slip items.'),
      });
      return false;
    }
  };

  return (
    <div className="h-[82vh]    overflow-hidden flex flex-col justify-between ">
      <Split initialPrimarySize="48%" horizontal splitterSize="20px">
        <div className="flex flex-col ">
          <Split initialPrimarySize="36%" splitterSize="20px">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col rounded-md p-3 h-[35vh] bg-white overflow-y-auto  ">
                <PickslipRequestFilterForm
                  pickSlip={pickSlips && pickSlips[0]}
                  onpickSlipSearchValues={function (values: any): void {
                    setpickSlipSearchValues(values);
                  }}
                ></PickslipRequestFilterForm>
              </div>
              <Space>
                <Button
                  disabled={
                    !pickSlips ||
                    (pickSlips && pickSlips[0]?.state == 'closed') ||
                    (pickSlips && pickSlips[0]?.state == 'complete') ||
                    (pickSlips && pickSlips[0]?.state == 'canceled')
                    // ||
                    // (pickSlips && pickSlips[0]?.state == 'complete')
                  }
                  onClick={async () => {}}
                  size="small"
                  icon={<SaveOutlined />}
                >
                  {t('COPY TABLE DATA and TAKE')}
                </Button>
              </Space>
            </div>

            <div className="flex flex-col rounded-md p-3 h-[40vh] bg-white overflow-y-auto  ">
              <PartContainer
                isFilesVisiable={true}
                isVisible={true}
                pagination={false}
                isAddVisiable={true}
                isButtonVisiable={false}
                isEditable={true}
                height={'38vh'}
                columnDefs={columnDefs}
                partNumbers={[]}
                onRowSelect={handleRowSelectStoreParts}
                onUpdateData={(data: any[]): void => {}}
                rowData={transformedPartNumbers}
              />
            </div>
          </Split>
        </div>
        <div className="flex flex-col gap-3 justify-between">
          <BookedPartContainer
            isFilesVisiable={true}
            isChekboxColumn={false}
            isVisible={false}
            pagination={false}
            isAddVisiable={true}
            isButtonVisiable={false}
            isEditable={true}
            height={'35vh'}
            columnDefs={columnBookedDefs}
            partNumbers={[]}
            onRowSelect={handleRowSelect}
            onUpdateData={(data: any[]): void => {
              setIssuedRowData(data);
              console.log(data);
            }}
            fetchData={rowDataForSecondContainer}
          />
          <div className="flex justify-between">
            <Space align="center">
              <Button
                disabled={
                  !pickSlips ||
                  (pickSlips && pickSlips[0]?.state == 'closed') ||
                  (pickSlips && pickSlips[0]?.state == 'complete') ||
                  (pickSlips && pickSlips[0]?.state == 'canceled')
                  // ||
                  // (pickSlips && pickSlips[0]?.state == 'complete')
                }
                icon={<PrinterOutlined />}
                onClick={() => {
                  handleSubmitINProgress();
                }}
                size="small"
              >
                {' '}
                {t('SAVE')}
              </Button>
              <Button
                disabled={
                  !pickSlips || (pickSlips && pickSlips[0]?.state == 'open')
                }
                icon={<PrinterOutlined />}
                onClick={() => {
                  if (pickSlips && pickSlips[0]?.state) {
                  } else if (pickSlips && pickSlips[0]?.state) {
                    // setOpenCompletePrint(true);
                  } else {
                    setOpenPickSlip(true);
                  }
                }}
                size="small"
              >
                {' '}
                {t('PRINT')}
              </Button>
              <Button
                disabled={
                  !pickSlips ||
                  (pickSlips && pickSlips[0]?.state !== 'progress')
                }
                onClick={async () => {
                  handleSubmitComplete();
                }}
                size="small"
              >
                {' '}
                {t('COMPLETE')}
              </Button>
              <Button
                disabled={
                  !pickSlips ||
                  (pickSlips && pickSlips[0]?.state !== 'complete')
                }
                onClick={async () => {
                  handleClose();
                }}
                size="small"
                icon={<SaveOutlined />}
              >
                {t('BOOK')}
              </Button>
            </Space>
            <Space>
              <ReportPrintLabel
                xmlTemplate={''}
                data={rowDataForSecondContainer}
                ids={''}
                isDisabled={
                  !pickSlips ||
                  (pickSlips && pickSlips[0]?.bookedItems?.length) ||
                  (pickSlips && pickSlips[0]?.state == 'open')
                }
              ></ReportPrintLabel>
            </Space>
          </div>
        </div>
      </Split>
      {/* <Modal
        title={t('PICKSLIP PRINT')}
        open={openPickSlip}
        width={'60%'}
        onCancel={() => setOpenPickSlip(false)}
        footer={null}
      >
        <GeneretedWorkLabels currentPick={issuedData} />
      </Modal> */}
    </div>
  );
};

export default PickSlipConfirmationNew;
