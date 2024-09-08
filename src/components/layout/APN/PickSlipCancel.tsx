// @ts-nocheck
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
  Divider,
  notification,
} from 'antd';
import Sider from 'antd/es/layout/Sider';
import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import BookedPartContainer from '@/components/layout/pickSlipConfirmationNew/BookedPartContainer';
import {
  ValueEnumType,
  getItem,
  getStatusColor,
  transformToIPickSlip,
  transformToPickSlipItemBooked,
} from '@/services/utilites';
import PickSlipFiltered from '@/components/store/pickSlip/PickSlipFiltered';
import { Content } from 'antd/es/layout/layout';
import MaterialOrdersList from '@/components/store/matOrders/MaterialOrders';
import {
  ProCard,
  ProColumns,
  ProForm,
  ProFormDatePicker,
  ProFormSelect,
} from '@ant-design/pro-components';
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
import { setCurrentPickSlip } from '@/store/reducers/PickSlipSlice';
import PickSlipAdministrationFilterForm from '@/components/userAdministration/pickSlipAdministration/PickSlipAdministrationFilterForm';
import { useGetPickSlipsQuery } from '@/features/pickSlipAdministration/pickSlipApi';
import PickSlipContainer from '@/components/userAdministration/pickSlipAdministration/PickSlipContainer';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import { useGetPickSlipItemsQuery } from '@/features/pickSlipAdministration/pickSlipItemsApi';
import AutoCompleteEditor from '@/components/shared/Table/ag-grid/AutoCompleteEditor';
import { useGetLocationsQuery } from '@/features/storeAdministration/LocationApi';
import LocationEditor from '@/components/shared/Table/ag-grid/LocationEditor';
import { useUpdatePickSlipBookingsItemMutation } from '@/features/pickSlipAdministration/pickSlipBookingsItemsApi';
import { useGetUsersQuery } from '@/features/userAdministration/userApi';

const PickSlipCancel: FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();
  const [LOCATION, setLOCATION] = useState([]); //

  type MenuItem = Required<MenuProps>['items'][number];
  const items: MenuItem[] = [
    getItem(<>{t('CANCEL PICKSLIP')}</>, 'sub1', <ShoppingCartOutlined />),
    // ]
    // ),
  ];
  const { RangePicker } = DatePicker;
  const [selectedLocation, setSecectedLocation] = useState<any>(null);
  const [selectedSingleLocation, setSecectedSingleLocation] =
    useState<any>(null);
  const [openLocationViewer, setOpenLocationViewer] = useState<boolean>(false);
  const [selectPickSlip, onSelectPickSlip] = useState<any>();
  const [selectPickSlipItem, onSelectPickSlipItem] = useState<any>();
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
  // useEffect(() => {
  //   if (tableData) {
  //     // Если модальное окно открыто
  //     const currentCompanyID = localStorage.getItem('companyID') || '';
  //     dispatch(
  //       getFilteredShops({
  //         companyID: currentCompanyID,
  //         shopShortName: tableData[0]?.getFrom,
  //       })
  //     ).then((action) => {
  //       if (action.meta.requestStatus === 'fulfilled') {
  //         const transformedData = action.payload[0].locations.map(
  //           (item: any) => ({
  //             ...item,
  //             APNNBR: item.locationName, // Преобразуем shopShortName в APNNBR
  //           })
  //         );

  //         setLOCATION(transformedData);
  //         // Обновляем состояние с преобразованными данными
  //       }
  //     });
  //   }
  // }, [openLocationViewer]);

  const [openPickCancel, setOpenPickCancel] = useState(false);
  // const initialColumns: ProColumns<any>[] = [
  //   {
  //     title: `${t('PN')}`,
  //     dataIndex: 'PART_NUMBER',
  //     key: 'PART_NUMBER',
  //     ellipsis: true,
  //     formItemProps: {
  //       name: 'PART_NUMBER',
  //     },
  //     editable: (text, record, index) => {
  //       return false;
  //     },
  //     width: '10%',

  //     // responsive: ['sm'],
  //   },
  //   {
  //     title: `${t('SN/BN')}`,
  //     dataIndex: 'BATCH_ID',
  //     key: 'BATCH_ID',
  //     ellipsis: true,
  //     formItemProps: {
  //       name: 'BATCH_ID',
  //     },
  //     editable: (text, record, index) => {
  //       return false;
  //     },
  //     render: (text: any, record: any) => {
  //       return <a>{record.foRealese ? record.foRealese.BATCH_ID : text}</a>;
  //     },

  //     // responsive: ['sm'],
  //   },
  //   {
  //     title: `${t('DESCRIPTION')}`,
  //     dataIndex: 'NAME_OF_MATERIAL',
  //     key: 'NAME_OF_MATERIAL',
  //     // responsive: ['sm'],

  //     ellipsis: true, //
  //     width: '10%',
  //     editable: (text, record, index) => {
  //       return false;
  //     },
  //   },
  //   {
  //     title: `${t('STORE')}`,
  //     dataIndex: 'STOCK',
  //     key: 'STOCK',
  //     // responsive: ['sm'],

  //     ellipsis: true, //

  //     editable: (text, record, index) => {
  //       return false;
  //     },
  //   },

  //   {
  //     title: `${t('LOCATION')}`,
  //     dataIndex: 'SHELF_NUMBER',
  //     key: 'SHELF_NUMBER',
  //     ellipsis: true,
  //     editable: (text, record, index) => {
  //       return false;
  //     },
  //     formItemProps: {
  //       name: 'SHELF_NUMBER',
  //     },
  //     width: '8%',
  //     render: (text: any, record: any) => {
  //       return (
  //         <div>{record.foRealese ? record.foRealese.SHELF_NUMBER : text}</div>
  //       );
  //     },
  //   },
  //   {
  //     title: `${t('UNIT')}`,
  //     dataIndex: 'UNIT_OF_MEASURE',
  //     key: 'UNIT_OF_MEASURE',
  //     responsive: ['sm'],
  //     search: false,
  //     editable: (text, record, index) => {
  //       return false;
  //     },
  //     // sorter: (a, b) => a.unit.length - b.unit.length,
  //   },

  //   {
  //     title: `${t('BATCH ID')}`,
  //     dataIndex: 'SUPPLIER_BATCH_NUMBER',
  //     // valueType: 'index',
  //     ellipsis: true,
  //     key: 'SUPPLIER_BATCH_NUMBER',
  //     width: '6%',

  //     editable: (text, record, index) => {
  //       return false;
  //     },
  //     render: (text: any, record: any) => {
  //       return (
  //         <div>
  //           {record?.foRealese ? record?.foRealese.SUPPLIER_BATCH_NUMBER : text}
  //         </div>
  //       );
  //     },
  //     // sorter: (a, b) => (a.id || 0) - (b.id || 0),
  //   },

  //   {
  //     title: `${t('EXPIRES')}`,
  //     dataIndex: 'PRODUCT_EXPIRATION_DATE',
  //     key: 'PRODUCT_EXPIRATION_DATE',
  //     //tooltip: 'ITEM EXPIRY DATE',
  //     ellipsis: true,
  //     width: '6%',
  //     valueType: 'date',
  //     formItemProps: {
  //       name: 'PRODUCT_EXPIRATION_DATE',
  //     },
  //     editable: (text, record, index) => {
  //       return false;
  //     },
  //     render: (text: any, record: any) => {
  //       return (
  //         <div>
  //           {record.foRealese ? record.foRealese.PRODUCT_EXPIRATION_DATE : text}
  //         </div>
  //       );
  //     },

  //     renderFormItem: () => {
  //       return <TimePicker />;
  //     },

  //     // responsive: ['sm'],
  //   },
  //   {
  //     title: `${t('LABEL')}`,
  //     dataIndex: 'LOCAL_ID',
  //     key: 'LOCAL_ID',
  //     // responsive: ['sm'],

  //     ellipsis: true, //
  //     render: (text: any, record: any) => {
  //       return <a>{record.foRealese ? record.foRealese.LOCAL_ID : text}</a>;
  //     },
  //     editable: (text, record, index) => {
  //       return false;
  //     },
  //     // width: '20%',
  //   },
  //   {
  //     title: `${t('BOOKED')}`,
  //     dataIndex: 'QUANTITY_BOOK',
  //     key: 'QUANTITY_BOOK',
  //     ellipsis: true, //
  //     responsive: ['sm'],
  //     search: false,
  //     editable: (text, record, index) => {
  //       return false;
  //     },
  //   },
  //   {
  //     title: `${t('CANCEL')}`,
  //     ellipsis: true, //
  //     dataIndex: 'CANCELED_QUANTITY',
  //     key: 'CANCELED_QUANTITY',
  //     responsive: ['sm'],
  //     search: false,
  //     width: '7%',
  //     editable: (text, record, index) => {
  //       return false;
  //     },
  //     render: (text: any, record: any) => {
  //       return (
  //         <div>{record?.CANCELED_QUANTITY ? record?.CANCELED_QUANTITY : 0}</div>
  //       );
  //     },
  //     // sorter: (a, b) => a.unit.length - b.unit.length,
  //   },
  //   {
  //     title: `${t('CANCEL QTY')}`,
  //     dataIndex: 'QTYCANCEL',
  //     key: 'QTYCANCEL',
  //     responsive: ['sm'],
  //     search: false,
  //     width: '8%',
  //     valueType: 'digit',
  //     render: (text: any, record: any) => {
  //       return <div>{record?.QTYCANCEL ? record?.QTYCANCEL : 0}</div>;
  //     },
  //     editable: (text, record, index) => {
  //       return true;
  //     },
  //     // Добавьте валидацию формы
  //     // formItemProps: {
  //     //   rules: [
  //     //     {
  //     //       validator: async (_, value) => {
  //     //         if (value > record.QUANTITY_BOOK - record.CANCELED_QUANTITY) {
  //     //           throw new Error(
  //     //             'QTYCANCEL cannot be greater than QUANTITY_BOOK - CANCELED_QUANTITY'
  //     //           );
  //     //         }
  //     //       },
  //     //     },
  //     //   ],
  //     //   getValueFromEvent: (e) => {
  //     //     const { value } = e.target;
  //     //     if (value > record.QUANTITY_BOOK - record.CANCELED_QUANTITY) {
  //     //       return record.QUANTITY_BOOK - record.CANCELED_QUANTITY;
  //     //     }
  //     //     return value;
  //     //   },
  //     // },
  //     // sorter: (a, b) => a.unit.length - b.unit.length,
  //   },

  //   {
  //     title: `${t('LOCATION TO')}`,
  //     dataIndex: 'LOCATION_TO',
  //     key: 'LOCATION_TO',
  //     width: '9%',
  //     // ellipsis: true,
  //     // tooltip,
  //     // valueType: 'select',
  //     editable: (text, record, index) => {
  //       return true;
  //     },
  //     filterSearch: true,
  //     // valueEnum: {
  //     //   'MSQ-REQ': { text: 'MSQ-REQ' },
  //     //   'MST-REQ': { text: 'MST-REQ' },
  //     // },

  //     // width: '6%',
  //     // render: (text: any, record: any) => {
  //     //   return <div>{record.LOCATION_TO ? record.LOCATION_TO : text}</div>;
  //     // },
  //     renderFormItem: (item2, { onChange }) => {
  //       return (
  //         <DoubleClickPopover
  //           content={
  //             <div className="flex my-0 mx-auto  h-[50vh] flex-col relative overflow-hidden">
  //               <ProCard
  //                 className="flex mx-auto justify-center align-middle"
  //                 style={{}}
  //               >
  //                 {LOCATION && (
  //                   <SearchTable
  //                     scroll={32}
  //                     data={LOCATION}
  //                     onRowClick={function (record: any, rowIndex?: any): void {
  //                       setSecectedLocation(record);
  //                       setOpenLocationViewer(false);
  //                     }}
  //                     onRowSingleClick={function (
  //                       record: any,
  //                       rowIndex?: any
  //                     ): void {
  //                       setSecectedSingleLocation(record);
  //                     }}
  //                   ></SearchTable>
  //                 )}
  //               </ProCard>
  //             </div>
  //           }
  //           overlayStyle={{ width: '50%' }}
  //         >
  //           <Input value={selectedLocation?.locationName} />
  //         </DoubleClickPopover>
  //       );
  //     },
  //     // responsive: ['sm'],
  //   },

  //   {
  //     title: `${t('Status')}`,
  //     key: 'status',
  //     width: '8%',
  //     valueType: 'select',
  //     filterSearch: true,
  //     filters: true,
  //     ellipsis: true, //
  //     editable: (text, record, index) => {
  //       return false;
  //     },
  //     // onFilter: true,
  //     valueEnum: {
  //       issued: { text: t('ISSUED'), status: 'Processing' },
  //       open: { text: t('NEW'), status: 'Error' },
  //       closed: { text: t('CLOSE'), status: 'Default' },
  //       cancelled: { text: t('CANCEL'), status: 'Error' },
  //       partyCancelled: { text: t('PARTY_CANCELLED'), status: 'Error' },
  //       transfer: { text: t('TRANSFER'), status: 'Processing' },
  //       completed: { text: t('COMPLETED'), status: 'SUCCESS' },
  //     },

  //     dataIndex: 'status',
  //   },

  //   {
  //     title: `${t('OPTION')}`,
  //     valueType: 'option',
  //     key: 'option',
  //     // width: '9%',
  //     render: (text, record, _, action) => {
  //       // Check if the record status is not 'canceled'
  //       if (record.status !== 'cancelled') {
  //         return (
  //           <a
  //             key="editable"
  //             onClick={() => {
  //               action?.startEditable?.(record._id);
  //             }}
  //           >
  //             Edit
  //           </a>
  //         );
  //       }
  //       // If the status is 'canceled', return null or an empty element
  //       return null; // or <span>&nbsp;</span>;
  //     },
  //   },
  // ];
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [issuedData, setIssuedRowData] = useState<any[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [pickSlipSearchValues, setpickSlipSearchValues] = useState<any>();
  const [form] = Form.useForm();
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const { data: users } = useGetUsersQuery({});
  const usersCodesValueEnum: Record<string, string> =
    users?.reduce<Record<string, string>>((acc, mpdCode) => {
      acc[
        mpdCode.id
      ] = `${mpdCode.firstName?.toUpperCase()} ${mpdCode.lastName?.toUpperCase()}`;
      return acc;
    }, {}) || {};
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

  const {
    data: pickSlips,
    isLoading: isLoadingF,
    isFetching,
    refetch,
  } = useGetPickSlipsQuery(
    {
      projectID: pickSlipSearchValues?.projectID || '',
      projectTaskID: pickSlipSearchValues?.projectTaskID || '',
      partNumberID: pickSlipSearchValues?.partNumberID || '',
      startDate: pickSlipSearchValues?.startDate || '',
      endDate: pickSlipSearchValues?.endDate || '',
      status: pickSlipSearchValues?.status || '',
      pickSlipNumberNew: pickSlipSearchValues?.pickSlipNumberNew || '',
      neededOnID: pickSlipSearchValues?.neededOnID || '',
      includeAlternates: true,
      storeFromID: pickSlipSearchValues?.storeFromID || '',
      WOReferenceID: pickSlipSearchValues?.WOReferenceID || '',
    },
    {
      skip: !pickSlipSearchValues,
    }
  );
  const { data: pickSlipItems, refetch: refetchItems } =
    useGetPickSlipItemsQuery(
      { pickSlipID: selectPickSlip?.id },
      { skip: !selectPickSlip }
    );
  // const { data: partNumbers } = useGetPartNumbersQuery({});
  const [updatePickSlipItem] = useUpdatePickSlipBookingsItemMutation({});

  const {
    data: locations,
    isLoading: loading,
    refetch: refetchProjectItems,
  } = useGetLocationsQuery(
    {
      storeID: selectPickSlipItem?.storeID?._id,
    }
    // { skip: !selectPickSlipItem?.storeID?.id }
  );
  const valueEnum: ValueEnumType = {
    onShort: t('ON SHORT'),
    onQuatation: t('QUATATION'),
    open: t('OPEN'),
    closed: t('CLOSE'),
    canceled: t('CANCEL'),
    onOrder: t('ON ORDER'),
    partlyCanceled: t('PARTLY CANCELLED'),
    draft: t('DRAFT'),
    issued: t('ISSUED'),
    complete: t('COMPLETE'),
    progress: t('IN PROGRESS'),
  };
  const columnpickSlips = [
    {
      field: 'pickSlipNumberNew',
      headerName: `${t('PICKSLIP No')}`,
      cellDataType: 'number',
    },
    {
      field: 'status',
      headerName: `${t('Status')}`,
      cellDataType: 'text',
      width: 130,
      filter: true,
      valueGetter: (params: { data: { status: keyof ValueEnumType } }) =>
        params.data.status,
      valueFormatter: (params: { value: keyof ValueEnumType }) => {
        const status = params.value;
        return valueEnum[status] || '';
      },
      cellStyle: (params: { value: keyof ValueEnumType }) => ({
        backgroundColor: getStatusColor(params.value),
        color: '#ffffff', // Text color
      }),
    },
    {
      field: 'projectTaskWO',
      headerName: `${t('WO No')}`,
      cellDataType: 'number',
      width: 130,
    },
    {
      field: 'projectWO',
      headerName: `${t('WP')}`,
      cellDataType: 'number',
    },
    {
      field: 'WONumber',
      headerName: `${t('WO')}`,
      cellDataType: 'number',
    },

    {
      field: 'plannedDate',
      editable: false,
      cellDataType: 'date',
      headerName: `${t('PLANNED DATE')}`,
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
      field: 'bookingDate',
      editable: false,
      cellDataType: 'date',
      headerName: `${t('BOOKING DATE')}`,
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
      field: 'store',
      editable: false,
      cellDataType: 'text',
      headerName: `${t('GET FROM STORE')}`,
    },

    {
      field: 'neededOnIDTitle',
      editable: false,
      cellDataType: 'text',
      headerName: `${t('NEEDED ON')}`,
    },
    {
      field: 'createDate',
      editable: false,
      cellDataType: 'date',
      headerName: `${t('CREATE DATE')}`,
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
    // Добавьте другие колонки по необходимости
  ];
  const transformedBooked = useMemo(() => {
    return (
      selectPickSlip?.id && transformToPickSlipItemBooked(pickSlipItems || [])
    );
  }, [selectPickSlip?.id, pickSlipItems]);
  // const { data: partNumbers, isError } = useGetPartNumbersQuery({});
  const [rowDataForSecondContainer, setRowDataForSecondContainer] = useState<
    any[]
  >([]);
  // console.log(locations);
  useEffect(() => {
    if (transformedBooked && transformedBooked.length > 0) {
      setRowDataForSecondContainer(transformedBooked);
      // onUpdateData(fetchData);
    }
  }, [transformedBooked]);
  const transformedPickSlips = useMemo(() => {
    return pickSlipSearchValues && transformToIPickSlip(pickSlips || []);
  }, [pickSlipSearchValues, pickSlips]);
  const [columnBookedDefs, setColumnBookedDefs] = useState<any[]>([
    {
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER_BOOKED',
      editable: false,

      cellDataType: 'text',
    },

    {
      field: 'DESCRIPTION',
      headerName: `${t('DESCRIPTION')}`,
      cellDataType: 'text',
    },

    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('UNIT OF MEASURE')}`,
      cellDataType: 'text',
    },
    {
      field: 'SUPPLIER_BATCH_NUMBER ID',
      headerName: `${t('BATCH NUMBER')}`,
      cellDataType: 'text',
    },
    {
      field: 'SERIAL_NUMBER',
      headerName: `${t('SERIAL NUMBER')}`,
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
    // {
    //   headerName: `${t('LOCAL_ID')}`,
    //   field: 'LOCAL_ID',
    //   editable: false,
    //   cellDataType: 'text',
    // },
    {
      field: 'bookedQty',
      headerName: `${t('BOOKED QTY')}`,
      cellDataType: 'number',
    },
    {
      field: 'canceledQty',
      headerName: `${t('CANCELLED QTY')}`,
      cellDataType: 'number',
    },
    {
      field: 'QTYCANCEL',
      headerName: `${t('TO CANCEL QTY')}`,
      cellDataType: 'number',
      editable: true,
    },
    // {
    //   field: 'CONDITION',
    //   editable: false,
    //   filter: false,
    //   headerName: `${t('CONDITION')}`,
    //   cellDataType: 'text',
    // },
    {
      field: 'LOCATION_TO',
      editable: true,
      filter: false,
      headerName: `${t('LOCATION TO')}`,
      cellEditor: LocationEditor,
      cellEditorParams: {
        options: locations,
      },
      // cellDataType: 'text',
    },
    // {
    //   field: 'RECEIVING_NUMBER',
    //   editable: false,
    //   filter: false,
    //   headerName: `${t('RECEIVING')}`,
    //   cellDataType: 'text',
    // },
    // {
    //   field: 'RECEIVED_DATE',
    //   editable: false,
    //   filter: false,
    //   headerName: `${t('RECEIVED DATE')}`,
    //   cellDataType: 'date',
    //   valueFormatter: (params: any) => {
    //     if (!params.value) return ''; // Проверка отсутствия значения
    //     const date = new Date(params.value);
    //     return date.toLocaleDateString('ru-RU', {
    //       year: 'numeric',
    //       month: '2-digit',
    //       day: '2-digit',
    //     });
    //   },
    // },
    // {
    //   field: 'DOC_NUMBER',
    //   editable: false,
    //   filter: false,
    //   headerName: `${t('DOC_NUMBER')}`,
    //   cellDataType: 'text',
    // },
    // {
    //   field: 'DOC_TYPE',
    //   editable: false,
    //   filter: false,
    //   headerName: `${t('DOC_TYPE')}`,
    //   cellDataType: 'text',
    // },
    // Добавьте другие колонки по необходимости
  ]);
  const handleSubmitCancel = async () => {
    Modal.confirm({
      title: t('Confirm Cancel'),
      content: t('Are you sure you want to cancel this pick slip?'),
      okText: t('Yes'),
      cancelText: t('No'),
      onOk: async () => {
        console.log('progressParts:', issuedData);
        const targetItem = issuedData.find(
          (item) => item._id === selectPickSlipItem._id
        );

        let hasInvalidData = false;

        if (targetItem) {
          console.log('targetItem:', targetItem);
          if (
            targetItem.QTYCANCEL === undefined ||
            targetItem.QTYCANCEL === null
          ) {
            hasInvalidData = true;
          } else if (
            targetItem.QTYCANCEL &&
            targetItem.bookedQty < targetItem.QTYCANCEL
          ) {
            hasInvalidData = true;
          } else if (
            targetItem.QTYCANCEL &&
            targetItem.bookedQty - (targetItem.canceledQty || 0) <
              targetItem.QTYCANCEL
          ) {
            hasInvalidData = true;
          }
        }
        if (hasInvalidData) {
          notification.error({
            message: t('ERROR'),
            description: t(
              'Invalid data in the table. Please check the QTY CANCEL.'
            ),
          });
          return false;
        }
        setOpenPickCancel(true);
        // try {
        //   await updatePickSlipItem({
        //     pickSlip: {
        //       state: 'closed',
        //       storeManID: pickSlipSearchValues.storeManID,
        //       userID: pickSlipSearchValues.userID,
        //       bookingDate: pickSlipSearchValues.bookingDate,
        //       id:
        //         (pickSlips && pickSlips[0]?._id) ||
        //         (pickSlips && pickSlips[0]?.id),
        //     },
        //   }).unwrap();
        //   try {
        //     for (const item of issuedData) {
        //       const addBookingResponse = await addBooking({
        //         booking: {
        //           voucherModel: 'STORE_TO_A/C',
        //           ...item,
        //           ...item?.storeItemID,
        //           QUANTITY: -item?.QUANTITY,
        //         },
        //       });
        //     }
        //   } catch (error) {
        //     notification.error({
        //       message: t('ERROR'),
        //       description: t('Error update pick slip or pick slip items.'),
        //     });
        //     return false;
        //   }
        //   // pickSlipRefetch();
        //   // refetchItems();
        //   // refetch();
        //   // refetchRequirements().unwrap();

        //   notification.info({
        //     message: t('CLOSE PICKSLIP'),
        //     description: t('PICKSLIP CLOSE'),
        //   });
        // } catch (error) {
        //   notification.error({
        //     message: t('ERROR'),
        //     description: t('Error update pick slip or pick slip items.'),
        //   });
        //   return false;
        // }
      },
    });
  };
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
            {/* <PickSlipFiltered
              canselVoidType={true}
              onFilterPickSlip={() => null}
            ></PickSlipFiltered> */}
            <PickSlipAdministrationFilterForm
              onpickSlipSearchValues={
                (values) => setpickSlipSearchValues(values)
                // console.log(values)
              }
            />
          </div>
        </div>
      </Sider>
      <Content className="pl-4">
        <div className="h-[82vh] overflow-hidden flex flex-col">
          <div className="h-[55%]">
            <PickSlipContainer
              isLoading={isLoadingF || isFetching}
              rowData={transformedPickSlips}
              isFilesVisiable={true}
              isVisible={true}
              pagination={true}
              isEditable={false}
              height={'44vh'}
              isAddVisiable={true}
              isButtonVisiable={false}
              columnDefs={columnpickSlips}
              partNumbers={[]}
              onRowSelect={(rowData: any) => {
                onSelectPickSlip(rowData);
                handleSelectedRowKeysChange([]);
              }}
              onUpdateData={function (data: any[]): void {
                throw new Error('Function not implemented.');
              }}
              // onCheckItems={function (selectedKeys: React.Key[]): void {}}
            />
          </div>

          <Divider></Divider>
          <BookedPartContainer
            isFilesVisiable={true}
            isChekboxColumn={false}
            isVisible={false}
            pagination={false}
            isAddVisiable={true}
            isButtonVisiable={false}
            isEditable={true}
            height={'30vh'}
            columnDefs={columnBookedDefs}
            partNumbers={[]}
            onRowSelect={(data: any[]): void => {
              console.log(data);
              onSelectPickSlipItem(data);
              handleSelectedRowKeysChange(data?.id);
            }}
            onUpdateData={(data: any[]): void => {
              setIssuedRowData(data);
            }}
            fetchData={rowDataForSecondContainer}
          />
          <div className="mt-auto">
            <Space>
              {/* <Button
                disabled={!selectPickSlip}
                onClick={() => setOpenPickReturn(true)}
                size="small"
              >
                {t('PRINT')}
              </Button> */}
              <Button
                disabled={
                  !selectedRowKeys?.length ||
                  selectPickSlip?.status == 'open' ||
                  selectPickSlip?.status == 'issued'
                }
                onClick={() => handleSubmitCancel()}
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

      <Modal
        title=""
        open={openPickCancel}
        width={'60%'}
        onCancel={() => setOpenPickCancel(false)}
        footer={null}
      >
        <ProForm
          size={'small'}
          form={form}
          autoComplete="off"
          onFinish={async (values: any) => {
            const targetItem = issuedData.find(
              (item) => item._id === selectPickSlipItem._id
            );
            let status;
            if (targetItem) {
              const remainingQty =
                targetItem.bookedQty - (targetItem.canceledQty || 0);
              if (
                targetItem.QTYCANCEL &&
                remainingQty === targetItem.QTYCANCEL
              ) {
                status = 'canceled';
              } else if (
                targetItem.QTYCANCEL &&
                remainingQty > targetItem.QTYCANCEL
              ) {
                status = 'partlyCanceled';
              }
            }

            try {
              await updatePickSlipItem({
                pickSlipBokingsItem: {
                  isCancel: true,
                  state: status,
                  storeItemID: targetItem.storeItemID,
                  QTYCANCEL: targetItem.QTYCANCEL,
                  projectTaskWO: targetItem.projectTaskWO,
                  projectWO: targetItem.projectWO,
                  neededOnID: targetItem?.requirementID?.neededOnID,
                  WOReferenceID: targetItem?.projectID?.WOReferenceID,
                  projectID: targetItem?.projectID?._id,
                  projectTaskID: targetItem?.projectTaskID?._id,
                  storeID: targetItem.storeID._id,
                  locationtTo: targetItem.LOCATION_TO,
                  storeManID: values.storeManID,
                  userID: USER_ID,
                  bookingDate: values.bookingDate,
                  id: targetItem.id,
                },
              }).unwrap();
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
              // pickSlipRefetch();
              refetchItems();
              refetch();
              // refetchRequirements().unwrap();

              notification.info({
                message: t('CANCEL PICKSLIP'),
                description: t('PICKSLIP CANCEL'),
              });
            } catch (error) {
              notification.error({
                message: t('ERROR'),
                description: t('Error update pick slip or pick slip items.'),
              });
              return false;
            }
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
                <ProFormSelect
                  showSearch
                  // disabled={pickSlip && pickSlip.state !== 'complete'}
                  name="storeManID"
                  label={t('STOREMAN')}
                  width="lg"
                  valueEnum={usersCodesValueEnum || []}
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

              <ProFormSelect
                showSearch
                // disabled={pickSlip && pickSlip.state !== 'complete'}
                name="userID"
                label={t('MECH')}
                width="lg"
                valueEnum={usersCodesValueEnum || []}
              />
              <ProFormDatePicker name="bookingDate" label={`${t('DATE')}`} />
            </div>
          </div>
        </ProForm>
      </Modal>
    </Layout>
  );
};

export default PickSlipCancel;
