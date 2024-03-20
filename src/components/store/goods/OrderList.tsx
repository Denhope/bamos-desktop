import { ProColumns } from '@ant-design/pro-components';
import { DatePicker } from 'antd';
import EditableTable from '@/components/shared/Table/EditableTable';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
type showOrderListType = {
  scroll: number;
  onSelectedOrders: (record: any) => void;
  onSelectedIds?: (record: any) => void;
  selectedOrder?: any;
  orders?: any;
};
//
const { RangePicker } = DatePicker;

const OrderList: FC<showOrderListType> = ({
  scroll,
  onSelectedIds,
  onSelectedOrders,
  orders,
  selectedOrder,
}) => {
  const { t } = useTranslation();
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('ORDER No')}`,
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      // tooltip: 'LOCAL_ID',
      ellipsis: true,
      // width: '13%',

      // responsive: ['sm'],
    },
    {
      title: `${t('VENDOR')}`,
      key: 'vendor',
      ellipsis: true,
      render: (_, record) => {
        const vendor =
          record.vendors && record.vendors[0]
            ? record.vendors[0].vendor
              ? record.vendors[0].vendor
              : record.vendors[0]?.CODE
            : null;
        const partsVendor =
          record.parts &&
          record.parts[0] &&
          record.parts[0].vendors &&
          record.parts[0].vendors[0]
            ? record.parts[0].vendors[0].CODE
            : null;
        const data = vendor || partsVendor || 'No vendor';
        return <span>{data}</span>;
      },
    },

    {
      title: `${t('STATE')}`,
      dataIndex: 'state',
      key: 'state',
      // width: '10%',
      valueType: 'select',
      filterSearch: true,
      ellipsis: true,
      filters: true,
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        // Определяем цвет фона в зависимости от условия
        let backgroundColor;
        if (record.state === 'RECEIVED') {
          backgroundColor = '#62d156';
        } else if (record.state === 'OPEN' || record.state === 'open') {
          backgroundColor = 'red';
        } else {
          backgroundColor = '#f0be37';
        }
        return (
          <div style={{ backgroundColor }}>{record.state && record.state}</div>
        );
      },
    },
    {
      title: `${t('DATE')}`,
      editable: (text, record, index) => {
        return false;
      },
      render: (text, record, index) => {
        const date = record.orderCreateDate
          ? record.orderCreateDate
          : record.createDate;
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so we add 1
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      },
      responsive: ['lg'],
      valueType: 'date',
      renderFormItem: () => {
        return <RangePicker />;
      },
    },
  ];
  return (
    <div className="flex w-[100%] my-0 mx-auto flex-col  h-[78vh] relative overflow-hidden">
      <EditableTable
        showSearchInput={false}
        data={orders}
        initialColumns={initialColumns}
        // isLoading={isLoading}
        menuItems={undefined}
        recordCreatorProps={false}
        isNoneRowSelection={true}
        xScroll={450}
        onDoubleRowClick={function (record: any, rowIndex?: any): void {}}
        onRowClick={function (record: any, rowIndex?: any): void {
          onSelectedOrders(record);
        }}
        onSave={function (rowKey: any, data: any, row: any): void {
          throw new Error('Function not implemented.');
        }}
        yScroll={scroll}
        externalReload={function (): Promise<void> {
          throw new Error('Function not implemented.');
        }}
        isLoading={false}
      />
    </div>
  );
};

export default OrderList;
