import { PDFViewer } from '@react-pdf/renderer';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import { IReferencesLinkType } from '@/models/IAdditionalTask';
import { title } from 'process';
import React, { FC, useRef, useEffect, useState } from 'react';

import { PdfParientWO } from '../../pdf-parient-WO';

import QRGenerator from '@/components/qrCode/QRGenerator';
import { setCurrentQrCodeLink } from '@/store/reducers/MtbSlice';
import { IProjectTask } from '@/models/IProjectTaskMTB';
import { IProjectResponce } from '@/models/IProject';
import { IOrder } from '@/models/IOrder';
import { PdfParientQOrder } from './pdf-parient-report-qOrder';

const fieldsTypes = [
  { title: 'Nr/ №', width: 9 },
  { title: 'P/N/ Партийный номер', width: 30 },
  { title: 'Description / Описание', width: 50 },
  { title: `QTY/${'\r\n'} Кол-во`, width: 15 },
  { title: `Miesuring UNIT/${'\r\n'} Ед. Измерения`, width: 20 },
];

export interface GeneretedQuatationOrder {
  order: IOrder;
  scroll?: any;
}
const GeneretedQuotationOrder: FC<GeneretedQuatationOrder> = ({
  order,
  scroll,
}) => {
  const [updatedOrder, setUpdatedOrder] = useState<any | null>(order);

  useEffect(() => {
    setUpdatedOrder(order);
  }, [order]);

  const handleCanvasReady = (url: string | null) => {
    if (url) {
      setUpdatedOrder((prevTask: any) => ({
        ...prevTask,
        QRCodeLink: url,
        partsToPrint: (prevTask?.parts ?? []).map(
          (
            part: {
              PART_NUMBER: any;
              DESCRIPTION: any;
              GROUP: any;
              TYPE: any;
              UNIT_OF_MEASURE: any;
              QUANTITY: any;
            },
            index: number
          ) => ({
            index: index + 1,
            PART_NUMBER: part.PART_NUMBER,
            DESCRIPTION: part.DESCRIPTION,
            QUANTITY: part.QUANTITY,
            UNIT_OF_MEASURE: part.UNIT_OF_MEASURE,
          })
        ),
      }));
    }
  };

  return (
    <div className="">
      <div key={order.id || order._id}>
        <QRGenerator
          valueString={String(order && order?.orderNumber)}
          onReady={handleCanvasReady}
        ></QRGenerator>
        {updatedOrder && (
          <>
            <PDFViewer
              style={{
                width: '100%',
                height: scroll ? scroll : '55vh',
                zIndex: 150,
              }}
              showToolbar={true}
            >
              <PdfParientQOrder
                data={updatedOrder}
                fieldsTypes={fieldsTypes}
              ></PdfParientQOrder>
            </PDFViewer>
          </>
        )}
      </div>
    </div>
  );
};

export default GeneretedQuotationOrder;
