import { ProColumns } from '@ant-design/pro-components';
import { TimePicker } from 'antd';
import ContextMenuWrapper from '@/components/shared/ContextMenuWrapperProps';
import EditableTable from '@/components/shared/Table/EditableTable';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FileModalList from '@/components/shared/FileModalList';
import { handleFileOpen, handleFileSelect } from '@/services/utilites';
import { IOrder, IOrderItem } from '@/models/IRequirement';
import { ColDef } from 'ag-grid-community';
import PartsTable from '../shared/Table/PartsTable';
type ReceivingItemList = {
  columnDefs: ColDef[];
  isLoading?: boolean;
  taskId?: string;
  fetchData?: IOrderItem[] | [];
  onUpdateData: (data: any[]) => void;
  height: string;
  isAddVisiable?: boolean;
  isVisible?: boolean;
  isButtonVisiable?: boolean;
  isEditable?: boolean;
  pagination?: boolean;
  onRowSelect?: (rowData: any | null) => void;
  isButtonColumn?: boolean;
  isChekboxColumn?: boolean;
  onCheckItems?: (selectedKeys: React.Key[]) => void;

  rowData?: any[];
};
const OrderItemList: FC<ReceivingItemList> = ({
  columnDefs,
  isLoading,
  height,
  rowData,
  isButtonVisiable = true,
  isEditable = true,
  isAddVisiable,
  isVisible = false,
  pagination,
  onRowSelect,
  isChekboxColumn,
  isButtonColumn,
  onCheckItems,
}) => {
  // const [selectedMaterials, setSelectedMaterials] = useState<any>([]);
  // const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  // const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
  //   setSelectedRowKeys(newSelectedRowKeys);
  //   onSelectedIds && onSelectedIds(newSelectedRowKeys);
  // };
  const { t } = useTranslation();
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

  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('ORDER No')}`,
      dataIndex: ['orderID', 'orderNumberNew'],
      key: 'orderNumber',
      // tooltip: 'ITEM STORE',
      ellipsis: true,
      width: '5%',
      render: (text: any, record: any) => {
        let titlePrefix = '';
        if (record.orderID && record.orderID?.orderType === 'QUOTATION_ORDER') {
          titlePrefix = 'Q';
        } else if (
          record.orderID &&
          record.orderID?.orderType === 'PURCHASE_ORDER'
        ) {
          titlePrefix = 'P';
        }
        return `${titlePrefix} ${record.orderID?.orderNumberNew}`;
      },
      sorter: (a: any, b: any) =>
        a.orderID.orderNumberNew - b.orderID.orderNumberNew, //
    },
    {
      title: `${t('ORDER TYPE')}`,
      dataIndex: ['orderID', 'orderType'],
      key: 'orderType',
      // tooltip: 'LOCAL_ID',
      ellipsis: true,
      width: '7%',
      formItemProps: {
        name: 'orderType',
      },
      valueType: 'select',
      valueEnum: {
        QUOTATION_ORDER: { text: t('QUOTATION ORDER') },
        PURCHASE_ORDER: { text: t('PURCHASE_ORDER') },
      },
      // render: (text: any, record: any) => record?.orderID?.orderType,

      // responsive: ['sm'],
    },
    {
      title: `${t('POS')}`,
      dataIndex: 'index',
      key: 'index',
      width: '3%',
      ellipsis: true,
      render: (text: any, record: any) => record?.index + 1,
      // остальные свойства...
    },
    {
      title: `${t('PART No')}`,
      dataIndex: 'PART_NUMBER',
      key: 'PART_NUMBER',
      ellipsis: true,
      //tooltip: 'ITEM PART_NUMBER',
      // ellipsis: true,
      width: '12%',
      formItemProps: {
        name: 'PART_NUMBER',
      },
      render: (text: any, record: any) => {
        return (
          <ContextMenuWrapper
            items={[
              {
                label: 'Copy',
                action: handleCopy,
              },
              {
                label: 'Open with',
                action: () => {},
                submenu: [
                  { label: 'PART TRACKING', action: handleAdd },
                  { label: 'PICKSLIP REQUEST', action: handleAddPick },
                ],
              },
            ]}
          >
            <a
              onClick={() => {
                // dispatch(setCurrentProjectTask(record));
                // setOpenRequirementDrawer(true);
                // onReqClick(record);
              }}
            >
              {record.partID.PART_NUMBER}
            </a>
          </ContextMenuWrapper>
        );
      },

      // responsive: ['sm'],
    },

    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: ['partID', 'DESCRIPTION'],
      key: 'DESCRIPTION',
      // tooltip: 'ITEM STORE',
      ellipsis: true,
      width: '8%',

      // responsive: ['sm'],
    },

    {
      title: `${t('QTY')}`,
      dataIndex: 'amout',
      key: 'amout',
      width: '5%',
      responsive: ['sm'],
      search: false,

      sorter: (a: any, b: any) => a.amout - b.amout, //
    },
    {
      title: `${t('QUOTED')}`,
      dataIndex: 'qtyQuoted',
      key: 'qtyQuoted',

      responsive: ['sm'],
      search: false,

      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('BACKORDER')}`,
      dataIndex: 'backorderQty',
      key: 'backorderQty',
      width: '6%',
      responsive: ['sm'],
      search: false,

      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('UNIT')}`,
      dataIndex: 'UNIT_OF_MEASURE',
      key: 'UNIT_OF_MEASURE',
      responsive: ['sm'],
      width: '5%',
      search: false,
      render: (text: any, record: any) => {
        return <div> {record.partID.UNIT_OF_MEASURE}</div>;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: `${t('VENDOR')}`,
      dataIndex: ['vendorID', 'CODE'],
      key: 'vendorID.CODE',
      // tooltip: 'ITEM STORE',
      ellipsis: true,
      // width: '4%',

      // responsive: ['sm'],
    },
    {
      title: `${t('PRICE')}`,
      dataIndex: 'price',
      key: 'price',
      width: '4%',

      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },

      sorter: (a: any, b: any) => a.price - b.price, //
      search: false,
    },
    {
      title: `${t('CURRENCY')}`,
      dataIndex: 'currency',
      key: 'currency',

      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
    {
      title: `${t('STATUS')}`,
      key: 'state',

      valueType: 'select',
      // filterSearch: true,
      // filters: true,

      ellipsis: true,

      dataIndex: 'state',
      editable: (text, record, index) => {
        return false;
      },
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
      // render: (text: any, record: any) => {
      //   // Определяем цвет фона в зависимости от условия
      //   let backgroundColor;
      //   if (record.state === 'RECEIVED') {
      //     backgroundColor = '#62d156';
      //   } else if (record.state === 'OPEN' || record.state === 'open') {
      //     backgroundColor = 'red';
      //   } else if (record.state === 'onQuatation') {
      //     backgroundColor = 'yellow';
      //   } else if (record.state === 'planned') {
      //     backgroundColor = '#d3d3d3';
      //   } else if (record.state === 'draft') {
      //     backgroundColor = '#d3d3d3';
      //   }
      //   return (
      //     <div style={{ backgroundColor }}>{record.state && record.state}</div>
      //   );
      // },
    },

    {
      title: `${t('CREATE BY')}`,
      dataIndex: ['createUserID', 'name'],
      key: 'createUserID',

      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
    {
      title: `${t('CREATE DATE')}`,
      dataIndex: 'createDate',
      width: '6%',
      key: 'createDate',
      //tooltip: 'ITEM EXPIRY DATE',
      ellipsis: true,
      valueType: 'date',

      formItemProps: {
        name: 'createDate',
      },
      sorter: (a, b) => {
        if (a.createDate && b.createDate) {
          const aFinishDate = new Date(a.createDate);
          const bFinishDate = new Date(b.createDate);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
      },
      renderFormItem: () => {
        return <TimePicker />;
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('DOC')}`,
      dataIndex: 'filesVendor',
      key: 'filesVendor',
      width: '3%',
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      render: (text, record, index) => {
        return record?.files && record?.files.length > 0 ? (
          <FileModalList
            files={record?.files || []}
            onFileSelect={function (file: any): void {
              handleFileSelect({
                id: file?.id,
                name: file?.name,
              });
            }}
            onFileOpen={function (file: any): void {
              handleFileOpen(file);
            }}
          />
        ) : (
          <></>
        );
      },
    },
  ];
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
  return (
    <div>
      {/* <EditableTable
        data={data}
        showSearchInput
        initialColumns={initialColumns}
        isLoading={loding}
        menuItems={undefined}
        recordCreatorProps={false}
        onMultiSelect={(record: any, rowIndex?: any) => {
          const materials = record.map((item: any) => item);
          // console.log(locationNames);
          setSelectedMaterials(materials);
          onSelectedParts && onSelectedParts(materials);
        }}
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        // onSelectedRowKeysChange={handleSelectedRowKeysChange}
        onRowClick={function (record: any, rowIndex?: any): void {
          onSingleRowClick && onSingleRowClick(record);
          setSelectedMaterials((prevSelectedItems: (string | undefined)[]) =>
            prevSelectedItems && prevSelectedItems.includes(record._id)
              ? []
              : [record]
          );
          onSelectedParts &&
            onSelectedParts((prevSelectedItems: (string | undefined)[]) =>
              prevSelectedItems && prevSelectedItems.includes(record._id)
                ? []
                : [record]
            );
        }}
        onDoubleRowClick={onDoubleClick}
        onSave={function (rowKey: any, data: any, row: any): void {}}
        yScroll={scroll}
        externalReload={function () {
          throw new Error('Function not implemented.');
        }}
      ></EditableTable> */}
      <div style={containerStyle}>
        <div style={gridStyle} className={'ag-theme-alpine'}>
          <PartsTable
            isFilesVisiable={true}
            isChekboxColumn={isChekboxColumn}
            isVisible={isVisible}
            isButtonColumn={isButtonColumn}
            pagination={pagination}
            isEditable={isEditable}
            isAddVisiable={isAddVisiable}
            isButtonVisiable={isButtonVisiable}
            height={height}
            isLoading={isLoading}
            rowData={rowData || []}
            columnDefs={columnDefs}
            partNumbers={[]}
            onAddRow={function (): void {}}
            onDelete={function (id: string): void {}}
            onSave={function (data: any): void {}}
            onCellValueChanged={function (params: any): void {}} // onAddRow={onAddRow}
            onRowSelect={function (rowData: any): void {
              onRowSelect && onRowSelect(rowData);
            }}
            onCheckItems={function (selectedKeys: React.Key[]): void {
              onCheckItems && onCheckItems(selectedKeys);
              console.log(selectedKeys);
            }} // onDelete={onDelete}
            // onSave={onSave}
            // onCellValueChanged={onCellValueChanged}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderItemList;
