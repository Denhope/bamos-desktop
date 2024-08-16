//@ts-nocheck

import { ProColumns } from '@ant-design/pro-components';
import { DatePicker } from 'antd';
import EditableTable from '@/components/shared/Table/EditableTable';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import PartsTable from '@/components/shared/Table/PartsTable';
import { ValueEnumType, getStatusColor } from '@/services/utilites';
type showOrderListType = {
  order?: any;

  scroll: number;
  onSelectedPart?: (record: any, rowIndex: any) => void;
  onSelectedIds?: (record: any) => void;
  selectedOrder?: any;
  parts?: any[];
};
//
const { RangePicker } = DatePicker;

const BookingOrderPartsList: FC<showOrderListType> = ({
  scroll,
  onSelectedIds,
  onSelectedPart,
  order,
  selectedOrder,
  parts,
}) => {
  const { t } = useTranslation();
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('POSITION')}`,
      dataIndex: 'POSITION',
      key: 'POSITION',
      // tooltip: 'LOCAL_ID',
      ellipsis: true,
      width: '10%',
      render: (text, record, index) => index + 1,
    },

    {
      title: `${t('STATUS')}`,
      dataIndex: 'state',
      key: 'state',
      width: '13%',
      valueType: 'select',
      // filterSearch: true,
      // filters: true,
      editable: (text, record, index) => {
        return false;
      },
      // render: (text: any, record: any) => {
      //   // Определяем цвет фона в зависимости от условия
      //   let backgroundColor;
      //   if (record.state === 'RECEIVED') {
      //     backgroundColor = '#62d156';
      //   } else if (record.state === 'OPEN' || record.state === 'open') {
      //     backgroundColor = 'red';
      //   } else {
      //     backgroundColor = '#f0be37';
      //   }
      //   return (
      //     <div style={{ backgroundColor }}>{record.state && record.state}</div>
      //   );
      // },
      valueEnum: {
        inStockReserve: { text: t('RESERVATION'), status: 'SUCCESS' },
        onQuatation: { text: t('QUATATION'), status: 'Warning' },
        onShort: { text: t('ON SHORT'), status: 'Warning' },
        planned: { text: t('PLANNED'), status: 'Default' },
        open: { text: t('NEW'), status: 'Error' },
        closed: { text: t('CLOSED'), status: 'Success' },
        CANCELLED: { text: t('CANCELLED'), status: 'Default' },
        onOrder: { text: t('ISSUED'), status: 'Processing' },
        draft: { text: t('DRAFT'), status: 'Default' },
        RECEIVED: { text: t('RECEIVED'), status: 'Success' },
        PARTLY_RECEIVED: { text: t('PARTLY_RECEIVED'), status: 'Warning' },
      },
    },
    {
      title: `${t('PN')}`,
      dataIndex: 'PN',
      key: 'PN',
      ellipsis: true,
      formItemProps: {
        name: 'PART_NUMBER',
      },
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => record?.partID?.PART_NUMBER,
      width: '12%',

      // responsive: ['sm'],
    },
    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'nameOfMaterial',
      key: 'nameOfMaterial',
      // responsive: ['sm'],
      tooltip: 'Text Show',
      ellipsis: true, //
      width: '13%',
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => record?.partID?.DESCRIPTION,
    },
    {
      title: `${t('GROUP')}`,
      dataIndex: 'group',
      key: 'group',
      responsive: ['sm'],
      search: false,
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => record?.partID?.GROUP,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('B/SERIAL')}`,
      dataIndex: 'SERIAL_NUMBER',
      width: '9%',
      editable: (text, record, index) => {
        return false;
      },
      key: 'SERIAL_NUMBER',
      render: (text: any, record: any) =>
        record?.SERIAL_NUMBER || record?.SUPPLIER_BATCH_NUMBER,
      // остальные свойства...
    },
    {
      title: `${t('QTY')}`,
      dataIndex: 'amout',
      key: 'amout',
      responsive: ['sm'],
      search: false,
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => record?.amout,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('BACKORDER')}`,
      dataIndex: 'backorderQty',
      key: 'backorbackorderQtyder',
      responsive: ['sm'],
      search: false,
      editable: (text, record, index) => {
        return false;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('UNIT')}`,
      dataIndex: 'unit',
      key: 'unit',
      responsive: ['sm'],
      search: false,
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) =>
        record?.unit || record?.partID?.UNIT_OF_MEASURE,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('PRICE')}`,
      dataIndex: 'PRICE',
      key: 'PRICE',
      responsive: ['sm'],
      search: false,
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => record?.allPrice,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
  ];
  const valueEnum: ValueEnumType = {
    onShort: t('ON SHORT'),
    onQuatation: t('QUATATION'),
    open: t('OPEN'),
    closed: t('CLOSED'),
    canceled: t('CANCELLED'),
    onOrder: t('ISSUED'),
    draft: t('DRAFT'),
    issued: t('ISSUED'),
    progress: t('IN PROGRESS'),
    complete: t('COMPLETE'),
    RECEIVED: t('RECEIVED'),
    PARTLY_RECEIVED: t('PARTLY RECEIVED'),
    transfer: t('TRASFER'),
  };
  const columnOrderItems = [
    // {
    //   field: 'orderNumber',
    //   headerName: `${t('ORDER No')}`,
    //   cellDataType: 'text',
    // },
    // {
    //   field: 'orderType',
    //   headerName: `${t('ORDER TYPE')}`,
    //   cellDataType: 'text',
    // },
    {
      field: 'index',
      headerName: `${t('POS')}`,
      cellDataType: 'text',
      valueFormatter: (params: any) => {
        const index = params?.data.index + 1;
        return index;
      },
      width: 100,
    },
    {
      field: 'state',
      headerName: `${t('Status')}`,
      cellDataType: 'text',
      width: 200,
      filter: true,
      valueGetter: (params: {
        data: {
          state?: any;
          status: keyof ValueEnumType;
        };
      }) => params.data.state,
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
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER',
      editable: false,
      valueFormatter: (params: any) => {
        const PART_NUMBER = params?.data.partID?.PART_NUMBER;
        return PART_NUMBER;
      },
    },
    {
      field: 'DESCRIPTION',
      headerName: `${t('DESCRIPTION')}`,
      cellDataType: 'text',
      valueFormatter: (params: any) => {
        const DESCRIPTION = params?.data.partID?.DESCRIPTION;
        return DESCRIPTION;
      },
    },
    // {
    //   field: 'GROUP',
    //   headerName: `${t('GROUP')}`,
    //   cellDataType: 'text',
    //   valueFormatter: (params: any) => {
    //     const GROUP = params?.data.partID?.GROUP;
    //     return GROUP;
    //   },
    // },
    // {
    //   field: 'TYPE',
    //   headerName: `${t('TYPE')}`,
    //   cellDataType: 'text',
    //   editable: false,
    // },
    {
      field: 'amout',
      editable: false,
      cellDataType: 'number',
      headerName: `${t('QUANTITY')}`,
      width: 100,
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('UNIT OF MEASURE')}`,
      cellDataType: 'text',
      valueFormatter: (params: any) => {
        const UNIT_OF_MEASURE = params?.data.partID?.UNIT_OF_MEASURE;
        return UNIT_OF_MEASURE;
      },
      width: 150,
    },
    {
      field: 'backorderQty',
      editable: false,
      cellDataType: 'number',
      headerName: `${t('BACKORDER')}`,
    },
    // {
    //   field: 'vendorCode',
    //   editable: false,
    //   cellDataType: 'text',
    //   headerName: `${t('VENDOR')}`,
    //   valueFormatter: (params: { value: string }) => {
    //     const vendorCode = params?.value?.toUpperCase();
    //     return vendorCode;
    //   },
    // },
    {
      field: 'allPrice',
      editable: false,
      cellDataType: 'number',
      headerName: `${t('PRICE')}`,
    },
    {
      field: 'currency',
      editable: false,
      cellDataType: 'text',
      headerName: `${t('CURRENCY')}`,
    },

    // {
    //   field: 'createDate',
    //   editable: false,
    //   cellDataType: 'date',
    //   headerName: `${t('CREATE DATE')}`,
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
    //   field: 'files',
    //   headerName: `${t('DOC')}`,
    //   width: 200, // Увеличиваем ширину
    //   editable: false,
    //   cellRenderer: (params) => {
    //     <>
    //       <>{console.log}</>
    //       <FileModalList
    //         files={params.files}
    //         onFileSelect={(file) => {
    //           console.log('Selected file:', file);
    //           handleFileSelect({
    //             id: file?.id,
    //             name: file?.name,
    //           });
    //         }}
    //         onFileOpen={(file) => {
    //           console.log('Opened file:', file);
    //           handleFileOpen(file);
    //         }}
    //       />
    //     </>;
    //     // const files = params.row.files || []; // Проверяем, есть ли файлы
    //     // console.log('params.row.files:', files); // Отладка

    //     // if (files.length > 0) {
    //     //   return (
    //     //     <FileModalList
    //     //       files={files}
    //     //       onFileSelect={(file) => {
    //     //         console.log('Selected file:', file);
    //     //         handleFileSelect({
    //     //           id: file?.id,
    //     //           name: file?.name,
    //     //         });
    //     //       }}
    //     //       onFileOpen={(file) => {
    //     //         console.log('Opened file:', file);
    //     //         handleFileOpen(file);
    //     //       }}
    //     //     />
    //     //   );
    //     // } else {
    //     //   return <div>No files</div>;
    //     // }
    //   },
    // },
  ];
  return (
    <div className="flex w-[100%]  my-0 mx-auto flex-col  relative overflow-hidden">
      {/* <EditableTable
        isNoneRowSelection={true}
        showSearchInput={false}
        data={parts}
        initialColumns={initialColumns}
        // isLoading={isLoading}
        menuItems={undefined}
        recordCreatorProps={false}
        xScroll={650}
        onDoubleRowClick={function (record: any, rowIndex?: any): void {}}
        onRowClick={function (record: any, rowIndex?: any): void {
          onSelectedPart && onSelectedPart(record, rowIndex);
        }}
        onSave={function (rowKey: any, data: any, row: any): void {
          throw new Error('Function not implemented.');
        }}
        yScroll={scroll}
        externalReload={function (): Promise<void> {
          throw new Error('Function not implemented.');
        }}
        isLoading={false}
      /> */}

      <PartsTable
        isFilesVisiable={true}
        isChekboxColumn={false}
        isVisible={true}
        isButtonColumn={false}
        pagination={false}
        isEditable={false}
        isAddVisiable={true}
        isButtonVisiable={false}
        height={'45vh'}
        isLoading={false}
        rowData={parts || []}
        columnDefs={columnOrderItems}
        partNumbers={[]}
        onAddRow={function (): void {}}
        onDelete={function (id: string): void {}}
        onSave={function (data: any): void {}}
        onCellValueChanged={function (params: any): void {}} // onAddRow={onAddRow}
        onRowSelect={function (rowData: any): void {
          onSelectedPart && onSelectedPart(rowData, rowData.index);
        }}
        onCheckItems={function (selectedKeys: React.Key[]): void {
          throw new Error('Function not implemented.');
        }} // onCheckItems={function (selectedKeys: React.Key[]): void {
        //   onCheckItems && onCheckItems(selectedKeys);
        //   console.log(selectedKeys);
        // }}
        // onDelete={onDelete}
        // onSave={onSave}
        // onCellValueChanged={onCellValueChanged}
      />
    </div>
  );
};

export default BookingOrderPartsList;
