import ReceivingItemList from '@/components/store/receivingItems/ReceivingItemList';
import ReceivingItemsFilterorm from '@/components/store/receivingItems/ReceivingItemsFilterorm';
import React, { FC, useEffect, useState } from 'react';
import TabContent from '@/components/shared/Table/TabContent';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Space } from 'antd';
import GeneretedTransferPdf from '@/components/pdf/GeneretedTransferLabels';
import ModifyReceiving from '@/components/store/receivingItems/ModifyReceiving';
import OrdersItemsFilterorm from '@/components/store/matOrders/OrdersItemsFilterorm';
import OrderItemList from '@/components/store/matOrders/OrderItemList';
interface ReceivingTracking {
  onDoubleClick?: (record: any, rowIndex?: any) => void;
  onSingleRowClick?: (record: any) => void;
}
const OrderViewer: FC<ReceivingTracking> = ({
  onSingleRowClick,
  onDoubleClick,
}) => {
  const { t } = useTranslation();
  const [receivings, setReceiving] = useState<any[] | []>([]);
  const [data, setdata] = useState<any[] | []>(receivings);
  const [partsToPrint, setPartsToPrint] = useState<any>(null);
  useEffect(() => {
    if (receivings) {
      setdata(receivings);
    }
  }, [receivings]);
  const tabs = [
    {
      content: (
        <>
          <OrderItemList
            onSelectedParts={setPartsToPrint}
            onDoubleClick={onDoubleClick}
            scroll={40}
            data={data}
            onSingleRowClick={onSingleRowClick}
          />
        </>
      ),
      title: `${t('ORDER LIST')}`,
    },
  ];
  const [labelsOpenPrint, setOpenLabelsPrint] = useState<any>();
  const [modifyReceiving, setOpenModify] = useState<any>();

  return (
    <div className="h-[82vh] overflow-hidden flex flex-col justify-between gap-1">
      <div className="flex flex-col gap-5">
        <OrdersItemsFilterorm onReceivingSearch={setReceiving} />
        <TabContent tabs={tabs}></TabContent>
      </div>
      <div className="flex justify-between">
        {/* <Space align="center">
          <Button
            disabled={!(partsToPrint && partsToPrint.length === 1)}
            onClick={() => setOpenModify(true)}
            size="small"
          >
            {t('MODIFY')}
          </Button>
        </Space>
        <Space align="center">
          <Button
            disabled={!partsToPrint || !partsToPrint.length}
            onClick={() => setOpenLabelsPrint(true)}
            size="small"
          >
            {t('PRINT LABELS')}
          </Button>
        </Space>
        <Modal
          title={t('PRINT LABEL')}
          open={labelsOpenPrint}
          width={'30%'}
          onCancel={() => {
            setOpenLabelsPrint(false);
            setPartsToPrint(null);
          }}
          footer={null}
        >
          <GeneretedTransferPdf key={Date.now()} parts={partsToPrint} />
        </Modal> */}
        <Modal
          onOk={() => {}}
          title={t('MODIFY RECEIVING')}
          open={modifyReceiving}
          width={'80%'}
          onCancel={() => {
            setOpenModify(false);
          }}
          footer={null}
        >
          {partsToPrint && partsToPrint.length > 0 && (
            <ModifyReceiving
              data={partsToPrint[0]}
              onEditReceivings={setReceiving}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default OrderViewer;
