import { ProColumns } from '@ant-design/pro-components';
import { TimePicker } from 'antd';
import EditableTable from '@/components/shared/Table/EditableTable';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
type StoreViewType = {
  scroll: number;
  data: any[];
  onSingleRowClick?: (record: any, rowIndex?: any) => void;
};
const StoreView: FC<StoreViewType> = ({ data, scroll, onSingleRowClick }) => {
  const { t } = useTranslation();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('DATE')}`,
      dataIndex: 'createDate',

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
      title: `${t('BOOKING')}`,
      dataIndex: 'voucherModel',
      key: 'voucherModel',
      // tooltip: 'LOCAL_ID',
      ellipsis: true,

      // responsive: ['sm'],
    },
    {
      title: `${t('PART No')}`,
      dataIndex: 'PART_NUMBER',
      key: 'PART_NUMBER',
      ellipsis: true,
      //tooltip: 'ITEM PART_NUMBER',
      // ellipsis: true,

      formItemProps: {
        name: 'PART_NUMBER',
      },
    },
    {
      title: `${t('B/SERIAL')}`,
      dataIndex: 'SERIAL_NUMBER',
      key: 'SERIAL_NUMBER',
      ellipsis: true,
      render: (text: any, record: any) =>
        record.SERIAL_NUMBER || record.SUPPLIER_BATCH_NUMBER,
    },
    {
      title: `${t('STATION')}`,
      dataIndex: 'station',
      key: 'station',
      //tooltip: 'CONDITION',
      ellipsis: true,

      formItemProps: {
        name: 'station',
      },
      render: (text: any, record: any) => {
        return (
          <div onClick={() => {}}>
            {record?.station || record?.WAREHOUSE_RECEIVED_AT}
          </div>
        );
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('STORE')}`,
      dataIndex: 'STOCK',
      key: 'STOCK',
      // tooltip: 'ITEM STORE',
      ellipsis: true,

      formItemProps: {
        name: 'STOCK',
      },
      render: (text: any, record: any) => {
        return <div onClick={() => {}}>{record.STOCK}</div>;
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('LOCATION')}`,
      dataIndex: 'SHELF_NUMBER',
      key: 'SHELF_NUMBER',
      //tooltip: 'ITEM LOCATION',
      ellipsis: true,

      formItemProps: {
        name: 'SHELF_NUMBER',
      },
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
  ];
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  return (
    <div>
      <EditableTable
        data={data}
        isNoneRowSelection
        showSearchInput
        initialColumns={initialColumns}
        isLoading={false}
        menuItems={undefined}
        recordCreatorProps={false}
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        // onSelectedRowKeysChange={handleSelectedRowKeysChange}
        onRowClick={function (record: any, rowIndex?: any): void {
          onSingleRowClick &&
            onSingleRowClick((prevSelectedItems: (string | undefined)[]) =>
              prevSelectedItems && prevSelectedItems.includes(record._id)
                ? []
                : [record]
            );
        }}
        onSave={function (rowKey: any, data: any, row: any): void {}}
        yScroll={scroll}
        externalReload={function () {
          throw new Error('Function not implemented.');
        }}
      ></EditableTable>
    </div>
  );
};

export default StoreView;
