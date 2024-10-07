import { ProColumns } from '@ant-design/pro-components';
import EditableTable from '@/components/shared/Table/EditableTable';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const UnserviseDetaails: FC = () => {
  const { t } = useTranslation();
  const { filteredStockDetails } = useTypedSelector(
    (state) => state.storesLogistic
  );
  const [data, setData] = useState<any>([]);
  useEffect(() => {
    setData(filteredStockDetails);

    // navigate(storedKey);
  }, [filteredStockDetails]);
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('LOCAL_ID')}`,
      dataIndex: 'LOCAL_ID',
      key: 'LOCAL_ID',

      ellipsis: true,
      width: '7%',
      formItemProps: {
        name: 'LOCAL_ID',
      },

      // responsive: ['sm'],
    },

    {
      title: `${t('PN')}`,
      dataIndex: 'PART_NUMBER',
      key: 'PART_NUMBER',

      ellipsis: true,
      width: '10%',
      formItemProps: {
        name: 'PART_NUMBER',
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('STORE')}`,
      dataIndex: 'STOCK',
      key: 'STOCK',

      ellipsis: true,
      //width: '9',
      formItemProps: {
        name: 'STOCK',
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('CONDITION')}`,
      dataIndex: 'CONDITION',
      key: 'CONDITION',

      ellipsis: true,
      width: '10%',
      formItemProps: {
        name: 'CONDITION',
      },

      // responsive: ['sm'],
    },

    {
      title: `${t('LOCATION')}`,
      dataIndex: 'SHELF_NUMBER',
      key: 'SHELF_NUMBER',

      ellipsis: true,
      width: '7%',
      formItemProps: {
        name: 'SHELF_NUMBER',
      },

      // responsive: ['sm'],
    },

    {
      title: `${t('BATCH/SERIAL')}`,
      dataIndex: 'SERIAL_NUMBER',
      key: 'SERIAL_NUMBER',
      render: (text: any, record: any) =>
        record.SERIAL_NUMBER || record.SUPPLIER_BATCH_NUMBER,
      ellipsis: true,
      width: '9%',
      formItemProps: {
        name: 'Batch_Unit Notes',
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('RESEIVING')}`,
      dataIndex: 'ORDER_NUMBER',
      key: 'ORDER_NUMBER',

      ellipsis: true,
      width: '7%',
      formItemProps: {
        name: 'ORDER_NUMBER',
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('EXPIRY DATE')}`,
      dataIndex: 'PRODUCT_EXPIRATION_DATE',
      key: 'PRODUCT_EXPIRATION_DATE',

      ellipsis: true,
      width: '9%',
      formItemProps: {
        name: 'PRODUCT_EXPIRATION_DATE',
      },
      sorter: (a, b) => {
        if (a.finishDate && b.finishDate) {
          const aFinishDate = new Date(a.PRODUCT_EXPIRATION_DATE);
          const bFinishDate = new Date(b.PRODUCT_EXPIRATION_DATE);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
      },

      // responsive: ['sm'],
    },

    {
      title: `${t('QTY')}`,
      dataIndex: 'QUANTITY',
      key: 'QUANTITY',
      width: '4%',
      responsive: ['sm'],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('UNIT')}`,
      dataIndex: 'UNIT_OF_MEASURE',
      key: 'UNIT_OF_MEASURE',
      responsive: ['sm'],
      width: '4%',
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: 'RESERVED QTY',
      dataIndex: 'reserved',
      key: 'reserved',
      width: '6%',
      responsive: ['sm'],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: 'BLOCKED QTY',
      width: '6%',
      dataIndex: 'ONBLOCK_QUANTITY',
      key: 'ONBLOCK_QUANTITY',
      responsive: ['sm'],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: 'OWNER',
      dataIndex: 'Owner Short Name',
      key: 'Owner Short Name',
      width: '6%',
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
    {
      title: `${t('DOC')}`,
      dataIndex: 'DOC',
      key: 'DOC',
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
  ];
  return (
    <div className="py-5 flex flex-col w-[99%]">
      <EditableTable
        data={data}
        initialColumns={initialColumns}
        isLoading={false}
        menuItems={undefined}
        recordCreatorProps={false}
        onRowClick={function (record: any, rowIndex?: any): void {
          throw new Error('Function not implemented.');
        }}
        onSave={function (rowKey: any, data: any, row: any): void {
          throw new Error('Function not implemented.');
        }}
        yScroll={40}
        externalReload={function () {
          throw new Error('Function not implemented.');
        }}
      />
    </div>
  );
};

export default UnserviseDetaails;
