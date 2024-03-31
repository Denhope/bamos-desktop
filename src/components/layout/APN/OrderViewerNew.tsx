import React, { FC, useEffect, useState } from 'react';
import TabContent from '@/components/shared/Table/TabContent';
import { useTranslation } from 'react-i18next';

import OrderItemList from '@/components/orderViewer/OrderItemList';
import OrdersFilterViewerForm from '@/components/orderViewer/OrdersFilterViewerForm';
import { Button, Modal, Space } from 'antd';
import { PrinterOutlined, SaveOutlined } from '@ant-design/icons';
import { useGetFilteredOrderItemsFullQuery } from '@/features/orderItemsAdministration/orderItemApi';
import GeneretedMarcketingTable from '@/components/orderViewer/GeneretedMarcketingTable';

interface ReceivingTracking {
  onDoubleClick?: (record: any, rowIndex?: any) => void;
  onSingleRowClick?: (record: any) => void;
}
const OrderViewer: FC<ReceivingTracking> = ({
  onSingleRowClick,
  onDoubleClick,
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
  const tabs = [
    {
      content: (
        <>
          <OrderItemList
            loding={isLoading}
            onDoubleClick={onDoubleClick}
            scroll={40}
            data={ordersItems || []}
            onSelectedIds={setSelectedRowKeys}
            onSingleRowClick={onSingleRowClick}
          />
        </>
      ),
      title: `${t('ORDER LIST')}`,
    },
  ];

  return (
    <div className="h-[82vh] overflow-hidden flex flex-col justify-between gap-1">
      <div className="flex flex-col gap-5">
        <OrdersFilterViewerForm
          loding={isLoading}
          onOrderItemsFilterSearch={setOrderSearchValues}
        />
        <TabContent tabs={tabs}></TabContent>
      </div>

      <div className="flex justify-between">
        <Space>
          <Button
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
          </Button>
        </Space>
        <Space>
          <Button
            icon={<SaveOutlined />}
            // }}
            size="small"
          >
            {t('SAVE TABLE')}
          </Button>
        </Space>
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
