//@ts-nocheck

import { PrinterOutlined, SaveOutlined } from '@ant-design/icons';
import { Split } from '@geoffcox/react-splitter';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useId,
  useState,
} from 'react';
import PickslipRequestFilterForm from '../pickSlipConfirmationNew/PickslipRequestFilterForm';
import { useTranslation } from 'react-i18next';
import { ColDef } from 'ag-grid-community';
import { $authHost, API_URL } from '@/utils/api/http';
import {
  UploadOutlined,
  ProjectOutlined,
  FileOutlined,
  MinusSquareOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  handleFileOpenTask,
  handleOpenReport,
  transformToIStockPartNumber,
  transformToPickSlipItemBooked,
  transformToPickSlipItemItem,
} from '@/services/utilites';
import { useGetStorePartsQuery } from '@/features/storeAdministration/PartsApi';
import {
  useGetPickSlipsQuery,
  useUpdatePickSlipMutation,
  useSaveAndCompletePickSlipMutation,
  useFastBookPickSlipMutation,
} from '@/features/pickSlipAdministration/pickSlipApi';
import {
  useAddPickSlipItemMutation,
  useGetPickSlipItemQuery,
  useGetPickSlipItemsQuery,
} from '@/features/pickSlipAdministration/pickSlipItemsApi';
import { Button, Col, Modal, Space, notification } from 'antd';
import {
  useAddPickSlipBookingsItemMutation,
  useUpdatePickSlipBookingsItemMutation,
} from '@/features/pickSlipAdministration/pickSlipBookingsItemsApi';
import BookedPartContainer from '../pickSlipConfirmationNew/BookedPartContainer';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import GeneretedPickSlip from '@/components/pdf/GeneretedPickSlip';
import GeneretedWorkLabels from '@/components/pdf/GeneretedWorkLabels';
import ReportPrintLabel from '@/components/shared/ReportPrintLabel';
import { useAddBookingMutation } from '@/features/bookings/bookingApi';
import { generateReport } from '@/utils/api/thunks';
import { useGetFilteredRequirementsQuery } from '@/features/requirementAdministration/requirementApi';

import PDFExport from '@/components/reports/ReportBase';
import PickSlipGenerator from './PickSlipGenerator';
import UniversalAgGrid from '@/components/shared/UniversalAgGrid';
import { useTypedSelector } from '@/hooks/useTypedSelector';
type CellDataType = 'text' | 'number' | 'date' | 'boolean' | 'Object';
import { v4 as uuidv4 } from 'uuid';
interface ExtendedColDef extends ColDef {
  cellDataType: any;
}

const PickSlipConfirmationNew: FC = () => {
  const { t } = useTranslation();
  const { panes, activeKey } = useTypedSelector((state) => state.tabs);
  const currentPane = panes.find((pane) => pane.key === activeKey);
  const pickSlipNumber = currentPane?.pickSlipNumber;

  console.log('Current pane:', currentPane);
  console.log('Pick slip number from pane:', pickSlipNumber);

  const [pickSlipSearchValues, setpickSlipSearchValues] = useState<any>({
    pickSlipNumberNew: pickSlipNumber,
  });
  const [currentPickSlipItem, setCurrentPickSlipItem] = useState<any>(null);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [rowDataForSecondContainer, setRowDataForSecondContainer] = useState<
    any[]
  >([]);
  const tabId = useMemo(() => currentPane?.key || uuidv4(), [currentPane?.key]);
  const componentId = useId();
  const sessionId = useMemo(() => uuidv4(), []);
  const {
    data: pickSlips,
    isLoading,
    refetch: pickSlipRefetch,
  } = useGetPickSlipsQuery(
    {
      pickSlipNumberNew: pickSlipSearchValues?.pickSlipNumberNew || '',
      tabId,
    },
    {
      skip: !pickSlipSearchValues?.pickSlipNumberNew,
    }
  );
  const [addBooking] = useAddBookingMutation({});
  // const { data: item } = useGetPickSlipItemQuery({});
  const { data: requirements, refetch: refetchRequirements } =
    useGetFilteredRequirementsQuery(
      {
        projectID: pickSlips && pickSlips[0]?.projectID?._id,
      },
      {
        refetchOnMountOrArgChange: true, // Пример альтернативного подхода для кэширования
      }
    );

  // Обовление других частей приложения после вызова refetchRequirements
  // useEffect(() => {
  //   // Логика обновления других частей приложения
  // }, [requirements]); // Обновление при изменении requirements

  // const { refetch: refetchRequirements } = useGetFilteredRequirementsQuery({
  //   projectID: pickSlips && pickSlips[0]?.projectID?._id,
  // });
  const [addBookingsPickslip] = useAddPickSlipBookingsItemMutation({});
  const [updatePickSlip] = useUpdatePickSlipMutation({});
  const [updateBookingsPickslip] = useUpdatePickSlipBookingsItemMutation({});
  const [addPickSlipItem] = useAddPickSlipItemMutation({});
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
      componentId,
      sessionId,
      tabId,
    },
    {
      skip: !currentPickSlipItem?.requestedPartNumberID || !currentPickSlipItem,
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
      refetchOnFocus: true,
    }
  );

  const { data: pickSlipItems, refetch: refetchItems } =
    useGetPickSlipItemsQuery(
      {
        pickSlipID: pickSlips && pickSlips[0]?.id,
        tabId, // Добавляем tabId в параметры запроса
      },
      {
        skip: !pickSlips,
        // Добавляем уникальный ключ кэширования для каждой вкладки
        queryKey: [`pickSlipItems-${tabId}`],
      }
    );

  const [columnDefs, setColumnDefs] = useState<ExtendedColDef[]>([
    {
      headerName: `${t('LOCAL_ID')}`,
      field: 'LOCAL_ID',
      editable: false,
      cellDataType: 'text',
      width: 100,
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
      width: 100,
    },
    {
      field: 'TYPE',
      headerName: `${t('TYPE')}`,
      cellDataType: 'text',
      width: 100,
    },
    {
      field: 'QUANTITY',
      editable: false,
      filter: false,
      headerName: `${t('QTY')}`,
      cellDataType: 'number',
      width: 100,
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('UOM')}`,
      cellDataType: 'text',
      width: 100,
    },
    {
      field: 'STOCK',
      editable: false,
      filter: false,
      headerName: `${t('STORE')}`,
      cellDataType: 'text',
      width: 100,
    },
    {
      field: 'LOCATION',
      editable: false,
      filter: false,
      headerName: `${t('LOCATION')}`,
      cellDataType: 'text',
      width: 100,
    },
    {
      field: 'SERIAL_NUMBER',
      editable: false,
      filter: false,
      headerName: `${t('SERIAL NUMBER')}`,
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
      width: 150,
    },

    {
      field: 'reservedQTY',
      editable: false,
      filter: false,
      headerName: `${t('RESERVED QTY')}`,
      cellDataType: 'number',
      width: 100,
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
      width: 150,
    },
    {
      field: 'DOC_NUMBER',
      editable: false,
      filter: false,
      headerName: `${t('DOC_NUMBER')}`,
      cellDataType: 'text',
      width: 100,
    },
    {
      field: 'DOC_TYPE',
      editable: false,
      filter: false,
      headerName: `${t('DOC_TYPE')}`,
      cellDataType: 'text',
      width: 100,
    },
    {
      field: 'FILES',
      headerName: `${t('DOC')}`,
      // minWidth: 140,
      // flex: 1,
      cellRenderer: (params: any) => {
        const files = params.value;
        if (!files || files.length === 0) return null;
        const file = files[0];
        return (
          <div
            className="cursor-pointer hover:text-blue-500"
            onClick={() => {
              handleFileOpenTask(file.fileId, 'uploads', file.filename);
            }}
          >
            <FileOutlined />
          </div>
        );
      },
      cellDataType: undefined,
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
      width: 80,
    },
    {
      field: 'STORE',
      editable: false,
      filter: false,
      headerName: `${t('STORE')}`,
      cellDataType: 'text',
      width: 80,
    },
    {
      field: 'LOCATION',
      editable: false,
      filter: false,
      headerName: `${t('LOCATION FROM')}`,
      cellDataType: 'text',
      width: 150,
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
      width: 150,
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
      width: 130,
    },
    {
      field: 'requestedQty',
      headerName: `${t('REQUESTED QTY')}`,
      cellDataType: 'number',
      width: 130,
    },
    {
      field: 'availableQty',
      headerName: `${t('AVAILABLE QTY')}`,
      cellDataType: 'number',
      width: 130,
    },
    // В определении колонки bookedQty
    {
      field: 'bookedQty',
      headerName: `${t('BOOKED QTY')}`,
      cellDataType: 'number',
      editable: true,
      width: 130,
      cellStyle: (params) => {
        const value = Number(params.value);
        const isInvalid =
          isNaN(value) ||
          value <= 0 ||
          value > params.data.requestedQty ||
          !params.data.partNumberIDBooked;

        return isInvalid ? { backgroundColor: '#FFCCCB' } : null;
      },
      valueParser: (params) => {
        const value = Number(params.newValue);
        return isNaN(value) || value < 0 ? 0 : value;
      },
      valueSetter: (params) => {
        const newValue = Number(params.newValue);
        const relatedRows = rowDataForSecondContainer.filter(
          (row) =>
            row.PART_NUMBER_REQUEST === params.data.PART_NUMBER_REQUEST &&
            row.id !== params.data.id
        );

        const totalBookedQty = relatedRows.reduce(
          (sum, row) => sum + (row.bookedQty || 0),
          0
        );

        const newTotalBookedQty = totalBookedQty + newValue;

        if (newTotalBookedQty > params.data.requestedQty) {
          notification.warning({
            message: t('WARNING'),
            description: t(
              'Total booked quantity cannot exceed requested quantity'
            ),
          });
          return false;
        }

        // Обновляем значение
        params.data.bookedQty = newValue;

        // Немедленно обновляем ячейку
        params.api.refreshCells({
          force: true,
          rowNodes: [params.node],
          columns: ['bookedQty'],
        });

        // Обновляем весь ряд для перерасчета зависимых значений
        setTimeout(() => {
          params.api.redrawRows({ rowNodes: [params.node] });
        }, 0);

        return true;
      },
      onCellValueChanged: (params) => {
        // Дополнительное обновление после изменения значения
        params.api.refreshCells({
          force: true,
          rowNodes: [params.node],
          columns: ['bookedQty'],
        });
      },
    },
    {
      field: 'partNumberIDBooked',
      headerName: `${t('BOOKED PART ID')}`,
      cellDataType: 'text',
      hide: true,
      cellStyle: (params) => {
        if (!params.value) {
          return { backgroundColor: '#FFCCCB' };
        }
        return null;
      },
    },
    {
      field: 'canceledQty',
      headerName: `${t('CANCELLED QTY')}`,
      cellDataType: 'number',
      width: 130,
    },
    {
      field: 'UNIT_OF_MEASURE_BOOKED',
      editable: false,
      filter: false,
      headerName: `${t('UOM')}`,
      cellDataType: 'text',
      width: 80,
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
    // Если нет currentPickSlipItem, возвращаем пусто массив
    if (!currentPickSlipItem) {
      return [];
    }

    // Если нет parts или он пусой, возвращаем пустой массив
    if (!parts || parts.length === 0) {
      return [];
    }

    // Получаем текущую дату
    const currentDate = new Date();

    // Фильтруем части по дате и restrictionID
    const filteredParts = parts.filter((part) => {
      const expirationDate = new Date(part?.PRODUCT_EXPIRATION_DATE);
      if (part?.PRODUCT_EXPIRATION_DATE) {
        return (
          expirationDate >= currentDate &&
          part?.locationID?.restrictionID === 'standart'
        );
      }
      return part?.locationID?.restrictionID === 'standart';
    });

    return transformToIStockPartNumber(filteredParts);
  }, [parts, currentPickSlipItem, pickSlips]);

  const transformedRequirements = useMemo(() => {
    // console.log(transformToPickSlipItemBooked(pickSlipItems));
    return (
      pickSlips &&
      pickSlips[0] &&
      transformToPickSlipItemBooked(pickSlipItems || [])
    );
  }, [pickSlips && pickSlips[0], pickSlipItems]);

  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const handleRowSelect = useCallback((rows: any[]) => {
    setSelectedRows(rows);
    console.log('selectedRows', rows);
    if (rows.length === 1) {
      setCurrentPickSlipItem(rows[0]);
    } else {
      setCurrentPickSlipItem(null);
    }
  }, []);

  const handleRowSelectStoreParts = useCallback(
    (row: any) => {
      if (
        currentPickSlipItem &&
        (currentPickSlipItem?.state === 'progress' ||
          currentPickSlipItem?.state === 'open' ||
          currentPickSlipItem?.status === 'progress' ||
          currentPickSlipItem?.status === 'open')
      ) {
        const updatedData = rowDataForSecondContainer.map((rowOld) => {
          if (rowOld.id === currentPickSlipItem.id) {
            const relatedRows = rowDataForSecondContainer.filter(
              (r) =>
                r.PART_NUMBER_REQUEST === rowOld.PART_NUMBER_REQUEST &&
                r.id !== rowOld.id
            );

            const totalBookedQty = relatedRows.reduce(
              (sum, r) => sum + (r.bookedQty || 0),
              0
            );

            if (totalBookedQty >= rowOld.requestedQty) {
              notification.warning({
                message: t('WARNING'),
                description: t(
                  'Total booked quantity cannot exceed requested quantity'
                ),
              });
              return rowOld;
            }

            const remainingRequestedQty = Math.max(
              rowOld.requestedQty - totalBookedQty,
              0
            );

            let bookedQty = Math.min(remainingRequestedQty, row.QUANTITY);
            console.log(row);
            return {
              ...rowOld,
              partNumberIDBooked: row.partID,
              PART_NUMBER_BOOKED: row.PART_NUMBER,
              DESCRIPTION: row.NAME_OF_MATERIAL,
              SERIAL_NUMBER: row?.SERIAL_NUMBER || row?.SUPPLIER_BATCH_NUMBER,
              PRODUCT_EXPIRATION_DATE: row.PRODUCT_EXPIRATION_DATE,
              UNIT_OF_MEASURE: row.UNIT_OF_MEASURE,
              LOCAL_ID: row?.LOCAL_ID,
              OWNER: row?.OWNER,
              STORE: row?.storeID?.storeShortName,
              LOCATION: row?.locationID?.locationName,
              availableQty: row?.QUANTITY,
              storeItemID: row?._id || row?.id,
              files: row?.FILES,
              bookedQty: bookedQty,
            };
          }
          return rowOld;
        });
        console.log('updatedData:', updatedData);
        setRowDataForSecondContainer(updatedData);
        setIssuedRowData(updatedData);

        // Добавляем обновление стилей через AG Grid API
        const gridApi = document.querySelector('#bookedPartContainer')?.['api'];
        if (gridApi) {
          // Находим измененную строку
          const updatedRow = updatedData.find(
            (row) => row.id === currentPickSlipItem.id
          );
          if (updatedRow) {
            // Находим node для этой строки
            const rowNode = gridApi.getRowNode(updatedRow.id);
            if (rowNode) {
              // Обновляем ячейки
              gridApi.refreshCells({
                force: true,
                rowNodes: [rowNode],
                columns: ['bookedQty', 'partNumberIDBooked'],
              });
              // Перерисовываем строку полностью
              gridApi.redrawRows({
                rowNodes: [rowNode],
              });
            }
          }
        }
      }
    },
    [currentPickSlipItem, rowDataForSecondContainer]
  );

  useEffect(() => {
    if (transformedRequirements && transformedRequirements.length > 0) {
      setRowDataForSecondContainer(transformedRequirements);
      setIssuedRowData(transformedRequirements); // Добавляем инициализацию issuedData
    }
  }, [transformedRequirements]);

  // Эффект для сброса данных, если поиск не дал результатов
  useEffect(() => {
    if (pickSlipSearchValues && (!pickSlips || pickSlips.length === 0)) {
      setRowDataForSecondContainer([]);
      setCurrentPickSlipItem(null);
    }
  }, [pickSlips, pickSlipSearchValues]);

  const fetchPickSlipItemData = async (id: string) => {
    try {
      const response = await $authHost.get(
        `pickSlipItem/company/${COMPANY_ID}/item/${id}`
      );
      return response.data; // Возвращаем только данные из ответа
    } catch (error) {
      console.error('Error fetching pick slip item data:', error);
      throw error; // Пробрасываем ошибку для обработки в вызывающем коде
    }
  };
  const [issuedData, setIssuedRowData] = useState<any[]>([]);
  const [saveAndCompletePickSlip] = useSaveAndCompletePickSlipMutation();

  const handleSubmitINProgress = async () => {
    Modal.confirm({
      title: t('Confirm Save'),
      content: t('Are you sure you want to save this pick slip?'),
      okText: t('Yes'),
      cancelText: t('No'),
      onOk: async () => {
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
            // console.log(item);
            if (item.createUserID) {
              // Если есть createUserID, вызываем updateBookingsPickslip
              await updateBookingsPickslip({
                pickSlipBokingsItem: {
                  id: item?.id,
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
                // projectID: item?.projectID,
                // projectTaskID: item?.projectTaskID,
              }).unwrap();
              pickSlipRefetch();
              refetchItems();
              notification.info({
                message: t('PARTS IN PROGRESS'),
                description: t('Parts in Progress'),
              });
            } else if (item.isCopy) {
              console.log('llll');
              // Если isCopy равен true
              const pickSlipItemData = await fetchPickSlipItemData(
                item?.pickSlipItemID
              );
              console.log(pickSlipItemData);
              if (pickSlipItemData) {
                const addedItem = await addPickSlipItem({
                  pickSlipID: item.pickSlipID,
                  pickSlipItem: {
                    partNumberID: pickSlipItemData.partNumberID,
                    requestedQty: pickSlipItemData.requestQuantity,
                    neededOnID: pickSlipItemData.neededOnID,
                    getFromID: pickSlipItemData.getFromID,
                    plannedDate: pickSlipItemData.plannedDate,
                    requirementID: pickSlipItemData?._id,
                    state: pickSlipItemData?.state,
                    type: pickSlipItemData?.type,
                  },
                  projectID: pickSlipItemData?.projectID,
                  projectTaskID: pickSlipItemData?.projectTaskID,
                }).unwrap();
                // Устанавливаем значение _id в item.pickSlipItemID
                // item.pickSlipItemID = addedItem._id;
                await addBookingsPickslip({
                  pickSlipItem: {
                    status: item?.status,
                    bookedQty: item?.bookedQty,
                    storeItemID: item?.storeItemID,
                    requirementID: item?.requirementID,
                    partNumberID: item?.partNumberID,
                    requestedQty: item?.requestedQty,
                    requestedPartNumberID: item?.requestedPartNumberID,
                    partNumberIDBooked: item?.partNumberIDBooked,
                    pickSlipItemID: addedItem._id,
                    pickSlipID: item?.pickSlipID,
                    storeManID: USER_ID,
                    projectID: item?.projectID,
                    projectTaskID: item?.projectTaskID,
                    projectTaskWO: item?.projectTaskWO,
                    projectWO: item?.projectWO,
                  },
                });
                // pickSlipRefetch();
                // refetchItems();
                // notification.info({
                //   message: t('PARTS IN PROGRESS'),
                //   description: t('Parts in Progress'),
                // });
              }
              // Вызываем addBookingsPickslip после обновления pickSlipItemID
            } else {
              console.log('added');
              await addBookingsPickslip({
                pickSlipItem: {
                  status: item?.status,
                  bookedQty: item?.bookedQty,
                  storeItemID: item?.storeItemID,
                  requirementID: item?.requirementID,
                  partNumberID: item?.partNumberID,
                  requestedQty: item?.requestedQty,
                  requestedPartNumberID: item?.requestedPartNumberID,
                  partNumberIDBooked: item?.partNumberIDBooked,
                  pickSlipItemID: item?.pickSlipItemID,
                  pickSlipID: item?.pickSlipID,
                  storeManID: USER_ID,
                  projectID: item?.projectID,
                  projectTaskID: item?.projectTaskID,
                  projectTaskWO: item?.projectTaskWO,
                  projectWO: item?.projectWO,
                },
              });

              // .unwrap();
            }
            // После устаноки item.pickSlipItemID вызываем addBookingsPickslip
          }
          pickSlipRefetch();
          refetchItems();
          // refetchItems();

          notification.info({
            message: t('PARTS IN PROGRESS'),
            description: t('Parts in Progress'),
          });
        } catch (error) {
          notification.error({
            message: t('ERROR'),
            description: t('Error creating or updating pick slip items.'),
          });
          // return false;
        }
      },
    });
  };

  const handleSubmitComplete = async () => {
    Modal.confirm({
      title: t('Confirm Complete'),
      content: t('Are you sure you want to complete this pick slip?'),
      okText: t('Yes'),
      cancelText: t('No'),
      onOk: async () => {
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
          // return false;
        }
        try {
          await updatePickSlip({
            pickSlip: {
              state: 'complete',
              id:
                (pickSlips && pickSlips[0] && pickSlips[0]?.id) ||
                (pickSlips && pickSlips[0] && pickSlips[0]?._id),
            },
          });

          pickSlipRefetch();
          refetchItems();
          // setCurrentPickSlipItem(null)
          refetch();
          notification.info({
            message: t('PARTS COMPLETED'),
            description: t('Parts COMPLETED'),
          });
        } catch (error) {
          console.log(error);
          notification.error({
            message: t('ERROR'),
            description: t('Error update pick slip or pick slip items.'),
          });
          // return false;
        }
      },
    });
  };
  const handleClose = async () => {
    Modal.confirm({
      title: t('Confirm Book'),
      content: t('Are you sure you want to book this pick slip?'),
      okText: t('Yes'),
      cancelText: t('No'),
      onOk: async () => {
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
        const hasNotUserData =
          !pickSlipSearchValues.storeManID ||
          !pickSlipSearchValues.userID ||
          !pickSlipSearchValues.bookingDate;

        if (hasNotUserData) {
          notification.error({
            message: t('ERROR'),
            description:
              'Пожалуйста, заполните все обязательные поля: STOREMAN, MECH, и BOOKING DATE.',
            duration: 3,
          });
          return;
        }
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
              storeManID: pickSlipSearchValues.storeManID,
              userID: pickSlipSearchValues.userID,
              bookingDate: pickSlipSearchValues.bookingDate,
              id:
                (pickSlips && pickSlips[0]?._id) ||
                (pickSlips && pickSlips[0]?.id),
            },
          });
          // try {
          //   for (const item of issuedData) {
          //     const addBookingResponse = await addBooking({
          //       booking: {
          //         voucherModel: 'STORE_TO_A/C',
          //         ...item,
          //         ...item?.storeItemID,
          //         QUANTITY: -item?.QUANTITY,
          //       },
          //     });
          //   }
          // } catch (error) {
          //   notification.error({
          //     message: t('ERROR'),
          //     description: t('Error update pick slip or pick slip items.'),
          //   });
          //   return false;
          // }
          pickSlipRefetch();
          refetchItems();
          refetch();
          refetchRequirements();

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
      if (reportData && pickSlips && pickSlips[0]?.id) {
        const companyID = localStorage.getItem('companyID');
        const queryParams = {
          title: 'PICKSLIP_REPORT',
          token: localStorage.getItem('token'),
          pickSlipID: pickSlips && pickSlips[0]?.id,
        };

        try {
          // ызываем функцию для генерации отчета
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
  }, [pickSlips && pickSlips[0]?.id, reportData]);
  const handleCopyTableData = () => {
    if (pickSlips && pickSlips[0]) {
      // Находим все существующие записи с таким же PART_NUMBER_REQUEST
      const existingBookings = rowDataForSecondContainer.filter(
        (row) =>
          row.PART_NUMBER_REQUEST === currentPickSlipItem.PART_NUMBER_REQUEST
      );

      // Считаем сумму всех bookedQty для этого PART_NUMBER_REQUEST
      const totalBookedQty = existingBookings.reduce(
        (sum, row) => sum + (row.bookedQty || 0),
        0
      );

      // Проверяем, не превышает ли общее количество requestedQty
      if (totalBookedQty >= currentPickSlipItem.requestedQty) {
        notification.warning({
          message: t('WARNING'),
          description: t(
            'Cannot copy: Total booked quantity already equals requested quantity'
          ),
        });
        return;
      }

      // Вычисляем оставшееся количество для бронирования
      const remainingQty = Math.max(
        currentPickSlipItem.requestedQty - totalBookedQty,
        0
      );

      // Создаем копию с новым bookedQty
      const copyPickSlipItem = {
        ...currentPickSlipItem,
        id: uuidv4(),
        isCopy: true,
        bookedQty: remainingQty,
      };

      setRowDataForSecondContainer([
        ...rowDataForSecondContainer,
        copyPickSlipItem,
      ]);
    }
  };

  // Эффект для обновления pickSlipSearchValues при изменении pickSlipNumber
  useEffect(() => {
    console.log('pickSlipNumber changed:', pickSlipNumber);
    if (pickSlipNumber) {
      setpickSlipSearchValues((prev) => {
        const newValues = {
          ...prev,
          pickSlipNumberNew: pickSlipNumber,
        };
        console.log('Updating pickSlipSearchValues:', newValues);
        return newValues;
      });
    }
  }, [pickSlipNumber]);

  // Эффект для выполнения запроса при изменении pickSlipSearchValues
  useEffect(() => {
    console.log('pickSlipSearchValues changed:', pickSlipSearchValues);
    if (pickSlipSearchValues.pickSlipNumberNew) {
      console.log('Refetching pick slip data...');
      pickSlipRefetch();
    }
  }, [pickSlipSearchValues.pickSlipNumberNew, pickSlipRefetch]);
  const handleSaveAndComplete = async () => {
    try {
      Modal.confirm({
        title: t('Confirm Save and Complete'),
        content: t(
          'Are you sure you want to save and complete this pick slip?'
        ),
        okText: t('Yes'),
        cancelText: t('No'),
        onOk: async () => {
          // notification.info({
          //   message: t('ОБРАБОТКА'),
          //   description: t('Сохрание и завершение пикслипа...'),
          //   duration: 2,
          //   key: 'saveAndCompleteNotification',
          // });

          try {
            await saveAndCompletePickSlip({
              pickSlipId: pickSlips[0]?.id,
              issuedData: issuedData,
            });

            notification.success({
              message: t('SUCCESS'),
              description: t('Pick slip saved and completed successfully'),
            });

            // Обновляем данные
            await Promise.all([
              pickSlipRefetch(),
              refetchItems(),
              refetch(),
              // refetchRequirements(),
            ]);

            // notification.close('saveAndCompleteNotification');
          } catch (error) {
            console.error('Ошибка при сохранении и завершении:', error);
            // notification.error({
            //   message: t('ОШИБКА'),
            //   description: t('Не удалось сохранить и завершить пикслип'),
            // });
          }
        },
      });
    } catch (error) {
      console.error('Ошибка в сохранении и завершении:', error);
      notification.error({
        message: t('ОШИБКА'),
        description: t('Не удалось сохранить и завершить пикслип'),
      });
    }
  };

  const [fastBookPickSlip] = useFastBookPickSlipMutation();

  const handleFastBook = async () => {
    if (
      !pickSlipSearchValues.storeManID ||
      !pickSlipSearchValues.userID ||
      !pickSlipSearchValues.bookingDate
    ) {
      notification.error({
        message: t('ERROR'),
        description: t(
          'Please fill in MECH, BOOKING DATE, and STOREMAN fields'
        ),
      });
      return;
    }

    const hasInactiveRows = issuedData.some(
      (item) =>
        item.status === 'inactive' ||
        item.bookedQty === 0 ||
        item.bookedQty === null ||
        item.partNumberIDBooked === null
    );

    if (hasInactiveRows) {
      notification.error({
        message: t('ERROR'),
        description: t('Cannot fast book with inactive or empty rows'),
      });
      return;
    }

    try {
      Modal.confirm({
        title: t('Confirm Book'),
        content: t('Are you sure you want to book this pick slip?'),
        okText: t('Yes'),
        cancelText: t('No'),
        onOk: async () => {
          try {
            await fastBookPickSlip({
              pickSlipId: pickSlips[0]?.id,
              issuedData: issuedData,
              storeManID: pickSlipSearchValues.storeManID,
              userID: pickSlipSearchValues.userID,
              bookingDate: pickSlipSearchValues.bookingDate,
            }).unwrap();
            notification.success({
              message: t('SUCCESS'),
              description: t('Pick slip booked successfully'),
            });
            // Обновляем данные
            await Promise.all([
              pickSlipRefetch(),
              refetchItems(),
              refetch(),
              // refetchRequirements(),
            ]);
          } catch (error) {
            notification.error({
              message: t('ERROR'),
              description: t('Failed to fast book pick slip'),
            });
            console.error('Error in book:', error);
          }
        },
      });
    } catch (error) {
      console.error('Error in fast book:', error);
      notification.error({
        message: t('ERROR'),
        description: t('Failed to fast book pick slip'),
      });
    }
  };

  const handleCellValueChanged = (params) => {
    if (params.colDef.field === 'bookedQty') {
      const updatedData = rowDataForSecondContainer.map((row) =>
        row.id === params.data.id
          ? { ...row, [params.colDef.field]: params.newValue }
          : row
      );
      setRowDataForSecondContainer(updatedData);
      setIssuedRowData(updatedData);
      // Принудительно обновляем стиль ячейки
      params.api.refreshCells({
        force: true,
        columns: ['bookedQty'],
        rowNodes: [params.node],
      });
    } else {
      const updatedData = rowDataForSecondContainer.map((row) =>
        row.id === params.data.id
          ? { ...row, [params.colDef.field]: params.newValue }
          : row
      );
      setRowDataForSecondContainer(updatedData);
      setIssuedRowData(updatedData);
    }
  };

  const handleDeleteSelectedRows = () => {
    if (!selectedRows || selectedRows.length === 0) {
      notification.warning({
        message: t('WARNING'),
        description: t('Please select rows to delete'),
      });
      return;
    }

    Modal.confirm({
      title: t('Confirm Delete'),
      content: t('Are you sure you want to delete the selected rows?'),
      okText: t('Yes'),
      cancelText: t('No'),
      onOk: () => {
        // Фильтруем данные, исключая выбранные строки
        const updatedData = rowDataForSecondContainer.filter(
          (row) =>
            !selectedRows.some(
              (selectedRow) =>
                (selectedRow.id || selectedRow._id) === (row.id || row._id)
            )
        );

        setRowDataForSecondContainer(updatedData);
        setIssuedRowData(updatedData);
        setSelectedRows([]);
        setCurrentPickSlipItem(null);

        notification.success({
          message: t('SUCCESS'),
          description: t('Selected rows have been deleted'),
        });
      },
    });
  };

  return (
    <div className="h-[82vh] overflow-hidden flex flex-col justify-between ">
      <Split initialPrimarySize="48%" horizontal splitterSize="20px">
        <div className="flex flex-col ">
          <Split initialPrimarySize="40%" splitterSize="20px">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col rounded-md p-3 h-[35vh] bg-white overflow-y-auto  ">
                <PickslipRequestFilterForm
                  pickSlip={pickSlips && pickSlips[0]}
                  onpickSlipSearchValues={function (values: any): void {
                    console.log('PickslipRequestFilterForm values:', values);
                    setpickSlipSearchValues(values);
                    if (!pickSlips || pickSlips.length === 0) {
                      setRowDataForSecondContainer([]);
                      setCurrentPickSlipItem(null);
                    }
                  }}
                  initialValues={{ pickSlipNumberNew: pickSlipNumber }}
                />
              </div>
              <Space>
                <Button
                  disabled={
                    !pickSlips ||
                    (pickSlips && pickSlips[0]?.state == 'closed') ||
                    (pickSlips && pickSlips[0]?.state == 'complete') ||
                    (pickSlips && pickSlips[0]?.state == 'progress') ||
                    (pickSlips && pickSlips[0]?.state == 'canceled') ||
                    (pickSlips && pickSlips[0]?.state == 'partlyCanceled')
                  }
                  onClick={handleCopyTableData}
                  size="small"
                  icon={<SaveOutlined />}
                >
                  {t('COPY TABLE DATA and TAKE')}
                </Button>
                <Button
                  disabled={
                    !pickSlips ||
                    (pickSlips && pickSlips[0]?.state == 'closed') ||
                    (pickSlips && pickSlips[0]?.state == 'complete') ||
                    (pickSlips && pickSlips[0]?.state == 'canceled') ||
                    (pickSlips && pickSlips[0]?.state == 'partlyCanceled')
                  }
                  onClick={handleDeleteSelectedRows}
                  size="small"
                  icon={<DeleteOutlined />}
                  danger
                >
                  {t('DELETE')}
                </Button>
              </Space>
            </div>

            <div className="flex flex-col rounded-md p-3 h-[40vh] bg-white overflow-y-auto  ">
              <UniversalAgGrid
                gridId="partContainer"
                isChekboxColumn={false}
                isVisible={true}
                pagination={false}
                rowSelection="single"
                height={'38vh'}
                columnDefs={columnDefs}
                rowData={transformedPartNumbers}
                onRowSelect={(data: any[]) => {
                  handleRowSelectStoreParts(data[0]);
                  console.log('selectedRowCount:', data);
                }}
                isLoading={isLoading || partsLoadingF}
              />
            </div>
          </Split>
        </div>
        <div className="flex flex-col gap-3 justify-between">
          <UniversalAgGrid
            gridId="bookedPartContainer"
            isChekboxColumn={true}
            isVisible={true}
            pagination={false}
            rowSelection="multiple"
            height={'35vh'}
            columnDefs={columnBookedDefs}
            rowData={rowDataForSecondContainer}
            onRowSelect={handleRowSelect}
            onCellValueChanged={handleCellValueChanged}
            isLoading={isLoading}
            onCheckItems={(selectedIds) => {
              if (selectedIds.length === 0) {
                setCurrentPickSlipItem(null);
                setSelectedRows([]);
              } else {
                // Фильтруем строки, которые были выбраны
                const selectedRowsData = rowDataForSecondContainer.filter(
                  (row) => selectedIds.includes(row.id || row._id)
                );
                setSelectedRows(selectedRowsData);
              }
            }}
          />
          <div className="flex justify-between">
            <Space align="center">
              {/* <Button
                disabled={
                  !pickSlips ||
                  (pickSlips && pickSlips[0]?.state == 'closed') ||
                  (pickSlips && pickSlips[0]?.state == 'complete') ||
                  (pickSlips && pickSlips[0]?.state == 'canceled') ||
                  (pickSlips && pickSlips[0]?.state == 'partlyCanceled')
                }
                icon={<SaveOutlined />}
                onClick={handleSubmitINProgress}
                size="small"
              >
                {t('SAVE')}
              </Button> */}
              {/* <Button
                disabled={
                  !pickSlips ||
                  (pickSlips && pickSlips[0]?.state !== 'progress')
                }
                icon={<CheckCircleOutlined />}
                onClick={handleSubmitComplete}
                size="small"
              >
                {t('COMPLETE')}
              </Button> */}
              <Button
                disabled={
                  !pickSlips ||
                  !['issued', 'progress'].includes(pickSlips[0]?.state) ||
                  issuedData.length === 0 ||
                  issuedData.some(
                    (item) =>
                      item.status === 'inactive' ||
                      item.bookedQty < 0 ||
                      !item.bookedQty ||
                      !item.partNumberIDBooked
                  )
                }
                icon={<SaveOutlined />}
                onClick={handleSaveAndComplete}
                size="small"
              >
                {t('SAVE & COMPLETE')}
              </Button>
              <PickSlipGenerator
                data={{
                  pickSlips: pickSlips && pickSlips[0],
                  pickSlipSearchValues: pickSlipSearchValues,
                  rowDataForSecondContainer: rowDataForSecondContainer,
                }}
                disabled={
                  !pickSlips ||
                  (pickSlips && pickSlips[0]?.bookedItems?.length) ||
                  (pickSlips && pickSlips[0]?.state == 'open')
                }
              />
              <Button
                danger
                disabled={
                  !pickSlips ||
                  !['issued', 'progress', 'complete', 'completed'].includes(
                    pickSlips[0]?.state
                  ) ||
                  !pickSlipSearchValues.storeManID ||
                  !pickSlipSearchValues.userID ||
                  !pickSlipSearchValues.bookingDate ||
                  issuedData.length === 0 ||
                  issuedData.some(
                    (item) =>
                      item.status === 'inactive' ||
                      item.bookedQty === 0 ||
                      !item.bookedQty
                    // !item.partNumberIDBooked
                  )
                }
                onClick={
                  pickSlips && pickSlips[0]?.state == 'complete'
                    ? handleClose
                    : handleFastBook
                }
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
              />
            </Space>
          </div>
        </div>
      </Split>
    </div>
  );
};

export default PickSlipConfirmationNew;
