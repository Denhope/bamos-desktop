import { ProColumns } from '@ant-design/pro-components';
import { TimePicker } from 'antd';
import EditableTable from '@/components/shared/Table/EditableTable';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IBookingItem } from '@/models/IBooking';
type ListOfBookingType = {
  scroll: number;
  data: any[];
  onSingleRowClick?: (record: any, rowIndex?: any) => void;
};
const ListOfBooking: FC<ListOfBookingType> = ({
  data,
  scroll,
  onSingleRowClick,
}) => {
  const { t } = useTranslation();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const initialColumns: ProColumns<IBookingItem>[] = [
    {
      title: `${t('DATE')}`,
      dataIndex: 'createDate',

      key: 'createDate',
      //tip: 'ITEM EXPIRY DATE',
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
      // tip: 'LOCAL_ID',
      ellipsis: true,

      // responsive: ['sm'],
    },
    {
      title: `${t('PART No')}`,
      dataIndex: 'PART_NUMBER',
      key: 'PART_NUMBER',
      ellipsis: true,
      //tip: 'ITEM PART_NUMBER',
      // ellipsis: true,

      formItemProps: {
        name: 'PART_NUMBER',
      },
    },
    {
      title: `${t('B/SERIAL')}`,
      dataIndex: 'SUPPLIER_BATCH_NUMBER',
      key: 'SUPPLIER_BATCH_NUMBER',
      ellipsis: true,
      render: (text: any, record: any) =>
        record.SERIAL_NUMBER || record.SUPPLIER_BATCH_NUMBER,
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
        return <div onClick={() => {}}>{record.CONDITION}</div>;
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('A/C')}`,
      dataIndex: 'registrationNumber',
      key: 'registrationNumber',
      // tip: 'LOCAL_ID',
      ellipsis: true,

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
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'NAME_OF_MATERIAL',
      key: 'NAME_OF_MATERIAL',
      // tip: 'ITEM STORE',
      ellipsis: true,

      formItemProps: {
        name: 'description',
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
          onSingleRowClick && onSingleRowClick(record);
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

export default ListOfBooking;
