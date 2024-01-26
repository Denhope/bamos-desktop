import React from 'react';
import { PdfSmall, PdfRegularSmall } from '../typography.components';
import { PDFGrid, PdfView } from '../wrapped-view.component';

const TransferPdfView = () => {
  return (
    <>
      <PDFGrid height={11} cols={1} bg="#aaa" borderColor="#00" bw={0.5}>
        <PdfSmall> Transfer / Перенос </PdfSmall>
      </PDFGrid>
      <PdfView mh={0} display="flex" flexDirection="row">
        <PDFGrid
          height={18}
          p={1}
          cols={14}
          borderColor="#00"
          bg="#aaa"
          bw={0.5}
        >
          <PdfSmall> Station Станция </PdfSmall>
        </PDFGrid>
        <PDFGrid
          height={18}
          p={1}
          cols={12}
          borderColor="#00"
          bg="#aaa"
          bw={0.5}
        >
          <PdfSmall> Date Дата</PdfSmall>
        </PDFGrid>
        <PDFGrid
          height={18}
          p={1}
          cols={12}
          borderColor="#00"
          bg="#aaa"
          bw={0.5}
        >
          <PdfSmall> TAH СНЭ,часы</PdfSmall>
        </PDFGrid>
        <PDFGrid
          height={18}
          p={1}
          cols={12}
          borderColor="#00"
          bg="#aaa"
          bw={0.5}
        >
          <PdfSmall> TAC СНЭ,циклы</PdfSmall>
        </PDFGrid>
        <PDFGrid
          height={18}
          p={1}
          cols={5}
          borderColor="#00"
          bg="#aaa"
          bw={0.5}
        >
          <PdfSmall> Days / Due Date Дни / К выполнению</PdfSmall>
        </PDFGrid>{' '}
        <PDFGrid
          height={18}
          p={1}
          cols={5}
          borderColor="#00"
          bg="#aaa"
          bw={0.5}
        >
          <PdfSmall> Hours / Due at TAH Часы / К выполнению, час.</PdfSmall>
        </PDFGrid>
        <PDFGrid
          height={18}
          p={1}
          cols={5}
          borderColor="#00"
          bg="#aaa"
          bw={0.5}
        >
          <PdfSmall> Approval No № Согласования</PdfSmall>
        </PDFGrid>
        <PDFGrid
          height={18}
          p={1}
          cols={14}
          borderColor="#00"
          bg="#aaa"
          bw={0.5}
        >
          <PdfSmall> Transfer Sign Подпись</PdfSmall>
        </PDFGrid>
        <PDFGrid
          height={18}
          p={1}
          cols={14}
          borderColor="#00"
          bg="#aaa"
          bw={0.5}
        >
          <PdfSmall> Reason Причина</PdfSmall>
        </PDFGrid>
      </PdfView>
      <PdfView mh={0} display="flex" flexDirection="row">
        <PDFGrid height={22} p={1} cols={14} borderColor="#00" bw={0.5}>
          <PdfRegularSmall>{'N/A'} </PdfRegularSmall>
        </PDFGrid>
        <PDFGrid height={22} p={1} cols={12} borderColor="#00" bw={0.5}>
          <PdfRegularSmall>{'N/A'} </PdfRegularSmall>
        </PDFGrid>
        <PDFGrid height={22} p={1} cols={12} borderColor="#00" bw={0.5}>
          <PdfRegularSmall>{'N/A'} </PdfRegularSmall>
        </PDFGrid>
        <PDFGrid height={22} p={1} cols={12} borderColor="#00" bw={0.5}>
          <PdfRegularSmall>{'N/A'} </PdfRegularSmall>
        </PDFGrid>
        <PDFGrid height={22} p={1} cols={5} borderColor="#00" bw={0.5}>
          <PdfRegularSmall>{'N/A'} </PdfRegularSmall>
        </PDFGrid>{' '}
        <PDFGrid height={22} p={1} cols={5} borderColor="#00" bw={0.5}>
          <PdfRegularSmall>{'N/A'} </PdfRegularSmall>
        </PDFGrid>
        <PDFGrid height={22} p={1} cols={5} borderColor="#00" bw={0.5}>
          <PdfRegularSmall>{'N/A'} </PdfRegularSmall>
        </PDFGrid>
        <PDFGrid height={22} p={1} cols={14} borderColor="#00" bw={0.5}>
          <PdfRegularSmall>{'N/A'} </PdfRegularSmall>
        </PDFGrid>
        <PDFGrid height={22} p={1} cols={14} borderColor="#00" bw={0.5}>
          <PdfRegularSmall>{'N/A'} </PdfRegularSmall>
        </PDFGrid>
      </PdfView>
    </>
  );
};

export default TransferPdfView;
