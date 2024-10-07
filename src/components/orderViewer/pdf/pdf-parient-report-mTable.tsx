import React, { useState } from 'react';

import {
  Text,
  Page,
  Image,
  Document,
  StyleSheet,
  Font,
  View,
} from '@react-pdf/renderer';
import { IOrder } from '@/models/IOrder';
import { PDFGrid, PdfView } from '@/components/pdf/wrapped-view.component';
import {
  PdfNumber,
  PdfRegularSmall,
} from '@/components/pdf/typography.components';

import FooterPdfView from '@/components/pdf/NRCComponents/footer.component';

import HeaderPdfView from './header.MarketingComponent';
import MarketingTextPdfView from './marketing.TextComponent';
import SignaturePdfView from './signature.MatketingComponent';
import { PdfTable } from '../table.components';

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
});
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    paddingBottom: '40pt',
    paddingTop: '20pt',
    fontFamily: 'Roboto',
  },
  image: {
    marginVertical: 15,
    marginHorizontal: 100,
  },
  wrapp: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '140',
    paddingHorizontal: 10,
    marginHorizontal: 0,
  },
});

interface PdfPatientReportProps {
  data: any;
  fieldsTypes: any;
}

export const PdfParientMTable = ({
  data,
  fieldsTypes,
}: PdfPatientReportProps) => {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <HeaderPdfView data={data?.order} />
        <MarketingTextPdfView data={data?.order}></MarketingTextPdfView>
        {data &&
          data.map((item: any, index: number) => {
            if (!item) {
              return null; // Skip this step if it's not defined
            }

            const transformedData = item.items.map((item: any, index: any) => {
              return {
                '№ П/П': `${index + 1}`,
                // Assuming you want to number the items
                '№ ОРДЕРА': item?.orderInfo
                  ? item?.orderInfo[0]?.orderNumberNew
                  : '',
                'НАИМЕНОВАНИЕ ПОСТАВЩИКА': item?.vendorInfo
                  ? item?.vendorInfo[0]?.SHORT_NAME
                  : '',
                'ЕД. ИЗМЕРЕНИЯ': item?.partNumberInfo
                  ? item?.partNumberInfo.UNIT_OF_MEASURE
                  : '',
                'КОЛ-ВО': item?.qtyQuoted || '',
                'МИН.ЗАКАЗ': item?.minQuoted || '',
                'ЦЕНА ЗА ЕД.ПРОДУКЦИЮ': item?.price || '',
                ВАЛЮТА: item?.currency || '', // You'll need to calculate or obtain this value
                'СУММА ИТОГО': item?.allPrice || '', // You'll need to calculate or obtain this value
                'УСЛОВИЯ ОПЛАТЫ': item?.paymentTerms || '',
                'СРОКИ ПОСТАВКИ': item?.leadTime || '', // You'll need to calculate or obtain this value
                'УСЛОВИЯ ПОСТАВКИ': item?.delivery || '', // You'll need to calculate or obtain this value
                ПРИМЕЧАНИЕ: item?.notes || '', // You'll need to calculate or obtain this value
              };
            });
            return (
              <PdfView
                key={index}
                mh={20}
                display="flex"
                flexDirection="column"
              >
                <PDFGrid
                  height={18}
                  cols={1}
                  bg="#aaa"
                  borderColor="#00"
                  bw={0.5}
                  flexDirection="row"
                >
                  <PdfRegularSmall>{`ТОВАР ПО ЗАПРОСУ:${
                    item?.partNumberInfo[0]?.PART_NUMBER
                  }  //${
                    item?.partNumberInfo[0]?.ADD_DESCRIPTION ||
                    item?.partNumberInfo[0]?.DESCRIPTION ||
                    ''
                  } `}</PdfRegularSmall>
                </PDFGrid>
                <PdfTable
                  key={index} // Make sure to include a key prop when mapping
                  headerFixed
                  fields={fieldsTypes}
                  data={transformedData}
                ></PdfTable>
                <PDFGrid
                  height={13}
                  cols={1}
                  bw={0.5}
                  children={undefined}
                ></PDFGrid>
              </PdfView>
            );
          })}
        <PdfRegularSmall fontSize={9}>
          {'\r\n'}
          {'\r\n'}
          {'\r\n'}
        </PdfRegularSmall>{' '}
        <SignaturePdfView data={data}></SignaturePdfView>
        <PdfNumber></PdfNumber>
        <FooterPdfView />
      </Page>
    </Document>
  );
};
