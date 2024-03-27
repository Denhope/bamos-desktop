import { PDFViewer } from '@react-pdf/renderer';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import { IReferencesLinkType } from '@/models/IAdditionalTask';
import { title } from 'process';
import React, { FC, useRef, useEffect, useState } from 'react';

import { useGetQuotationOrderForPrintQuery } from '@/features/orderNewAdministration/ordersNewApi';
import { PdfParientQOrder } from '@/components/pdf/orders/quotation/pdf-parient-report-qOrder';

const fieldsTypes = [
  { title: 'Nr/ №', width: 9 },
  { title: 'P/N/ ПАРТИЙНЫЙ НОМЕР', width: 27 },
  { title: 'DESCRIPTION/ОПИСАНИЕ', width: 20 },
  { title: `QTY/${'\r\n'} КОЛ-ВО`, width: 15 },
  { title: `UNIT/${'\r\n'} ЕД. ИЗМЕРЕНИЯ`, width: 15 },
  { title: `TYPE/${'\r\n'} ТИП`, width: 15 },
];

export interface GeneretedQuatationOrder {
  orderID: string;
  scroll?: any;
}

const GeneretedQuotationOrder: FC<GeneretedQuatationOrder> = ({
  orderID,
  scroll,
}) => {
  const { data, isLoading, isError } =
    useGetQuotationOrderForPrintQuery(orderID);
  // const [updatedOrder, setUpdatedOrder] = useState<any | null>(order);

  // useEffect(() => {
  //   if (order) {
  //     setUpdatedOrder(order);
  //   }
  // }, [order]);

  // ... rest of your component logic

  return (
    <div className="">
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error loading order</div>}
      {orderID && <div>{orderID}</div>}
      {data && (
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
              data={data}
              fieldsTypes={fieldsTypes}
            ></PdfParientQOrder>
          </PDFViewer>
        </>
      )}
    </div>
  );
};

export default GeneretedQuotationOrder;
