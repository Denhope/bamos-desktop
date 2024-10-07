import { ProColumns } from '@ant-design/pro-components';
import { TimePicker } from 'antd';
import ContextMenuWrapper from '@/components/shared/ContextMenuWrapperProps';
import EditableTable from '@/components/shared/Table/EditableTable';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FileModalList from '@/components/shared/FileModalList';
import {
  ValueEnumType,
  getStatusColor,
  handleFileOpen,
  handleFileSelect,
  transformToIRecevingItems,
} from '@/services/utilites';
import PartContainer from '@/components/woAdministration/PartContainer';
import { ColDef } from 'ag-grid-community';
type ReceivingItemList = {
  scroll: number;
  data: any[];
  onSelectedParts?: (record: any) => void;
  onSelectedIds?: (record: any) => void;
  onDoubleClick?: (record: any, rowIndex?: any) => void;
  onSingleRowClick?: (record: any, rowIndex?: any) => void;
  isLoading: boolean;
  hight: string;
};
const ReceivingItemList: FC<ReceivingItemList> = ({
  data,
  scroll,
  onSelectedParts,
  onSelectedIds,
  onDoubleClick,
  onSingleRowClick,
  isLoading,
  hight,
}) => {
  const [selectedMaterials, setSelectedMaterials] = useState<any>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    onSelectedIds && onSelectedIds(newSelectedRowKeys);
  };
  const { t } = useTranslation();
  const valueEnum: ValueEnumType = {
    onShort: t('ON SHORT'),
    onQuatation: t('QUATATION'),
    open: t('OPEN'),
    closed: t('CLOSE'),
    canceled: t('CANCEL'),
    onOrder: t('ISSUED'),
    draft: t('DRAFT'),
    issued: t('ISSUED'),
    progress: t('IN PROGRESS'),
    complete: t('COMPLETE'),
    RECEIVED: t('RECEIVED'),
    PARTLY_RECEIVED: t('PARTLY RECEIVED'),
    CANCELLED: t('PARTLY RECEIVED'),
    partyCancelled: t('PARTLY CANCELLED'),
  };
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
      title: `${t('RECEIVING No')}`,
      dataIndex: 'RECEIVING_NUMBER',
      key: 'RECEIVING_NUMBER',
      // tooltip: 'LOCAL_ID',
      ellipsis: true,
      width: '7%',
      formItemProps: {
        name: 'RECEIVING_NUMBER',
      },
      sorter: (a: any, b: any) => a.RECEIVING_NUMBER - b.RECEIVING_NUMBER, //

      // responsive: ['sm'],
    },

    {
      title: `${t('RECEIVING ITEM No')}`,
      dataIndex: 'RECEIVING_ITEM_NUMBER',
      key: 'RECEIVING_ITEM_NUMBER',
      //tooltip: 'ITEM PART_NUMBER',
      ellipsis: true,
      width: '7%',
      formItemProps: {
        name: 'RECEIVING_ITEM_NUMBER',
      },
      render: (text: any, record: any) => {
        return (
          <ContextMenuWrapper
            items={[
              {
                label: 'Copy',
                action: handleCopy,
              },
              // {
              //   label: 'Open with',
              //   action: () => {},
              //   submenu: [
              //     { label: 'PART TRACKING', action: handleAdd },
              //     { label: 'PICKSLIP REQUEST', action: handleAddPick },
              //   ],
              // },
            ]}
          >
            <a
              onClick={() => {
                // dispatch(setCurrentProjectTask(record));
                // setOpenRequirementDrawer(true);
                // onReqClick(record);
              }}
            >
              {record.RECEIVING_ITEM_NUMBER}
            </a>
          </ContextMenuWrapper>
        );
      },

      // responsive: ['sm'],
    },

    {
      title: `${t('ORDER No')}`,
      dataIndex: 'ORDER_NUMBER',
      key: 'ORDER_NUMBER',
      // tooltip: 'ITEM STORE',
      ellipsis: true,
      // width: '8%',
      formItemProps: {
        name: 'ORDER_NUMBER',
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('PART No')}`,
      dataIndex: 'PART_NUMBER',
      key: 'PART_NUMBER',
      ellipsis: true,
      //tooltip: 'ITEM PART_NUMBER',
      // ellipsis: true,
      width: '10%',
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
              {record.PART_NUMBER}
            </a>
          </ContextMenuWrapper>
        );
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('B/SERIAL')}`,
      dataIndex: 'SERIAL_NUMBER',
      key: 'SERIAL_NUMBER',
      ellipsis: true,
      render: (text: any, record: any) =>
        record.SERIAL_NUMBER || record.SUPPLIER_BATCH_NUMBER,
      // остальные свойства...
    },
    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'NAME_OF_MATERIAL',
      key: 'NAME_OF_MATERIAL',
      // tooltip: 'ITEM STORE',
      ellipsis: true,

      formItemProps: {
        name: 'NAME_OF_MATERIAL',
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('CONDITION')}`,
      dataIndex: 'CONDITION',
      key: 'CONDITION',
      //tooltip: 'CONDITION',
      ellipsis: true,

      formItemProps: {
        name: 'CONDITION',
      },
      render: (text: any, record: any) => {
        return (
          <div
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              // setOpenRequirementDrawer(true);
              // onReqClick(record);
            }}
          >
            {record.CONDITION}
          </div>
        );
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('LABEL')}`,
      dataIndex: 'LOCAL_ID',
      key: 'LOCAL_ID',
      // tooltip: 'LOCAL_ID',
      ellipsis: true,
      width: '7%',
      formItemProps: {
        name: 'LOCAL_ID',
      },
      sorter: (a: any, b: any) => a.LOCAL_ID - b.LOCAL_ID, //

      // responsive: ['sm'],
    },
    {
      title: `${t('AWB No')}`,
      dataIndex: 'AWB_NUMBER',
      key: 'AWB_NUMBER',
      //tooltip: 'ITEM ORDER_NUMBER',
      ellipsis: true,
      width: '7%',
      formItemProps: {
        name: 'AWB_NUMBER',
      },

      // responsive: ['sm'],
    },

    {
      title: `${t('STORE')}`,
      dataIndex: 'STOCK',
      key: 'STOCK',
      // tooltip: 'ITEM STORE',
      ellipsis: true,
      width: '4%',
      formItemProps: {
        name: 'STOCK',
      },
      render: (text: any, record: any) => {
        return (
          <div
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              // setOpenRequirementDrawer(true);
              // onReqClick(record);
            }}
          >
            {record.STOCK}
          </div>
        );
      },

      // responsive: ['sm'],
    },

    {
      title: `${t('LOCATION')}`,
      dataIndex: 'SHELF_NUMBER',
      key: 'SHELF_NUMBER',
      //tooltip: 'ITEM LOCATION',
      ellipsis: true,
      width: '5%',
      formItemProps: {
        name: 'SHELF_NUMBER',
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('REC DATE')}`,
      dataIndex: 'RECEIVED_DATE',
      width: '7%',
      key: 'RECEIVED_DATE',
      //tooltip: 'ITEM EXPIRY DATE',
      ellipsis: true,
      valueType: 'date',

      formItemProps: {
        name: 'RECEIVED_DATE',
      },
      sorter: (a, b) => {
        if (a.PRODUCT_EXPIRATION_DATE && b.RECEIVED_DATE) {
          const aFinishDate = new Date(a.RECEIVED_DATE);
          const bFinishDate = new Date(b.RECEIVED_DATE);
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
      title: `${t('QTY')}`,
      dataIndex: 'QUANTITY',
      key: 'QUANTITY',
      width: '5%',
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
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: `${t('DOC')}`,
      dataIndex: 'DOC',
      key: 'DOC',
      width: '4%',
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      render: (text, record, index) => {
        return record?.FILES && record?.FILES.length > 0 ? (
          <FileModalList
            files={record.foRealese?.FILES || []}
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

    {
      title: `${t('OWNER')}`,
      dataIndex: 'OWNER_SHORT_NAME',
      key: 'OWNER_SHORT_NAME',

      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
    {
      title: `${t('VENDOR')}`,
      dataIndex: 'SUPPLIES_CODE',
      key: 'SUPPLIES_CODE',

      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
    {
      title: `${t('PRICE')}`,
      dataIndex: 'PRICE',
      key: 'PRICE',

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
      filterSearch: true,
      filters: true,
      ellipsis: true,
      onFilter: true,
      valueEnum: {
        RECEIVED: { text: t('RECEIVED'), status: 'SUCCESS' },
        CANCELLED: { text: t('CANCEL'), status: 'Error' },
      },

      dataIndex: 'state',
      editable: (text, record, index) => {
        return false;
      },
    },
  ];
  type CellDataType = 'text' | 'number' | 'date' | 'boolean';

  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType;
  }
  const [columnDefs, setColumnDefs] = useState<ExtendedColDef[]>([
    {
      headerName: `${t('RECEIVING No')}`,
      field: 'RECEIVING_NUMBER',
      editable: false,
      cellDataType: 'text',
    },

    {
      headerName: `${t('RECEIVING ITEM No')}`,
      field: 'RECEIVING_ITEM_NUMBER',
      editable: false,
      cellDataType: 'text',
    },
    {
      headerName: `${t('PART_NUMBER')}`,
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
      field: 'SUPPLIER_BATCH_NUMBER',
      editable: false,
      filter: false,
      headerName: `${t('BATCH')}`,
      cellDataType: 'text',
    },
    {
      field: 'SERIAL_NUMBER',
      editable: false,
      filter: false,
      headerName: `${t('SERIAL')}`,
      cellDataType: 'text',
    },
    {
      field: 'LOCAL_ID',
      editable: false,
      filter: false,
      headerName: `${t('LABEL')}`,
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
      field: 'QUANTITY',
      editable: false,
      filter: false,
      headerName: `${t('QUANTITY')}`,
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
      field: 'AWB_NUMBER',
      editable: false,
      filter: false,
      headerName: `${t('AWB No')}`,
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
      field: 'SHELF_NUMBER',
      headerName: `${t('LOCATION')}`,
      cellDataType: 'text',
    },
    {
      field: 'RECEIVED_DATE',
      editable: false,
      cellDataType: 'date',
      headerName: `${t('RECEIVED_DATE')}`,
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
      field: 'SUPPLIES_CODE',
      headerName: `${t('VENDOR')}`,
      cellDataType: 'text',
    },
    {
      field: 'PRICE',
      headerName: `${t('PRICE')}`,
      cellDataType: 'number',
    },
    {
      field: 'CURRENCY',
      headerName: `${t('CURRENCY')}`,
      cellDataType: 'text',
    },
    {
      field: 'state',
      headerName: `${t('Status')}`,
      cellDataType: 'text',
      width: 150,
      filter: true,
      valueGetter: (params: { data: { state: keyof ValueEnumType } }) =>
        params.data.state,
      valueFormatter: (params: { value: keyof ValueEnumType }) => {
        const status = params.value;
        return valueEnum[status] || '';
      },
      cellStyle: (params: { value: keyof ValueEnumType }) => ({
        backgroundColor: getStatusColor(params.value),
        color: '#ffffff', // Text color
      }),
    },
  ]);
  const transformedPartNumbers = useMemo(() => {
    return transformToIRecevingItems(data || []);
  }, [data]);
  return (
    <div>
      <PartContainer
        isLoading={isLoading}
        isFilesVisiable={true}
        isVisible={true}
        pagination={true}
        isAddVisiable={true}
        isButtonVisiable={false}
        isEditable={true}
        height={hight}
        columnDefs={columnDefs}
        partNumbers={[]}
        isChekboxColumn={true}
        onUpdateData={(data: any[]): void => {}}
        rowData={transformedPartNumbers}
        onCheckItems={handleSelectedRowKeysChange}
        onRowSelect={(data: any): void => {
          onSingleRowClick && onSingleRowClick(data);

          setSelectedMaterials((prevSelectedItems: (string | undefined)[]) =>
            prevSelectedItems && prevSelectedItems.includes(data?._id)
              ? []
              : [data]
          );
          onSelectedParts &&
            onSelectedParts((prevSelectedItems: (string | undefined)[]) =>
              prevSelectedItems && prevSelectedItems.includes(data?._id)
                ? []
                : [data]
            );
        }}
      />
    </div>
  );
};

export default ReceivingItemList;
