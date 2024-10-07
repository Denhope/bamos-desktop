import { PdfImage } from '@/components/pdf/images.components';
import {
  PdfSmall,
  PdfRegular,
  PdfHeading,
  PdfRegularSmall,
} from '@/components/pdf/typography.components';
import {
  PDFGrid,
  PdfHeader,
  PdfView,
} from '@/components/pdf/wrapped-view.component';
import { IAdditionalTask } from '@/models/IAdditionalTask';
import { IOrder } from '@/models/IOrder';
import moment from 'moment';
import React, { FC } from 'react';

export interface IheaderPdfViewProps {
  data: any;
}
const HeaderPdfView: FC<IheaderPdfViewProps> = ({ data }) => {
  return (
    <PdfHeader fixed>
      <PdfView display="flex" flexDirection="row">
        <PdfView display="flex" flexDirection="row">
          <PDFGrid height={98} ph={3} cols={2} bw={0}>
            <PdfRegularSmall fontSize={9}>
              {data.orderType === 'QUOTATION_ORDER' && ` Quotation Order №\r`}
              {data.orderType === 'PURCHASE_ORDER' && ` Purchase Order №\r`}
              {data?.orderNumberNew} dated{'\r'}
              {data?.createDate &&
                moment(data?.createDate).utc().format('DD.MM.YYYY')}{' '}
              {'\r\n'} {'\r\n'}
              {'\r\n'}Minsk, The Republic
              {'\r'}of Belarus {'\r\n'}
              {'\r\n'}
            </PdfRegularSmall>{' '}
          </PDFGrid>
          <PDFGrid height={98} ph={3} cols={3} bw={0}>
            <></>
          </PDFGrid>
          <PDFGrid height={98} ph={3} cols={2} bw={0}>
            <PdfRegularSmall fontSize={9}>
              {data.orderType === 'QUOTATION_ORDER' &&
                ` Запрос на поставку от №\r`}
              {data.orderType === 'PURCHASE_ORDER' &&
                ` Запрос на закупку от №\r`}
              {data?.createDate &&
                moment(data?.createDate).utc().format('DD.MM.YYYY')}
              {'\r'}№{'\r'}
              {data?.orderNumberNew} {'\r\n'} {'\r\n'}
              {'\r\n'}Минск, Республика
              {'\r'}Беларусь {'\r\n'}
              {'\r\n'}
            </PdfRegularSmall>{' '}
          </PDFGrid>
        </PdfView>
      </PdfView>
    </PdfHeader>
  );
};

export default HeaderPdfView;
