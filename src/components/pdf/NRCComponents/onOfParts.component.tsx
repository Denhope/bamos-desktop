import React from 'react';
import { PdfRegularSmall, PdfSmall } from '../typography.components';
import { PDFGrid, PdfView } from '../wrapped-view.component';

const OnOfPartsView = () => {
  return (
    <>
      {' '}
      <PdfView mh={0} display="flex" flexDirection="row">
        <PDFGrid
          height={18}
          p={1}
          cols={7}
          borderColor="#00"
          bg="#aaa"
          bw={0.5}
        >
          <PdfSmall>PN Off ПН снят</PdfSmall>
        </PDFGrid>
        <PDFGrid
          height={18}
          p={1}
          cols={7}
          borderColor="#00"
          bg="#aaa"
          bw={0.5}
        >
          <PdfSmall>SN Off СН снят</PdfSmall>
        </PDFGrid>
        <PDFGrid
          height={18}
          p={1}
          cols={14}
          borderColor="#00"
          bg="#aaa"
          bw={0.5}
        >
          <PdfSmall>Label Бирка</PdfSmall>
        </PDFGrid>
        <PDFGrid
          height={18}
          p={1}
          cols={14}
          borderColor="#00"
          bg="#aaa"
          bw={0.5}
        >
          <PdfSmall>Position Позиция</PdfSmall>
        </PDFGrid>
        <PDFGrid
          height={18}
          p={1}
          cols={7}
          borderColor="#00"
          bg="#aaa"
          bw={0.5}
        >
          <PdfSmall>PN On ПН устан</PdfSmall>
        </PDFGrid>{' '}
        <PDFGrid
          height={18}
          p={1}
          cols={7}
          borderColor="#00"
          bg="#aaa"
          bw={0.5}
        >
          <PdfSmall>SN On СН устан</PdfSmall>
        </PDFGrid>
        <PDFGrid
          height={18}
          p={1}
          cols={7}
          borderColor="#00"
          bg="#aaa"
          bw={0.5}
        >
          <PdfSmall>Description Описание</PdfSmall>
        </PDFGrid>
        <PDFGrid
          height={18}
          p={1}
          cols={7}
          borderColor="#00"
          bg="#aaa"
          bw={0.5}
        >
          <PdfSmall>Certificate Сертификат</PdfSmall>
        </PDFGrid>
      </PdfView>
      <PdfView mh={0} display="flex" flexDirection="row">
        <PDFGrid height={22} p={1} cols={7} borderColor="#00" bw={0.5}>
          <PdfRegularSmall>{'N/A'} </PdfRegularSmall>
        </PDFGrid>
        <PDFGrid height={22} p={1} cols={7} borderColor="#00" bw={0.5}>
          <PdfRegularSmall>{'N/A'} </PdfRegularSmall>
        </PDFGrid>
        <PDFGrid height={22} p={1} cols={14} borderColor="#00" bw={0.5}>
          <PdfRegularSmall>{'N/A'} </PdfRegularSmall>
        </PDFGrid>{' '}
        <PDFGrid height={22} p={1} cols={14} borderColor="#00" bw={0.5}>
          <PdfRegularSmall>{'N/A'} </PdfRegularSmall>
        </PDFGrid>
        <PDFGrid height={22} p={1} cols={7} borderColor="#00" bw={0.5}>
          <PdfRegularSmall>{'N/A'} </PdfRegularSmall>
        </PDFGrid>
        <PDFGrid height={22} p={1} cols={7} borderColor="#00" bw={0.5}>
          <PdfRegularSmall>{'N/A'} </PdfRegularSmall>
        </PDFGrid>
        <PDFGrid height={22} p={1} cols={7} borderColor="#00" bw={0.5}>
          <PdfRegularSmall>{'N/A'} </PdfRegularSmall>
        </PDFGrid>
        <PDFGrid height={22} p={1} cols={7} borderColor="#00" bw={0.5}>
          <PdfRegularSmall>{'N/A'} </PdfRegularSmall>
        </PDFGrid>
      </PdfView>
    </>
  );
};

export default OnOfPartsView;
