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
      dataIndex: ['orderID', 'orderNumberNew'],
      key: 'orderNumber',
      // tooltip: 'ITEM STORE',
      ellipsis: true,
      width: '11%',
      render: (text: any, record: any) => {
        let titlePrefix = '';
        if (record && record?.orderType === 'QUOTATION_ORDER') {
          titlePrefix = 'Q';
        } else if (record && record?.orderType === 'PURCHASE_ORDER') {
          titlePrefix = 'P';
        }
        return `${titlePrefix} ${record?.orderNumberNew}`;
      },
      sorter: (a: any, b: any) => a.orderNumberNew - b.orderNumberNew, //
    },
    {
      title: `${t('VENDOR')}`,
      key: 'vendor',
      ellipsis: true,
      render: (_, record) => {
        const vendor =
          record.orderItemsID && record.orderItemsID[0]
            ? record.orderItemsID[0].vendorID?.CODE
            : null;

        const data = vendor || 'No vendor';
        return <span>{data}</span>;
      },
    },

    {
      title: `${t('STATUS')}`,
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

      valueEnum: {
        inStockReserve: { text: t('RESERVATION'), status: 'SUCCESS' },
        transfer: { text: t('TRANSFER'), status: 'Warning' },
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
      //   } else {
      //     backgroundColor = '#f0be37';
      //   }
      //   return (
      //     <div style={{ backgroundColor }}>{record.state && record.state}</div>
      //   );
      // },
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
