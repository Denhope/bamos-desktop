import React, { FC, useEffect, useState } from 'react';
import TabContent from '@/components/shared/Table/TabContent';
import { useTranslation } from 'react-i18next';

import OrderItemList from '@/components/orderViewer/OrderItemList';
import OrdersFilterViewerForm from '@/components/orderViewer/OrdersFilterViewerForm';
import { Button, Space } from 'antd';
import { PrinterOutlined, SaveOutlined } from '@ant-design/icons';
import { useGetFilteredOrderItemsFullQuery } from '@/features/orderItemsAdministration/orderItemApi';

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
  // const [data, setdata] = useState<any[] | []>(receivings);
  // const [partsToPrint, setPartsToPrint] = useState<any>(null);
  // useEffect(() => {
  //   if (receivings) {
  //     setdata(receivings);
  //   }
  // }, [receivings]);

  const {
    data: ordersItems,
    isLoading,
    refetch: refetchOrders,
  } = useGetFilteredOrderItemsFullQuery({
    startDate: orderSearchValues?.startDate ? orderSearchValues?.startDate : '',
    endDate: orderSearchValues?.endDate ? orderSearchValues?.endDate : '',
    state: orderSearchValues?.state || '',
    orderNumberNew: orderSearchValues?.orderNumberNew,
    orderType: orderSearchValues?.orderType,
    partNumberID: orderSearchValues?.partNumberID,
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
            icon={<PrinterOutlined />}
            // disabled={!rowKeys.length}
            // onClick={() => {
            //   setPartsToPrint(selectedParts);
            //   setOpenLabelsPrint(true);
            // }}
            size="small"
          >
            {t('PRINT TABLE')}
          </Button>
        </Space>
        <Space>
          <Button
            icon={<SaveOutlined />}
            // disabled={!rowKeys.length}
            // onClick={() => {
            //   setPartsToPrint(selectedParts);
            //   setOpenLabelsPrint(true);
            // }}
            size="small"
          >
            {t('SAVE TABLE')}
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default OrderViewer;
