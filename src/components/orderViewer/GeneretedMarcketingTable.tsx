import { PDFViewer } from '@react-pdf/renderer';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import { IReferencesLinkType } from '@/models/IAdditionalTask';
import { title } from 'process';
import React, { FC, useRef, useEffect, useState } from 'react';

import { useGetQuotationOrderForPrintQuery } from '@/features/orderNewAdministration/ordersNewApi';
import { PdfParientQOrder } from '@/components/pdf/orders/quotation/pdf-parient-report-qOrder';
import { PdfParientMTable } from './pdf/pdf-parient-report-mTable';
import {
  useGetMarketingTableQuery,
  useUpdateOrderItemMutation,
} from '@/features/orderItemsAdministration/orderItemApi';

const fieldsTypes = [
  { title: `№ П/П${'\r\n'}`, width: 4 },
  { title: `№ ОРДЕРА${'\r\n'}`, width: 4 },
  { title: `НАИМЕНОВАНИЕ${'\n'}ПОСТАВЩИКА`, width: 15 },
  { title: `ЕД.${'\n'}ИЗМЕРЕНИЯ`, width: 14 },
  { title: `КОЛ-ВО`, width: 7 },
  { title: `МИН.ЗАКАЗ`, width: 8 },
  { title: `ЦЕНА ЗА${'\n'} ЕД.`, width: 10 },
  { title: `ВАЛЮТА${'\n'}`, width: 7 },
  { title: `СУММА${'\n'}ИТОГО`, width: 10 },
  { title: `УСЛОВИЯ${'\r\n'}ОПЛАТЫ`, width: 12 },
  { title: `СРОКИ${'\r\n'}ПОСТАВКИ (ДНИ)`, width: 12 },
  { title: `УСЛОВИЯ${'\r\n'}ПОСТАВКИ`, width: 12 },
  { title: `ПРИМЕЧАНИЕ`, width: 12 },
];

export interface GeneretedQuatationOrder {
  orderIDs: React.Key[];
  scroll?: any;
}

const GeneretedMarcketingTable: FC<GeneretedQuatationOrder> = ({
  orderIDs,
  scroll,
}) => {
  // const { data, isLoading, isError } =
  //   useGetQuotationOrderForPrintQuery(orderID);
  // const [updatedOrder, setUpdatedOrder] = useState<any | null>(order);

  // useEffect(() => {
  //   if (order) {
  //     setUpdatedOrder(order);
  //   }
  // }, [order]);

  // ... rest of your component logic

  const { data: getTable } = useGetMarketingTableQuery({
    orderIDs: String(orderIDs),
  });

  return (
    <div className="">
      {
        <>
          <PDFViewer
            style={{
              width: '100%',
              height: scroll ? scroll : '65vh',
              zIndex: 150,
            }}
            showToolbar={true}
          >
            <PdfParientMTable
              data={getTable}
              fieldsTypes={fieldsTypes}
            ></PdfParientMTable>
          </PDFViewer>
        </>
      }
    </div>
  );
};

export default GeneretedMarcketingTable;
