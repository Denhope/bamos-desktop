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

import {
  PdfSmall,
  PdfRegular,
  PdfRegularSmall,
  PdfNumber,
} from '../typography.components';
import { PdfView, PDFGrid, PdfHeader } from '../wrapped-view.component';
import { IPickSlipResponse } from '@/models/IPickSlip';
import moment from 'moment';
import { PdfTablePickSlip } from '../table.componentsPickSlip';
import { useTranslation } from 'react-i18next';
import FooterPdfView from '../NRCComponents/footer.component';

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
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
});

interface PdfPatientReportProps {
  data: IPickSlipResponse;
  fields: any;
}

export const PdfParientPickSlipCompleted = ({
  data,
  fields,
}: PdfPatientReportProps) => {
  const { t } = useTranslation();
  return (
    <Document>
      <Page size="A4">
        <PdfHeader fixed>
          {' '}
          {/* <PdfView> */}{' '}
          <PDFGrid height={20} cols={5} children={undefined}></PDFGrid>
          <PdfView>
            {' '}
            <PdfRegular fontSize={10}>
              {' '}
              {t('MINSK CIVIL AVIATION PLANT No 407')}
            </PdfRegular>
          </PdfView>
          <PDFGrid height={20} cols={5} children={undefined}></PDFGrid>
          <PdfRegular fontWeight={'bold'} fontSize={12} textAlign="center">
            {' '}
            {`${t('PICKSLIP')} №: ${data.materialAplicationNumber}`}
          </PdfRegular>
          <PDFGrid height={20} cols={5} children={undefined}></PDFGrid>
          <PdfView display="flex" flexDirection="row">
            <PDFGrid height={15} p={1} cols={10} borderColor="#00" bw={0.5}>
              <PdfRegularSmall>{t('STORE')}</PdfRegularSmall>
            </PDFGrid>
            <PDFGrid height={15} p={1} cols={8} borderColor="#00" bw={0.5}>
              <PdfRegularSmall>{t('WORK TYPE')}</PdfRegularSmall>
              <PdfRegular fontSize={12} textAlign="center">
                {}
              </PdfRegular>
            </PDFGrid>
            <PDFGrid height={15} p={1} cols={5} borderColor="#00" bw={0.5}>
              <PdfRegularSmall>{t('DATE')}</PdfRegularSmall>
            </PDFGrid>
            <PDFGrid height={15} p={1} cols={4} borderColor="#00" bw={0.5}>
              <PdfRegularSmall>{t('NEEDED ON')}</PdfRegularSmall>
              <PdfRegular fontSize={12} textAlign="center">
                {}
              </PdfRegular>
            </PDFGrid>
            <PDFGrid height={15} p={1} cols={8} borderColor="#00" bw={0.5}>
              <PdfRegularSmall>{t('W/O')}</PdfRegularSmall>
              <PdfRegular fontSize={12} textAlign="center">
                {}
              </PdfRegular>
            </PDFGrid>
            <PDFGrid height={15} p={1} cols={8} borderColor="#00" bw={0.5}>
              <PdfRegularSmall> {t('TASK')}</PdfRegularSmall>
              <PdfRegular fontSize={12} textAlign="center">
                {}
              </PdfRegular>
            </PDFGrid>
            <PDFGrid height={15} p={1} cols={10} borderColor="#00" bw={0.5}>
              <PdfRegularSmall>{t('TYPE')}</PdfRegularSmall>
              <PdfRegular fontSize={12} textAlign="center">
                {}
              </PdfRegular>
            </PDFGrid>
            <PDFGrid height={15} p={1} cols={8} borderColor="#00" bw={0.5}>
              <PdfRegularSmall>{t('A/C NBR')}</PdfRegularSmall>
              <PdfRegular fontSize={12} textAlign="center">
                {}
              </PdfRegular>
            </PDFGrid>
          </PdfView>
          <PdfView display="flex" flexDirection="row">
            <PDFGrid height={20} p={1} cols={10} borderColor="#00" bw={0.5}>
              <PdfRegular fontSize={10} textAlign="center">
                {data.getFrom || ''}
              </PdfRegular>
            </PDFGrid>
            <PDFGrid height={20} p={1} cols={8} borderColor="#00" bw={0.5}>
              {data.additionalTaskID && (
                <PdfRegular fontSize={10} textAlign="center">
                  {t('ADD WORK')}
                </PdfRegular>
              )}
              {!data.additionalTaskID && (
                <PdfRegular fontSize={10} textAlign="center">
                  {t('MAIN WORK')}
                </PdfRegular>
              )}
            </PDFGrid>
            <PDFGrid height={20} p={1} cols={5} borderColor="#00" bw={0.5}>
              <PdfRegular fontSize={10} textAlign="center">
                {(data.createDate &&
                  moment(data.createDate).format('D.MM.YY')) ||
                  moment(data.createDate).format('D.MM.YY')}
              </PdfRegular>
            </PDFGrid>
            <PDFGrid height={20} p={1} cols={4} borderColor="#00" bw={0.5}>
              <PdfRegular fontSize={10} textAlign="center">
                {data?.neededOn || ''}
              </PdfRegular>
            </PDFGrid>
            <PDFGrid height={20} p={1} cols={8} borderColor="#00" bw={0.5}>
              <PdfRegular fontSize={10} textAlign="center">
                {data.projectWO || ''}
              </PdfRegular>
            </PDFGrid>
            <PDFGrid height={20} p={1} cols={8} borderColor="#00" bw={0.5}>
              <PdfRegular fontSize={10} textAlign="center">
                {data.projectTaskWO || data.additionalTaskID}
              </PdfRegular>
            </PDFGrid>
            <PDFGrid height={20} p={1} cols={10} borderColor="#00" bw={0.5}>
              <PdfRegular fontSize={10} textAlign="center">
                {data.planeType?.toUpperCase() || ''}
              </PdfRegular>
            </PDFGrid>
            <PDFGrid height={20} p={1} cols={8} borderColor="#00" bw={0.5}>
              <PdfRegular fontSize={10} textAlign="center">
                {data.registrationNumber?.toUpperCase() || ''}
              </PdfRegular>
            </PDFGrid>
          </PdfView>
          {/* </PdfView> */}
        </PdfHeader>
        <PdfView display="flex" flexDirection="row">
          <PDFGrid height={38} ph={3} cols={1}>
            <PdfRegularSmall fontSize={10}>{'\r\n'}</PdfRegularSmall>
          </PDFGrid>
        </PdfView>

        <PdfTablePickSlip
          headerFixed
          fields={fields}
          data={
            (data && data?.materials
              ? data?.materials
                  ?.filter((item: any) => item?.PN && item?.QUANTITY_BOOK)
                  .map((item: any) => {
                    return {
                      LOCAL_ID: item?.foRealese?.LOCAL_ID || '',
                      PART_NUMBER: item?.foRealese?.PART_NUMBER || '',
                      NAME_OF_MATERIAL: item?.foRealese?.NAME_OF_MATERIAL || '',
                      QUANTITY: item?.QUANTITY_BOOK
                        ? item?.QUANTITY_BOOK
                        : item?.onBlock[0]?.QUANTITY || '',
                      UNIT_OF_MEASURE: item?.foRealese?.UNIT_OF_MEASURE || '',
                      SUPPLIER_BATCH_NUMBER:
                        item?.foRealese?.SUPPLIER_BATCH_NUMBER || '',
                      SERIAL_NUMBER: item?.foRealese?.SERIAL_NUMBER || '',
                      SHELF_NUMBER: item?.foRealese?.SHELF_NUMBER,
                      NOTE: '',
                    };
                  })
              : []) || []
          }
        ></PdfTablePickSlip>
        <FooterPdfView />
      </Page>
    </Document>
  );
};
