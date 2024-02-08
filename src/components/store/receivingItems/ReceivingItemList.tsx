import { ProColumns } from '@ant-design/pro-components';
import { TimePicker } from 'antd';
import ContextMenuWrapper from '@/components/shared/ContextMenuWrapperProps';
import EditableTable from '@/components/shared/Table/EditableTable';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
type ReceivingItemList = {
  scroll: number;
  data: any[];
  onSelectedParts?: (record: any) => void;
  onSelectedIds?: (record: any) => void;
  onDoubleClick?: (record: any, rowIndex?: any) => void;
  onSingleRowClick?: (record: any, rowIndex?: any) => void;
};
const ReceivingItemList: FC<ReceivingItemList> = ({
  data,
  scroll,
  onSelectedParts,
  onSelectedIds,
  onDoubleClick,
  onSingleRowClick,
}) => {
  const [selectedMaterials, setSelectedMaterials] = useState<any>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    onSelectedIds && onSelectedIds(newSelectedRowKeys);
  };
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
      title: `${t('RECEIVING No')}`,
      dataIndex: 'RECEIVING_NUMBER',
      key: 'RECEIVING_NUMBER',
      // tip: 'LOCAL_ID',
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
      //tip: 'ITEM PART_NUMBER',
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
              //     { label: 'Part Tracking', action: handleAdd },
              //     { label: 'PickSlip Request', action: handleAddPick },
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
      // tip: 'ITEM STORE',
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
      //tip: 'ITEM PART_NUMBER',
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
                  { label: 'Part Tracking', action: handleAdd },
                  { label: 'PickSlip Request', action: handleAddPick },
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
      // tip: 'ITEM STORE',
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
      //tip: 'CONDITION',
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
      // tip: 'LOCAL_ID',
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
      //tip: 'ITEM ORDER_NUMBER',
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
      // tip: 'ITEM STORE',
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
      //tip: 'ITEM LOCATION',
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
      //tip: 'ITEM EXPIRY DATE',
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

    // {
    //   title: `${t('DOC')}`,
    //   dataIndex: 'DOC',
    //   key: 'DOC',
    //   width: '4%',
    //   ellipsis: true,
    //   editable: (text, record, index) => {
    //     return false;
    //   },
    //   search: false,
    // },

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
      title: `${t('STATE')}`,
      key: 'state',

      valueType: 'select',
      filterSearch: true,
      filters: true,
      ellipsis: true,
      onFilter: true,
      valueEnum: {
        RECEIVED: { text: t('RECEIVED'), status: 'Success' },
        CANCELLED: { text: t('CANCELLED'), status: 'Error' },
      },

      dataIndex: 'state',
      editable: (text, record, index) => {
        return false;
      },
    },
  ];
  return (
    <div>
      <EditableTable
        data={data}
        showSearchInput
        initialColumns={initialColumns}
        isLoading={false}
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
      ></EditableTable>
    </div>
  );
};

export default ReceivingItemList;
