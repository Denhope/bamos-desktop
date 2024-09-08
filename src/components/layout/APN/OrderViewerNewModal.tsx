//@ts-nocheck

import React, { FC, useEffect, useMemo, useState } from 'react';
import TabContent from '@/components/shared/Table/TabContent';
import { useTranslation } from 'react-i18next';

import OrdersFilterViewerForm from '@/components/orderViewer/OrdersFilterViewerForm';
import { Button, Modal, Space } from 'antd';
import { PrinterOutlined, SaveOutlined } from '@ant-design/icons';
import { useGetFilteredOrderItemsFullQuery } from '@/features/orderItemsAdministration/orderItemApi';
import GeneretedMarcketingTable from '@/components/orderViewer/GeneretedMarcketingTable';
import OrderItemList from '@/components/orderViewer/OrderItemList';
import {
  ValueEnumType,
  getStatusColor,
  transformToIORderItem,
} from '@/services/utilites';

interface ReceivingTracking {
  onDoubleClick?: (record: any, rowIndex?: any) => void;
  onSingleRowClick?: (record: any) => void;
  onSelectedRowKeys?: (record: any) => void;
  onSelectedRecords: (record: any) => void;
}
const OrderViewer: FC<ReceivingTracking> = ({
  onSingleRowClick,
  onDoubleClick,
  onSelectedRowKeys,
  onSelectedRecords,
}) => {
  const { t } = useTranslation();
  const [orderSearchValues, setOrderSearchValues] = useState<any>();
  const [completeOpenPrintTable, setOpenCompletePrintTable] = useState<any>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const {
    data: ordersItems,
    isLoading,
    refetch: refetchOrders,
  } = useGetFilteredOrderItemsFullQuery({
    startDate: orderSearchValues?.startDate ? orderSearchValues?.startDate : '',
    endDate: orderSearchValues?.endDate ? orderSearchValues?.endDate : '',
    state: orderSearchValues?.state || '',
    orderNumberNew: orderSearchValues?.orderNumberNew,
    orderType: orderSearchValues?.orderType || 'QUOTATION_ORDER',
    partNumberID: orderSearchValues?.partNumberID,
    vendorID: orderSearchValues?.vendorID,
  });
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
  };
  const columnOrderItems = [
    {
      field: 'orderNumber',
      headerName: `${t('ORDER No')}`,
      cellDataType: 'text',
    },
    {
      field: 'orderType',
      headerName: `${t('ORDER TYPE')}`,
      cellDataType: 'text',
    },
    {
      field: 'index',
      headerName: `${t('POS')}`,
      cellDataType: 'text',
    },
    {
      field: 'status',
      headerName: `${t('Status')}`,
      cellDataType: 'text',
      width: 150,
      filter: true,
      valueGetter: (params: { data: { status: keyof ValueEnumType } }) =>
        params.data.status,
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
    },
    {
      field: 'DESCRIPTION',
      headerName: `${t('DESCRIPTION')}`,
      cellDataType: 'text',
    },
    {
      field: 'GROUP',
      headerName: `${t('GROUP')}`,
      cellDataType: 'text',
    },
    {
      field: 'TYPE',
      headerName: `${t('TYPE')}`,
      cellDataType: 'text',
      editable: false,
    },
    {
      field: 'amout',
      editable: false,
      cellDataType: 'number',
      headerName: `${t('QUANTITY')}`,
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('UNIT OF MEASURE')}`,
      cellDataType: 'text',
    },
    {
      field: 'backorderQty',
      editable: false,
      cellDataType: 'number',
      headerName: `${t('BACKORDER')}`,
    },
    {
      field: 'vendorCode',
      editable: false,
      cellDataType: 'text',
      headerName: `${t('VENDOR')}`,
    },
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

    {
      field: 'createUserName',
      editable: false,
      cellDataType: 'text',
      headerName: `${t('CREATE BY')}`,
    },
    {
      field: 'createDate',
      editable: false,
      cellDataType: 'date',
      headerName: `${t('CREATE DATE')}`,
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
  ];
  const transformedRequirements = useMemo(() => {
    console.log(transformToIORderItem(ordersItems || []));
    return transformToIORderItem(ordersItems || []);
  }, [ordersItems]);
  const tabs = [
    {
      content: (
        <>
          <OrderItemList
            isLoading={isLoading}
            rowData={transformedRequirements}
            onCheckItems={setSelectedRowKeys}
            onRowSelect={onSelectedRecords}
            columnDefs={columnOrderItems}
            onUpdateData={function (data: any[]): void {}}
            height={'32vh'}
            isChekboxColumn={true}
            isAddVisiable={true}
            isButtonVisiable={false}
            isEditable={false}
            isVisible={false}
            pagination={true}
          />
        </>
      ),
      title: `${t('ORDER LIST')}`,
    },
  ];

  return (
    <div className="h-[65vh] overflow-hidden flex flex-col justify-between gap-1">
      <div className="flex flex-col gap-5">
        <OrdersFilterViewerForm
          loding={isLoading}
          onOrderItemsFilterSearch={setOrderSearchValues}
        />
        <TabContent tabs={tabs}></TabContent>
      </div>

      <div className="flex justify-between">
        <Space>
          {/* <Button
            disabled={!selectedRowKeys.length}
            icon={<PrinterOutlined />}
            // disabled={!rowKeys.length}
            onClick={() => {
              // setPartsToPrint(selectedParts);
              setOpenCompletePrintTable(true);
            }}
            size="small"
          >
            {t('PRINT TABLE')}
          </Button> */}
        </Space>
        <Space></Space>
      </div>
      <Modal
        title={t('TABLE PRINT')}
        open={completeOpenPrintTable}
        width={'70%'}
        onCancel={() => setOpenCompletePrintTable(false)}
        footer={null}
      >
        {/* {editingOrder && editingOrder.state === 'onQuatation' && ( */}
        <GeneretedMarcketingTable orderIDs={selectedRowKeys} />
      </Modal>
    </div>
  );
};

export default OrderViewer;
