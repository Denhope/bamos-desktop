//@ts-nocheck
import React, {
  FC,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdatePickSlipBookingsItemMutation } from '@/features/pickSlipAdministration/pickSlipBookingsItemsApi';
import {
  Button,
  Layout,
  Menu,
  Modal,
  notification,
  Space,
  Divider,
} from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { ShoppingCartOutlined } from '@ant-design/icons';
import {
  ProForm,
  ProFormSelect,
  ProFormDatePicker,
  ProFormGroup,
} from '@ant-design/pro-components';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import {
  getItem,
  getStatusColor,
  transformToIPickSlip,
  transformToPickSlipItemBooked,
  ValueEnumType,
} from '@/services/utilites';
import PickSlipAdministrationFilterForm from '@/components/userAdministration/pickSlipAdministration/PickSlipAdministrationFilterForm';
import UniversalAgGrid from '@/components/shared/UniversalAgGrid';
import { useGetPickSlipsQuery } from '@/features/pickSlipAdministration/pickSlipApi';
import { useGetLocationsQuery } from '@/features/storeAdministration/LocationApi';
import { useGetUsersQuery } from '@/features/userAdministration/userApi';
import { USER_ID } from '@/utils/api/http';
import LocationEditor from '@/components/shared/Table/ag-grid/LocationEditor';
import {
  useCancelPickSlipItemsMutation,
  useGetPickSlipItemsQuery,
} from '@/features/pickSlipAdministration/pickSlipItemsApi';
import { ColDef } from 'ag-grid-community';
import ReturnSlipGenerator from '@/components/shared/ReturnSlipGenerator';
import ReportPrintLabel from '@/components/shared/ReportPrintLabel';

interface PickSlipCancelProps {
  onFinishCancel: (updatedItems: any[]) => void;
}

// Обновляем интерфейс для более строгой типизации
interface SelectedRow {
  id: string;
  bookedQty: number;
  canceledQty: number;
  QTYCANCEL: number;
  LOCATION_TO: string | null;
  PART_NUMBER_BOOKED: string;
  storeID: {
    _id: string;
  };
  storeItemID: string;
  projectTaskWO?: string;
  projectWO?: string;
  requirementID?: {
    neededOnID?: string;
  };
  projectID?: {
    _id?: string;
    WOReferenceID?: string;
  };
  projectTaskID?: {
    _id?: string;
  };
  state: string;
}

const PickSlipCancel: FC<PickSlipCancelProps> = ({ onFinishCancel }) => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [selectPickSlip, onSelectPickSlip] = useState<any>();
  const [selectPickSlipItem, onSelectPickSlipItem] = useState<any>();
  const [pickSlipSearchValues, setPickSlipSearchValues] = useState<any>();
  const [openPickCancel, setOpenPickCancel] = useState(false);
  const [issuedData, setIssuedRowData] = useState<any[]>([]);
  const [form] = ProForm.useForm();
  const dispatch = useAppDispatch();
  const gridApiRef = useRef<any>(null);

  const { data: users } = useGetUsersQuery({});
  const usersCodesValueEnum =
    users?.reduce((acc, user) => {
      acc[user.id] = `${
        user?.singNumber
      }-${user.firstNameEnglish?.toUpperCase()} ${user.lastNameEnglish?.toUpperCase()}`;
      return acc;
    }, {} as Record<string, string>) || {};

  const {
    data: pickSlips,
    isLoading: isLoadingPickSlips,
    isFetching,
    refetch,
  } = useGetPickSlipsQuery(pickSlipSearchValues || {}, {
    skip: !pickSlipSearchValues,
  });

  const { data: pickSlipItems, refetch: refetchItems } =
    useGetPickSlipItemsQuery(
      { pickSlipID: selectPickSlip?.id },
      { skip: !selectPickSlip }
    );

  const [updatePickSlipItem] = useUpdatePickSlipBookingsItemMutation();

  const { data: locations } = useGetLocationsQuery(
    { storeID: selectPickSlipItem?.storeID?._id },
    { skip: !selectPickSlipItem?.storeID?._id }
  );

  const transformedPickSlips = useMemo(
    () => pickSlipSearchValues && transformToIPickSlip(pickSlips || []),
    [pickSlipSearchValues, pickSlips]
  );

  const transformedBooked = useMemo(
    () =>
      selectPickSlip?.id && transformToPickSlipItemBooked(pickSlipItems || []),
    [selectPickSlip?.id, pickSlipItems]
  );

  useEffect(() => {
    if (transformedBooked?.length > 0) {
      setIssuedRowData(transformedBooked);
    }
  }, [transformedBooked]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const columnpickSlips = [
    {
      field: 'pickSlipNumberNew',
      headerName: t('PICKSLIP No'),
      cellDataType: 'number',
    },
    {
      field: 'status',
      headerName: t('Status'),
      cellDataType: 'text',
      width: 130,
      filter: true,
      valueGetter: (params: { data: { status: keyof ValueEnumType } }) =>
        params.data.status,
      valueFormatter: (params: { value: keyof ValueEnumType }) => {
        const status = params.value;
        return t(status?.toUpperCase()) || '';
      },
      cellStyle: (params: { value: keyof ValueEnumType }) => ({
        backgroundColor: getStatusColor(params.value),
      }),
    },
    {
      field: 'projectTaskWO',
      headerName: t('WO No'),
      cellDataType: 'number',
      width: 130,
    },
    { field: 'projectWO', headerName: t('WP'), cellDataType: 'number' },
    { field: 'WONumber', headerName: t('WO'), cellDataType: 'number' },
    {
      field: 'plannedDate',
      headerName: t('PLANNED DATE'),
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
      field: 'bookingDate',
      headerName: t('BOOKING DATE'),
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
    { field: 'store', headerName: t('GET FROM STORE'), cellDataType: 'text' },
    {
      field: 'neededOnIDTitle',
      headerName: t('NEEDED ON'),
      cellDataType: 'text',
    },
    {
      field: 'createDate',
      headerName: t('CREATE DATE'),
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
  ];

  const isItemCancellable = (row: any) => {
    const isCanceled = row.state === 'canceled';
    const isFullyCanceled = row.bookedQty === (row.canceledQty || 0);
    return !isCanceled && !isFullyCanceled;
  };

  const columnBookedDefs: ColDef[] = [
    {
      headerName: t('LABEL'),
      field: 'LOCAL_ID',
      editable: false,
      cellDataType: 'text',
    },
    {
      headerName: t('PART No'),
      field: 'PART_NUMBER_BOOKED',
      editable: false,
      cellDataType: 'text',
    },
    {
      field: 'DESCRIPTION',
      headerName: t('DESCRIPTION'),
      cellDataType: 'text',
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      headerName: t('UNIT OF MEASURE'),
      cellDataType: 'text',
    },
    {
      field: 'SUPPLIER_BATCH_NUMBER',
      headerName: t('BATCH NUMBER'),
      cellDataType: 'text',
    },
    {
      field: 'SERIAL_NUMBER',
      headerName: t('SERIAL NUMBER'),
      cellDataType: 'text',
    },
    {
      field: 'PRODUCT_EXPIRATION_DATE',
      headerName: t('EXPIRY DATE'),
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
    { field: 'STORE', headerName: t('STORE'), cellDataType: 'text' },
    { field: 'LOCATION', headerName: t('LOCATION'), cellDataType: 'text' },
    { field: 'bookedQty', headerName: t('BOOKED QTY'), cellDataType: 'number' },
    {
      field: 'canceledQty',
      headerName: t('CANCELLED QTY'),
      cellDataType: 'number',
    },
    {
      field: 'QTYCANCEL',
      headerName: t('TO CANCEL QTY'),
      cellDataType: 'number',
      editable: (params: any) => isItemCancellable(params.data),
      valueSetter: (params: any) => {
        if (!isItemCancellable(params.data)) return false;

        const newValue = Number(params.newValue);
        const remainingQty =
          params.data.bookedQty - (params.data.canceledQty || 0);

        // Если значение больше доступного количества
        if (newValue > remainingQty) {
          notification.warning({
            message: t('WARNING'),
            description: t(
              'Value automatically adjusted to maximum available quantity: {{remaining}}',
              {
                remaining: remainingQty,
              }
            ),
          });
          params.data.QTYCANCEL = remainingQty;
          return true;
        }

        // Если значение меньше или равно 0
        if (newValue <= 0) {
          notification.warning({
            message: t('WARNING'),
            description: t(
              'Value automatically adjusted to minimum quantity: 1'
            ),
          });
          params.data.QTYCANCEL = 1;
          return true;
        }

        params.data.QTYCANCEL = newValue;
        return true;
      },
      cellStyle: (params: any) => ({
        backgroundColor: !isRowValid(params.data) ? '#ffcccc' : undefined,
        opacity: isItemCancellable(params.data) ? 1 : 0.5,
        cursor: isItemCancellable(params.data) ? 'default' : 'not-allowed',
      }),
    },
    {
      field: 'LOCATION_TO',
      editable: (params: any) => isItemCancellable(params.data),
      headerName: t('LOCATION TO'),
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: locations?.map((loc) => loc.id) || [],
        cellRenderer: (params: any) => {
          const location = locations?.find((loc) => loc.id === params.value);
          return location ? location.locationName : '';
        },
      },
      valueFormatter: (params: any) => {
        const location = locations?.find((loc) => loc.id === params.value);
        return location ? location.locationName : '';
      },
      cellStyle: (params: any) => ({
        backgroundColor:
          params.value === undefined || params.value === null
            ? '#ffcccc'
            : undefined,
        opacity: isItemCancellable(params.data) ? 1 : 0.5,
        cursor: isItemCancellable(params.data) ? 'default' : 'not-allowed',
      }),
    },
    {
      field: 'state',
      headerName: t('STATUS'),
      cellDataType: 'text',
      editable: false,
      valueFormatter: (params: any) => {
        return params.value ? t(params.value.toUpperCase()) : '';
      },
      cellStyle: (params: any) => ({
        color:
          params.value === 'canceled'
            ? 'red'
            : params.value === 'partlyCanceled'
            ? 'orange'
            : 'inherit',
      }),
    },
  ];

  const isRowValid = useCallback((row: any): boolean => {
    if (!row) return false;

    const hasValidData = Boolean(
      row.id && typeof row.bookedQty === 'number' && row.bookedQty > 0
    );

    const hasValidCancelData = Boolean(
      typeof row.QTYCANCEL === 'number' && row.QTYCANCEL > 0 && row.LOCATION_TO
    );

    const remainingQty = row.bookedQty - (row.canceledQty || 0);
    const isValidQuantity = row.QTYCANCEL <= remainingQty;

    return hasValidData && hasValidCancelData && isValidQuantity;
  }, []);

  const [selectedRows, setSelectedRows] = useState<SelectedRow[]>([]);

  const handleSubmitCancel = () => {
    const invalidRows = selectedRows.filter((row) => !isRowValid(row));

    if (invalidRows.length > 0) {
      notification.error({
        message: t('ERROR'),
        description: t(
          'Please fill in QTY CANCEL and LOCATION TO for all selected items'
        ),
      });
      return;
    }

    setOpenPickCancel(true);
  };
  const [cancelPickSlipItems, { isLoading: isCancelling }] =
    useCancelPickSlipItemsMutation();

  const getReturnSlipData = useCallback(() => {
    if (!selectPickSlip || !pickSlipItems) return null;

    // Фильтруем отмененные позиции
    const cancelledItems = pickSlipItems.filter(
      (item) => item.state === 'canceled' || item.state === 'partlyCanceled'
    );

    if (cancelledItems.length === 0) return null;

    // Получаем данные из bookedItems
    const bookedItemsData = cancelledItems.map((item) => {
      const bookedItem = item.bookedItems?.[0] || {};
      const storeItem = bookedItem.storeItemID || {};
      console.log('bookedItem, storeItem', bookedItem, storeItem);
      return {
        PART_NUMBER_BOOKED: storeItem.PART_NUMBER || '',
        DESCRIPTION: storeItem.NAME_OF_MATERIAL || '',
        QTYCANCEL: bookedItem.canceledQty || 0,
        LOCATION: storeItem?.locationID?.locationName || 'RESERVATION',
        LOCATION_TO: storeItem?.locationID?.locationName || 'RESERVATION',
      };
    });

    console.log(selectPickSlip);
    return {
      pickSlips: {
        pickSlipNumberNew: selectPickSlip.pickSlipNumberNew,
        WONumber: selectPickSlip.projectID?.WOReferenceID?.WONumber,
        projectWO: selectPickSlip.projectID?.projectName,
        planeId: selectPickSlip.projectID?.WOReferenceID?.planeId?.regNbr,
        taskWO: selectPickSlip.projectTaskID?.taskWO,
        taskNumber: selectPickSlip.projectTaskID?.taskNumber,
        taskType: selectPickSlip.projectTaskID?.projectItemType,
        store: selectPickSlip?.store || '',
      },
      cancelledItems: bookedItemsData,
      storeMan: cancelledItems[0]?.storeMan?.firstName
        ? `${cancelledItems[0].storeMan.firstName} ${cancelledItems[0].storeMan.lastName}`
        : '',
      mechanic: cancelledItems[0]?.updateUser?.firstName
        ? `${cancelledItems[0].updateUser.firstName} ${cancelledItems[0].updateUser.lastName}`
        : '',
      cancelDate: cancelledItems[0]?.updateDate
        ? new Date(cancelledItems[0].updateDate).toLocaleDateString('ru-RU')
        : '',
    };
  }, [selectPickSlip, pickSlipItems, locations]);

  const onFinish = async (values: any) => {
    if (!values.storeManID || !values.userID || !values.bookingDate) {
      notification.error({
        message: t('ERROR'),
        description: t('Please fill in all required fields in the form.'),
      });
      return;
    }

    const updatedItems = selectedRows.map((item) => {
      const remainingQty = item.bookedQty - (item.canceledQty || 0);
      const status =
        remainingQty === item.QTYCANCEL ? 'canceled' : 'partlyCanceled';

      return {
        id: item.id,
        isCancel: true,
        state: status,
        storeItemID: item.storeItemID,
        QTYCANCEL: item.QTYCANCEL,
        projectTaskWO: item.projectTaskWO || '',
        projectWO: item.projectWO || '',
        neededOnID: item.requirementID?.neededOnID || '',
        WOReferenceID: item.projectID?.WOReferenceID || '',
        projectID: item.projectID?._id || '',
        projectTaskID: item.projectTaskID?._id || '',
        storeID: item.storeID._id,
        storeManID: values.storeManID,
        userID: USER_ID || '',
        bookingDate: values.bookingDate,
        locationID: item.LOCATION_TO || '',
        updateUserID: USER_ID || '',
      };
    });

    try {
      await cancelPickSlipItems({
        pickSlipID: selectPickSlip.id,
        items: updatedItems,
        storeManID: values.storeManID,
        userID: USER_ID || '',
        bookingDate: values.bookingDate,
      }).unwrap();

      setOpenPickCancel(false);
      setSelectedRows([]);
      notification.success({
        message: t('CANCEL PICKSLIP'),
        description: t('PICKSLIP ITEMS CANCELLED SUCCESSFULLY'),
      });
      refetchItems();
      refetch();
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Error cancelling pick slip items.'),
      });
    }
  };

  useEffect(() => {
    if (gridApiRef.current && issuedData.length > 0) {
      // Начать редактирование первой ячейки в первой строке
      gridApiRef.current.api.startEditingCell({
        rowIndex: 0,
        colKey: 'QTYCANCEL',
      });
    }
  }, [issuedData]);

  useEffect(() => {
    if (selectedRows.length > 0) {
      console.log('Selected Rows State:', {
        count: selectedRows.length,
        rows: selectedRows.map((row) => ({
          id: row.id,
          partNumber: row.PART_NUMBER_BOOKED,
          bookedQty: row.bookedQty,
          canceledQty: row.canceledQty,
          qtyCancel: row.QTYCANCEL,
          locationTo: row.LOCATION_TO,
          isValid: isRowValid(row),
          validationDetails: {
            hasRequiredFields:
              row.id != null && typeof row.bookedQty === 'number',
            hasCancelFields:
              typeof row.QTYCANCEL === 'number' && row.LOCATION_TO != null,
            remainingQty: row.bookedQty - (row.canceledQty || 0),
          },
        })),
      });
    }
  }, [selectedRows]);

  // Добавим функцию для подготовки данных для печати тегов
  const getPrintLabelData = useCallback(() => {
    if (!pickSlipItems) return [];

    return pickSlipItems
      .filter(
        (item) => item.state === 'canceled' || item.state === 'partlyCanceled'
      )
      .map((item) => {
        const bookedItem = item.bookedItems?.[0] || {};
        const storeItem = bookedItem.storeItemID || {};

        // Убедимся, что все значения - строки и не undefined
        const safeString = (value: any): string => String(value || '');

        return {
          id: safeString(item.id),
          PART_NUMBER: safeString(storeItem.PART_NUMBER),
          DESCRIPTION: safeString(storeItem.NAME_OF_MATERIAL),
          SERIAL_NUMBER: safeString(storeItem.SERIAL_NUMBER),
          BATCH_NUMBER: safeString(storeItem.SUPPLIER_BATCH_NUMBER),
          QUANTITY: safeString(item.canceledQty),
          LOCATION: safeString(item.locationID?.locationName || 'RESERVATION'),
          UNIT_OF_MEASURE: safeString(storeItem.UNIT_OF_MEASURE),
          LOCAL_ID: safeString(storeItem.LOCAL_ID),
          STORE: safeString(storeItem.STOCK || 'MSQ'),
          SHELF_NUMBER: safeString(storeItem.SHELF_NUMBER),
          GROUP: safeString(storeItem.GROUP),
          ORDER_NUMBER: safeString(storeItem.ORDER_NUMBER),
          OWNER: safeString(storeItem.OWNER),
          OWNER_LONG_NAME: safeString(storeItem.OWNER_LONG_NAME),
          OWNER_SHORT_NAME: safeString(storeItem.OWNER_SHORT_NAME),
          PRICE: safeString(storeItem.PRICE),
          PRODUCT_EXPIRATION_DATE: safeString(
            storeItem.PRODUCT_EXPIRATION_DATE
          ),
          SUPPLIER_SHORT_NAME: safeString(storeItem.SUPPLIER_SHORT_NAME),
          SUPPLIES_CODE: safeString(storeItem.SUPPLIES_CODE),
          SUPPLIES_LOCATION: safeString(storeItem.SUPPLIES_LOCATION),
          TYPE: safeString(storeItem.TYPE),
          // Добавляем дополнительные поля, которые могут быть нужны
          LOCATION_TO: safeString(
            item.locationID?.locationName || 'RESERVATION'
          ),
          STOCK: safeString(storeItem.STOCK || 'MSQ'),
          SUPPLIER_BATCH: safeString(storeItem.SUPPLIER_BATCH_NUMBER),
        };
      });
  }, [pickSlipItems]);

  return (
    <Layout>
      <Sider
        className="h-[85vh] overflow-hidden"
        theme="light"
        width={350}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
      >
        <Menu
          theme="light"
          className="h-max"
          mode="inline"
          items={[
            getItem(
              <>{t('CANCEL PICKSLIP')}</>,
              'sub1',
              <ShoppingCartOutlined />
            ),
          ]}
        />
        <div className="mx-auto px-5">
          {!collapsed && (
            <PickSlipAdministrationFilterForm
              onpickSlipSearchValues={setPickSlipSearchValues}
            />
          )}
        </div>
      </Sider>
      <Content className="pl-4">
        <div className="h-[82vh] overflow-hidden flex flex-col">
          <div className="h-[55%]">
            <UniversalAgGrid
              gridId="pickSlipsToCancel"
              isLoading={isLoadingPickSlips || isFetching}
              rowData={transformedPickSlips}
              // isFilesVisiable={true}
              isVisible={true}
              pagination={true}
              isEditable={false}
              height={'44vh'}
              columnDefs={columnpickSlips}
              onRowSelect={(selectedRows) => {
                if (selectedRows.length > 0) {
                  onSelectPickSlip(selectedRows[0]);
                  setSelectedRowId(selectedRows[0]._id || selectedRows[0].id);
                }
              }}
              onUpdateData={() => {}}
            />
          </div>
          <Divider />
          <UniversalAgGrid
            gridId="booked"
            isChekboxColumn={true}
            isVisible={true}
            pagination={false}
            height={'30vh'}
            columnDefs={columnBookedDefs}
            rowData={issuedData}
            isRowValid={isRowValid}
            onCellValueChanged={(params) => {
              // Обновляем состояние выбранных строк при изменении значения ячейки
              setSelectedRows((prevRows) => {
                return prevRows.map((row) => {
                  if (row.id === params.data.id) {
                    return {
                      ...row,
                      QTYCANCEL: Number(params.data.QTYCANCEL) || 0,
                      LOCATION_TO: params.data.LOCATION_TO || null,
                      state: params.data.state,
                    };
                  }
                  return row;
                });
              });
            }}
            onSelectedDataChange={(selectedData) => {
              if (!Array.isArray(selectedData)) {
                console.warn('Selected data is not an array:', selectedData);
                return;
              }

              const transformedRows = selectedData.map((row) => ({
                id: row.id || row._id,
                bookedQty: Number(row.bookedQty) || 0,
                canceledQty: Number(row.canceledQty) || 0,
                QTYCANCEL: Number(row.QTYCANCEL) || 0,
                LOCATION_TO: row.LOCATION_TO || null,
                PART_NUMBER_BOOKED: row.PART_NUMBER_BOOKED || '',
                storeID: row.storeID,
                storeItemID: row.storeItemID,
                projectTaskWO: row.projectTaskWO,
                projectWO: row.projectWO,
                requirementID: row.requirementID,
                projectID: row.projectID,
                projectTaskID: row.projectTaskID,
                state: row.state,
              }));

              setSelectedRows(transformedRows);
            }}
            onRowSelect={(selectedRows) => {
              if (selectedRows.length > 0) {
                onSelectPickSlipItem(selectedRows[0]);
              }
            }}
            onUpdateData={setIssuedRowData}
            isRowSelectable={(rowNode) => isItemCancellable(rowNode.data)}
          />
          <div className="mt-2">
            <Space>
              <Button
                danger
                disabled={
                  !selectPickSlip ||
                  selectPickSlip.status === 'canceled' ||
                  selectedRows.length === 0 ||
                  !selectedRows.some(isRowValid)
                }
                onClick={handleSubmitCancel}
                size="small"
              >
                {t('CANCEL_PICKSLIP')}
              </Button>
              <ReturnSlipGenerator
                data={getReturnSlipData()}
                disabled={!getReturnSlipData()}
              />
              {/* <ReportPrintLabel
                xmlTemplate={''}
                data={getPrintLabelData()}
                ids={''}
                isDisabled={
                  !pickSlipItems ||
                  !pickSlipItems.some(
                    (item) =>
                      item.state === 'canceled' ||
                      item.state === 'partlyCanceled'
                  )
                } */}
              {/* /> */}
            </Space>
          </div>
        </div>
      </Content>

      <Modal
        title=""
        open={openPickCancel}
        width={'60%'}
        onCancel={() => setOpenPickCancel(false)}
        footer={null}
      >
        <ProForm
          layout="horizontal"
          size="small"
          form={form}
          autoComplete="on"
          onFinish={onFinish}
          initialValues={{
            storeManID: USER_ID, // Предзаполняем текущим пользователем
            bookingDate: new Date(), // Предзаполняем текущей датой
          }}
          submitter={{
            render: (props, dom) => (
              <div className="flex justify-end mt-4">
                <Button
                  type="primary"
                  onClick={() => props.form?.submit()}
                  loading={isCancelling}
                >
                  {t('CONFIRM')}
                </Button>
              </div>
            ),
          }}
        >
          <div className="bg-white px-4 py-3 rounded-md border border-gray-200">
            <ProFormGroup size={'small'}>
              <ProFormSelect
                showSearch
                required
                name="storeManID"
                label={t('STOREMAN')}
                width="md"
                valueEnum={usersCodesValueEnum}
                placeholder={t('Select storeman')}
                rules={[
                  { required: true, message: t('Please select storeman') },
                ]}
                fieldProps={{
                  optionItemRender(item) {
                    return `${item.label}`;
                  },
                }}
                initialValue={USER_ID} // Дублируем здесь для надежности
              />
              <ProFormSelect
                showSearch
                required
                name="userID"
                label={t('MECH')}
                width="md"
                valueEnum={usersCodesValueEnum}
                placeholder={t('Select mechanic')}
                rules={[
                  { required: true, message: t('Please select mechanic') },
                ]}
                fieldProps={{
                  optionItemRender(item) {
                    return `${item.label}`;
                  },
                }}
              />
            </ProFormGroup>
            <ProFormGroup>
              <ProFormDatePicker
                width="md"
                required
                name="bookingDate"
                label={t('DATE')}
                placeholder={t('Select date')}
                rules={[{ required: true, message: t('Please select date') }]}
                initialValue={new Date()} // Дублируем здесь для надежности
              />
            </ProFormGroup>
          </div>
        </ProForm>
      </Modal>
    </Layout>
  );
};

export default PickSlipCancel;