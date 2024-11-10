// //@ts-nocheck
// import React, { FC, useEffect, useMemo, useState, useRef } from 'react';
// import { useTranslation } from 'react-i18next';
// import { useUpdatePickSlipBookingsItemMutation } from '@/features/pickSlipAdministration/pickSlipBookingsItemsApi';
// import {
//   Button,
//   Layout,
//   Menu,
//   Modal,
//   notification,
//   Space,
//   Divider,
// } from 'antd';
// import { Content } from 'antd/es/layout/layout';
// import Sider from 'antd/es/layout/Sider';
// import { ShoppingCartOutlined } from '@ant-design/icons';
// import {
//   ProForm,
//   ProFormSelect,
//   ProFormDatePicker,
// } from '@ant-design/pro-components';
// import { useAppDispatch } from '@/hooks/useTypedSelector';
// import {
//   getItem,
//   getStatusColor,
//   transformToIPickSlip,
//   transformToPickSlipItemBooked,
//   ValueEnumType,
// } from '@/services/utilites';
// import PickSlipAdministrationFilterForm from '@/components/userAdministration/pickSlipAdministration/PickSlipAdministrationFilterForm';
// import UniversalAgGrid from '@/components/shared/UniversalAgGrid';
// import { useGetPickSlipsQuery } from '@/features/pickSlipAdministration/pickSlipApi';
// import { useGetLocationsQuery } from '@/features/storeAdministration/LocationApi';
// import { useGetUsersQuery } from '@/features/userAdministration/userApi';
// import { USER_ID } from '@/utils/api/http';
// import LocationEditor from '@/components/shared/Table/ag-grid/LocationEditor';
// import {
//   useCancelPickSlipItemsMutation,
//   useGetPickSlipItemsQuery,
// } from '@/features/pickSlipAdministration/pickSlipItemsApi';
// import { ColDef } from 'ag-grid-community';

// interface PickSlipCancelProps {
//   onFinishCancel: (updatedItems: any[]) => void;
// }

// const PickSlipCancel: FC<PickSlipCancelProps> = ({ onFinishCancel }) => {
//   const { t } = useTranslation();
//   const [collapsed, setCollapsed] = useState(false);
//   const [selectPickSlip, onSelectPickSlip] = useState<any>();
//   const [selectPickSlipItem, onSelectPickSlipItem] = useState<any>();
//   const [pickSlipSearchValues, setPickSlipSearchValues] = useState<any>();
//   const [openPickCancel, setOpenPickCancel] = useState(false);
//   const [issuedData, setIssuedRowData] = useState<any[]>([]);
//   const [form] = ProForm.useForm();
//   const dispatch = useAppDispatch();
//   const gridApiRef = useRef<any>(null);
//   const [selectedBookedItem, setSelectedBookedItem] = useState<any>(null);

//   const { data: users } = useGetUsersQuery({});
//   const usersCodesValueEnum: Record<string, string> =
//     users?.reduce((acc, user) => {
//       acc[
//         user.id
//       ] = `${user.firstName?.toUpperCase()} ${user.lastName?.toUpperCase()}`;
//       return acc;
//     }, {} as Record<string, string>) || {};

//   const {
//     data: pickSlips,
//     isLoading: isLoadingPickSlips,
//     isFetching,
//     refetch,
//   } = useGetPickSlipsQuery(pickSlipSearchValues || {}, {
//     skip: !pickSlipSearchValues,
//   });

//   const { data: pickSlipItems, refetch: refetchItems } =
//     useGetPickSlipItemsQuery(
//       { pickSlipID: selectPickSlip?.id },
//       { skip: !selectPickSlip }
//     );

//   const [updatePickSlipItem] = useUpdatePickSlipBookingsItemMutation();

//   const { data: locations } = useGetLocationsQuery(
//     { storeID: selectPickSlipItem?.storeID?._id },
//     { skip: !selectPickSlipItem?.storeID?._id }
//   );

//   const transformedPickSlips = useMemo(
//     () => pickSlipSearchValues && transformToIPickSlip(pickSlips || []),
//     [pickSlipSearchValues, pickSlips]
//   );

//   const transformedBooked = useMemo(
//     () =>
//       selectPickSlip?.id && transformToPickSlipItemBooked(pickSlipItems || []),
//     [selectPickSlip?.id, pickSlipItems]
//   );

//   useEffect(() => {
//     if (transformedBooked?.length > 0) {
//       setIssuedRowData(transformedBooked);
//     }
//   }, [transformedBooked]);
//   const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

//   const getAvailableQty = (row: any) => {
//     return row.bookedQty - (row.canceledQty || 0);
//   };

//   const validateCancelQty = (row: any, cancelQty: number) => {
//     const availableQty = getAvailableQty(row);
//     if (cancelQty <= 0) {
//       notification.error({
//         message: t('ERROR'),
//         description: t('Cancel quantity must be greater than 0'),
//       });
//       return false;
//     }
//     if (cancelQty > availableQty) {
//       notification.error({
//         message: t('ERROR'),
//         description: t(`Maximum cancel quantity is ${availableQty}`),
//       });
//       return false;
//     }
//     return true;
//   };

//   const columnpickSlips = [
//     {
//       field: 'pickSlipNumberNew',
//       headerName: t('PICKSLIP No'),
//       cellDataType: 'number',
//     },
//     {
//       field: 'status',
//       headerName: t('Status'),
//       cellDataType: 'text',
//       width: 130,
//       filter: true,
//       valueGetter: (params: { data: { status: keyof ValueEnumType } }) =>
//         params.data.status,
//       valueFormatter: (params: { value: keyof ValueEnumType }) => {
//         const status = params.value;
//         return t(status?.toUpperCase()) || '';
//       },
//       cellStyle: (params: { value: keyof ValueEnumType }) => ({
//         backgroundColor: getStatusColor(params.value),
//       }),
//     },
//     {
//       field: 'projectTaskWO',
//       headerName: t('WO No'),
//       cellDataType: 'number',
//       width: 130,
//     },
//     { field: 'projectWO', headerName: t('WP'), cellDataType: 'number' },
//     { field: 'WONumber', headerName: t('WO'), cellDataType: 'number' },
//     {
//       field: 'plannedDate',
//       headerName: t('PLANNED DATE'),
//       cellDataType: 'date',
//       valueFormatter: (params: any) => {
//         if (!params.value) return '';
//         const date = new Date(params.value);
//         return date.toLocaleDateString('ru-RU', {
//           year: 'numeric',
//           month: '2-digit',
//           day: '2-digit',
//         });
//       },
//     },
//     {
//       field: 'bookingDate',
//       headerName: t('BOOKING DATE'),
//       cellDataType: 'date',
//       valueFormatter: (params: any) => {
//         if (!params.value) return '';
//         const date = new Date(params.value);
//         return date.toLocaleDateString('ru-RU', {
//           year: 'numeric',
//           month: '2-digit',
//           day: '2-digit',
//         });
//       },
//     },
//     { field: 'store', headerName: t('GET FROM STORE'), cellDataType: 'text' },
//     {
//       field: 'neededOnIDTitle',
//       headerName: t('NEEDED ON'),
//       cellDataType: 'text',
//     },
//     {
//       field: 'createDate',
//       headerName: t('CREATE DATE'),
//       cellDataType: 'date',
//       valueFormatter: (params: any) => {
//         if (!params.value) return '';
//         const date = new Date(params.value);
//         return date.toLocaleDateString('ru-RU', {
//           year: 'numeric',
//           month: '2-digit',
//           day: '2-digit',
//         });
//       },
//     },
//   ];

//   const columnBookedDefs: ColDef[] = [
//     {
//       headerName: t('LABEL'),
//       field: 'LOCAL_ID',
//       editable: false,
//       cellDataType: 'text',
//     },
//     {
//       headerName: t('PART No'),
//       field: 'PART_NUMBER_BOOKED',
//       editable: false,
//       cellDataType: 'text',
//     },
//     {
//       field: 'DESCRIPTION',
//       headerName: t('DESCRIPTION'),
//       cellDataType: 'text',
//     },
//     {
//       field: 'UNIT_OF_MEASURE',
//       editable: false,
//       headerName: t('UNIT OF MEASURE'),
//       cellDataType: 'text',
//     },
//     {
//       field: 'SUPPLIER_BATCH_NUMBER',
//       headerName: t('BATCH NUMBER'),
//       cellDataType: 'text',
//     },
//     {
//       field: 'SERIAL_NUMBER',
//       headerName: t('SERIAL NUMBER'),
//       cellDataType: 'text',
//     },
//     {
//       field: 'PRODUCT_EXPIRATION_DATE',
//       headerName: t('EXPIRY DATE'),
//       cellDataType: 'date',
//       valueFormatter: (params: any) => {
//         if (!params.value) return '';
//         const date = new Date(params.value);
//         return date.toLocaleDateString('ru-RU', {
//           year: 'numeric',
//           month: '2-digit',
//           day: '2-digit',
//         });
//       },
//     },
//     { field: 'STORE', headerName: t('STORE'), cellDataType: 'text' },
//     { field: 'LOCATION', headerName: t('LOCATION'), cellDataType: 'text' },
//     { field: 'bookedQty', headerName: t('BOOKED QTY'), cellDataType: 'number' },
//     {
//       field: 'canceledQty',
//       headerName: t('CANCELLED QTY'),
//       cellDataType: 'number',
//     },
//     {
//       field: 'QTYCANCEL',
//       headerName: t('TO CANCEL QTY'),
//       cellDataType: 'number',
//       editable: true,
//       valueParser: (params: any) => {
//         return Number(params.newValue);
//       },
//       cellStyle: (params: any) => {
//         const isInvalid =
//           params.value === undefined ||
//           params.value === null ||
//           params.value <= 0 ||
//           params.value > getAvailableQty(params.data);
//         return {
//           backgroundColor: isInvalid ? '#ffcccc' : undefined,
//         };
//       },
//       cellRenderer: (params: any) => {
//         const availableQty = getAvailableQty(params.data);
//         return {
//           component: 'input',
//           props: {
//             type: 'number',
//             min: 0,
//             max: availableQty,
//             title: `Available quantity: ${availableQty}`,
//             value: params.value || '',
//           },
//         };
//       },
//       valueSetter: (params: any) => {
//         const newValue = Number(params.newValue);
//         const availableQty = getAvailableQty(params.data);

//         if (isNaN(newValue) || newValue <= 0 || newValue > availableQty) {
//           notification.warning({
//             message: t('WARNING'),
//             description: t(`Available quantity to cancel: ${availableQty}`),
//           });
//           return false;
//         }

//         params.data.QTYCANCEL = newValue;
//         return true;
//       },
//     },
//     {
//       field: 'LOCATION_TO',
//       editable: true,
//       headerName: t('LOCATION TO'),
//       cellEditor: 'agSelectCellEditor',
//       cellEditorParams: {
//         values: locations?.map((loc) => loc.id) || [],
//         cellRenderer: (params: any) => {
//           const location = locations?.find((loc) => loc.id === params.value);
//           return location ? location.locationName : '';
//         },
//       },
//       valueFormatter: (params: any) => {
//         const location = locations?.find((loc) => loc.id === params.value);
//         return location ? location.locationName : '';
//       },
//       cellStyle: (params: any) => ({
//         backgroundColor:
//           params.value === undefined || params.value === null
//             ? '#ffcccc'
//             : undefined,
//       }),
//     },
//   ];

//   const isRowValid = (row: any) => {
//     return (
//       row.QTYCANCEL !== undefined && row.QTYCANCEL !== null && row.LOCATION_TO
//     );
//   };

//   const handleSubmitCancel = () => {
//     if (!selectedBookedItem) {
//       notification.error({
//         message: t('ERROR'),
//         description: t('Please select an item to cancel'),
//       });
//       return;
//     }

//     if (!isRowValid(selectedBookedItem)) {
//       notification.error({
//         message: t('ERROR'),
//         description: t('Please fill in QTY CANCEL and LOCATION TO fields'),
//       });
//       return;
//     }

//     if (!validateCancelQty(selectedBookedItem, selectedBookedItem.QTYCANCEL)) {
//       return;
//     }

//     setOpenPickCancel(true);
//   };

//   const [cancelPickSlipItems, { isLoading: isCancelling }] =
//     useCancelPickSlipItemsMutation();

//   const handleCellValueChanged = (params: any) => {
//     if (params.column.colId === 'QTYCANCEL') {
//       const newValue = Number(params.newValue);
//       const availableQty = getAvailableQty(params.data);

//       if (newValue > availableQty) {
//         notification.warning({
//           message: t('WARNING'),
//           description: t(`Maximum cancel quantity is ${availableQty}`),
//         });

//         // Сбрасываем значение до максимально допустимого
//         params.node.setDataValue('QTYCANCEL', availableQty);
//       }
//     }
//   };

//   const onFinish = async (values: any) => {
//     if (!values.storeManID || !values.userID || !values.bookingDate) {
//       notification.error({
//         message: t('ERROR'),
//         description: t('Please fill in all required fields in the form.'),
//       });
//       return;
//     }

//     if (!selectedBookedItem || !isRowValid(selectedBookedItem)) {
//       notification.error({
//         message: t('ERROR'),
//         description: t('Invalid selection or missing required fields'),
//       });
//       return;
//     }

//     const remainingQty = selectedBookedItem.bookedQty - (selectedBookedItem.canceledQty || 0);
//     const status = remainingQty === selectedBookedItem.QTYCANCEL ? 'canceled' : 'partlyCanceled';

//     const updatedItem = {
//       isCancel: true,
//       state: status,
//       storeItemID: selectedBookedItem.storeItemID,
//       QTYCANCEL: selectedBookedItem.QTYCANCEL,
//       projectTaskWO: selectedBookedItem.projectTaskWO,
//       projectWO: selectedBookedItem.projectWO,
//       neededOnID: selectedBookedItem?.requirementID?.neededOnID,
//       WOReferenceID: selectedBookedItem?.projectID?.WOReferenceID,
//       projectID: selectedBookedItem?.projectID?._id,
//       projectTaskID: selectedBookedItem?.projectTaskID?._id,
//       storeID: selectedBookedItem.storeID._id,
//       storeManID: values.storeManID,
//       userID: USER_ID,
//       bookingDate: values.bookingDate,
//       locationID: selectedBookedItem.LOCATION_TO,
//       id: selectedBookedItem.id,
//       updateUserID: USER_ID,
//     };

//     try {
//       await cancelPickSlipItems({
//         pickSlipID: selectPickSlip.id,
//         items: [updatedItem],
//         storeManID: values.storeManID,
//         userID: USER_ID,
//         bookingDate: values.bookingDate,
//       }).unwrap();

//       setOpenPickCancel(false);
//       notification.success({
//         message: t('CANCEL PICKSLIP'),
//         description: t('ITEM CANCELLED SUCCESSFULLY'),
//       });
//       refetchItems();
//       refetch();
//     } catch (error) {
//       notification.error({
//         message: t('ERROR'),
//         description: t('Error cancelling pick slip item'),
//       });
//     }
//   };

//   useEffect(() => {
//         backgroundColor: getStatusColor(params.value),
//       }),
//     },
//     {
//       field: 'projectTaskWO',
//       headerName: t('WO No'),
//       cellDataType: 'number',
//       width: 130,
//     },
//     { field: 'projectWO', headerName: t('WP'), cellDataType: 'number' },
//     { field: 'WONumber', headerName: t('WO'), cellDataType: 'number' },
//     {
//       field: 'plannedDate',
//       headerName: t('PLANNED DATE'),
//       cellDataType: 'date',
//       valueFormatter: (params: any) => {
//         if (!params.value) return '';
//         const date = new Date(params.value);
//         return date.toLocaleDateString('ru-RU', {
//           year: 'numeric',
//           month: '2-digit',
//           day: '2-digit',
//         });
//       },
//     },
//     {
//       field: 'bookingDate',
//       headerName: t('BOOKING DATE'),
//       cellDataType: 'date',
//       valueFormatter: (params: any) => {
//         if (!params.value) return '';
//         const date = new Date(params.value);
//         return date.toLocaleDateString('ru-RU', {
//           year: 'numeric',
//           month: '2-digit',
//           day: '2-digit',
//         });
//       },
//     },
//     { field: 'store', headerName: t('GET FROM STORE'), cellDataType: 'text' },
//     {
//       field: 'neededOnIDTitle',
//       headerName: t('NEEDED ON'),
//       cellDataType: 'text',
//     },
//     {
//       field: 'createDate',
//       headerName: t('CREATE DATE'),
//       cellDataType: 'date',
//       valueFormatter: (params: any) => {
//         if (!params.value) return '';
//         const date = new Date(params.value);
//         return date.toLocaleDateString('ru-RU', {
//           year: 'numeric',
//           month: '2-digit',
//           day: '2-digit',
//         });
//       },
//     },
//   ];

//   const columnBookedDefs: ColDef[] = [
//     {
//       headerName: t('LABEL'),
//       field: 'LOCAL_ID',
//       editable: false,
//       cellDataType: 'text',
//     },
//     {
//       headerName: t('PART No'),
//       field: 'PART_NUMBER_BOOKED',
//       editable: false,
//       cellDataType: 'text',
//     },
//     {
//       field: 'DESCRIPTION',
//       headerName: t('DESCRIPTION'),
//       cellDataType: 'text',
//     },
//     {
//       field: 'UNIT_OF_MEASURE',
//       editable: false,
//       headerName: t('UNIT OF MEASURE'),
//       cellDataType: 'text',
//     },
//     {
//       field: 'SUPPLIER_BATCH_NUMBER',
//       headerName: t('BATCH NUMBER'),
//       cellDataType: 'text',
//     },
//     {
//       field: 'SERIAL_NUMBER',
//       headerName: t('SERIAL NUMBER'),
//       cellDataType: 'text',
//     },
//     {
//       field: 'PRODUCT_EXPIRATION_DATE',
//       headerName: t('EXPIRY DATE'),
//       cellDataType: 'date',
//       valueFormatter: (params: any) => {
//         if (!params.value) return '';
//         const date = new Date(params.value);
//         return date.toLocaleDateString('ru-RU', {
//           year: 'numeric',
//           month: '2-digit',
//           day: '2-digit',
//         });
//       },
//     },
//     { field: 'STORE', headerName: t('STORE'), cellDataType: 'text' },
//     { field: 'LOCATION', headerName: t('LOCATION'), cellDataType: 'text' },
//     { field: 'bookedQty', headerName: t('BOOKED QTY'), cellDataType: 'number' },
//     {
//       field: 'canceledQty',
//       headerName: t('CANCELLED QTY'),
//       cellDataType: 'number',
//     },
//     {
//       field: 'QTYCANCEL',
//       headerName: t('TO CANCEL QTY'),
//       cellDataType: 'number',
//       editable: true,
//       cellStyle: (params: any) => ({
//         backgroundColor:
//           params.value === undefined || params.value === null
//             ? '#ffcccc'
//             : undefined,
//       }),
//     },
//     {
//       field: 'LOCATION_TO',
//       editable: true,
//       headerName: t('LOCATION TO'),
//       cellEditor: 'agSelectCellEditor',
//       cellEditorParams: {
//         values: locations?.map((loc) => loc.id) || [],
//         cellRenderer: (params: any) => {
//           const location = locations?.find((loc) => loc.id === params.value);
//           return location ? location.locationName : '';
//         },
//       },
//       valueFormatter: (params: any) => {
//         const location = locations?.find((loc) => loc.id === params.value);
//         return location ? location.locationName : '';
//       },
//       cellStyle: (params: any) => ({
//         backgroundColor:
//           params.value === undefined || params.value === null
//             ? '#ffcccc'
//             : undefined,
//       }),
//     },
//   ];

//   const isRowValid = (row: any) => {
//     return (
//       row.QTYCANCEL !== undefined && row.QTYCANCEL !== null && row.LOCATION_TO
//     );
//   };

//   const handleSubmitCancel = () => {
//     if (!selectedBookedItem) {
//       notification.error({
//         message: t('ERROR'),
//         description: t('Please select an item to cancel'),
//       });
//       return;
//     }

//     if (!isRowValid(selectedBookedItem)) {
//       notification.error({
//         message: t('ERROR'),
//         description: t('Please fill in QTY CANCEL and LOCATION TO fields'),
//       });
//       return;
//     }

//     if (!validateCancelQty(selectedBookedItem, selectedBookedItem.QTYCANCEL)) {
//       return;
//     }

//     setOpenPickCancel(true);
//   };

//   const [cancelPickSlipItems, { isLoading: isCancelling }] =
//     useCancelPickSlipItemsMutation();

//   const onFinish = async (values: any) => {
//     if (!values.storeManID || !values.userID || !values.bookingDate) {
//       notification.error({
//         message: t('ERROR'),
//         description: t('Please fill in all required fields in the form.'),
//       });
//       return;
//     }

//     if (!selectedBookedItem || !isRowValid(selectedBookedItem)) {
//       notification.error({
//         message: t('ERROR'),
//         description: t('Invalid selection or missing required fields'),
//       });
//       return;
//     }

//     const remainingQty =
//       selectedBookedItem.bookedQty - (selectedBookedItem.canceledQty || 0);
//     const status =
//       remainingQty === selectedBookedItem.QTYCANCEL
//         ? 'canceled'
//         : 'partlyCanceled';

//     const updatedItem = {
//       isCancel: true,
//       state: status,
//       storeItemID: selectedBookedItem.storeItemID,
//       QTYCANCEL: selectedBookedItem.QTYCANCEL,
//       projectTaskWO: selectedBookedItem.projectTaskWO,
//       projectWO: selectedBookedItem.projectWO,
//       neededOnID: selectedBookedItem?.requirementID?.neededOnID,
//       WOReferenceID: selectedBookedItem?.projectID?.WOReferenceID,
//       projectID: selectedBookedItem?.projectID?._id,
//       projectTaskID: selectedBookedItem?.projectTaskID?._id,
//       storeID: selectedBookedItem.storeID._id,
//       storeManID: values.storeManID,
//       userID: USER_ID,
//       bookingDate: values.bookingDate,
//       locationID: selectedBookedItem.LOCATION_TO,
//       id: selectedBookedItem.id,
//       updateUserID: USER_ID,
//     };

//     try {
//       await cancelPickSlipItems({
//         pickSlipID: selectPickSlip.id,
//         items: [updatedItem],
//         storeManID: values.storeManID,
//         userID: USER_ID,
//         bookingDate: values.bookingDate,
//       }).unwrap();

//       setOpenPickCancel(false);
//       notification.success({
//         message: t('CANCEL PICKSLIP'),
//         description: t('ITEM CANCELLED SUCCESSFULLY'),
//       });
//       refetchItems();
//       refetch();
//     } catch (error) {
//       notification.error({
//         message: t('ERROR'),
//         description: t('Error cancelling pick slip item'),
//       });
//     }
//   };

//   useEffect(() => {
//     if (gridApiRef.current && issuedData.length > 0) {
//       // Начать редактирование первой ячейки в первой строке
//       gridApiRef.current.api.startEditingCell({
//         rowIndex: 0,
//         colKey: 'QTYCANCEL',
//       });
//     }
//   }, [issuedData]);

//   return (
//     <Layout>
//       <Sider
//         className="h-[85vh] overflow-hidden"
//         theme="light"
//         width={350}
//         collapsible
//         collapsed={collapsed}
//         onCollapse={setCollapsed}
//       >
//         <Menu
//           theme="light"
//           className="h-max"
//           mode="inline"
//           items={[
//             getItem(
//               <>{t('CANCEL PICKSLIP')}</>,
//               'sub1',
//               <ShoppingCartOutlined />
//             ),
//           ]}
//         />
//         <div className="mx-auto px-5">
//           {!collapsed && (
//             <PickSlipAdministrationFilterForm
//               onpickSlipSearchValues={setPickSlipSearchValues}
//             />
//           )}
//         </div>
//       </Sider>
//       <Content className="pl-4">
//         <div className="h-[82vh] overflow-hidden flex flex-col">
//           <div className="h-[55%]">
//             <UniversalAgGrid
//               gridId="pickSlipsToCancel"
//               isLoading={isLoadingPickSlips || isFetching}
//               rowData={transformedPickSlips}
//               // isFilesVisiable={true}
//               isVisible={true}
//               pagination={true}
//               isEditable={false}
//               height={'44vh'}
//               columnDefs={columnpickSlips}
//               onRowSelect={(selectedRows) => {
//                 if (selectedRows.length > 0) {
//                   onSelectPickSlip(selectedRows[0]);
//                   setSelectedRowId(selectedRows[0]._id || selectedRows[0].id);
//                 }
//               }}
//               onUpdateData={() => {}}
//             />
//           </div>
//           <Divider />
//           <UniversalAgGrid
//             gridId="booked"
//             isChekboxColumn={false}
//             isVisible={true}
//             pagination={false}
//             isEditable={true}
//             height={'30vh'}
//             columnDefs={columnBookedDefs}
//             rowData={issuedData}
//             onGridReady={(params) => {
//               gridApiRef.current = params;
//             }}
//             onRowSelect={(selectedRows) => {
//               if (selectedRows.length > 0) {
//                 onSelectPickSlipItem(selectedRows[0]);
//                 setSelectedBookedItem(selectedRows[0]);
//               }
//             }}
//             getRowStyle={(params) => ({
//               background:
//                 params.data.id === selectedBookedItem?.id ? '#e6f7ff' : 'white',
//             })}
//             onUpdateData={setIssuedRowData}
//           />
//           <div className="mt-auto">
//             <Space>
//               <Button
//                 disabled={
//                   !selectPickSlip || // Убедитесь, что selectPickSlip действительно выбран
//                   selectPickSlip?.status === 'canceled'
//                   //  || // Убедитесь, что статус не 'canceled'
//                   // issuedData.some((row) => !isRowValid(row)) // Убедитесь, что все строки валидны
//                 }
//                 onClick={handleSubmitCancel}
//                 size="small"
//               >
//                 {t('CANCEL_PICKSLIP')}
//               </Button>
//             </Space>
//           </div>
//         </div>
//       </Content>

//       <Modal
//         title=""
//         open={openPickCancel}
//         width={'60%'}
//         onCancel={() => setOpenPickCancel(false)}
//         footer={null}
//       >
//         <ProForm
//           size={'small'}
//           form={form}
//           autoComplete="on"
//           onFinish={onFinish}
//         >
//           <div className="flex justify-between content-center h-[25vh] justify-items-center gap-2">
//             <div className="border border-solid border-gray-300 p-2 rounded">
//               <h4 className="storeman">{t('STOREMAN')}</h4>
//               <ProFormSelect
//                 showSearch
//                 required
//                 name="storeManID"
//                 label={t('STOREMAN')}
//                 width="lg"
//                 valueEnum={usersCodesValueEnum}
//               />
//             </div>
//             <div className="border border-solid border-gray-300 p-2 rounded">
//               <h4 className="mech">{t('MECH')}</h4>
//               <ProFormSelect
//                 required
//                 showSearch
//                 name="userID"
//                 label={t('MECH')}
//                 width="lg"
//                 valueEnum={usersCodesValueEnum}
//               />
//               <ProFormDatePicker
//                 required
//                 name="bookingDate"
//                 label={t('DATE')}
//               />
//             </div>
//           </div>
//         </ProForm>
//       </Modal>
//     </Layout>
//   );
// };

// export default PickSlipCancel;
