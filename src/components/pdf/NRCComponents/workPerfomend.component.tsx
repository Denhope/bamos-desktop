import moment from 'moment';
import React, { FC } from 'react';
import { PdfSmall, PdfRegular } from '../typography.components';
import { PdfView, PDFGrid } from '../wrapped-view.component';

export interface IWorkPerfomendPdfViewProps {
  data: any;
}
const WorkPerfomendPdfView: FC<IWorkPerfomendPdfViewProps> = ({ data }) => {
  return (
    <>
      <PdfView display="flex" flexDirection="row">
        <PDFGrid
          height={13}
          bg="#aaa"
          cols={1}
          pl={3}
          borderColor="#00"
          bw={0.5}
        >
          <PdfSmall>
            Work Performed Workorder Closed / Работа выполнена Заказ закрыт
          </PdfSmall>
        </PDFGrid>
      </PdfView>
      <PdfView display="flex" flexDirection="row">
        {data.isDoubleInspectionRequired ? (
          <>
            <PDFGrid height={43} p={1} cols={6} borderColor="#00" bw={0.5}>
              <PdfSmall>Date(UTC) / Дата (UTC)</PdfSmall>
              <PdfRegular textAlign="center" fontSize={12}>
                {(data?.finalAction?.closingDate ||
                  data?.optional?.finalAction?.closingDate) &&
                  moment(
                    data?.optional?.finalAction?.closingDate ||
                      data?.finalAction?.closingDate
                  ).format('Do. MMM. YYYY, HH:mm')}
              </PdfRegular>
            </PDFGrid>
            <PDFGrid height={43} p={1} cols={6} borderColor="#00" bw={0.5}>
              <PdfSmall>TAH СНЭ,часы</PdfSmall>
              <PdfRegular textAlign="center">{'N/A'}</PdfRegular>
            </PDFGrid>
            <PDFGrid height={43} p={1} cols={6} borderColor="#00" bw={0.5}>
              <PdfSmall>TAC СНЭ,циклы</PdfSmall>
              <PdfRegular textAlign="center">{'N/A'}</PdfRegular>
            </PDFGrid>

            <PDFGrid height={43} p={1} cols={6} borderColor="#00" bw={0.5}>
              <PdfSmall>Place / Station Место / Станция</PdfSmall>
              <PdfRegular textAlign="center">MSQ</PdfRegular>
            </PDFGrid>
            <PDFGrid height={43} p={1} cols={6} borderColor="#00" bw={0.5}>
              <PdfSmall>Closing Sign/Закрыл(Подпись/Штамп)</PdfSmall>
              <PdfRegular textAlign="center">
                {
                  // data?.optional?.finalAction?.createUser.createSing ||
                  data?.finalAction?.createUser.createSing
                }
              </PdfRegular>
              <PdfSmall>
                {
                  data?.finalAction?.createUser.createName
                  // optional?.finalAction?.createUser.createName
                }
              </PdfSmall>
            </PDFGrid>
            <PDFGrid height={43} p={1} cols={6} borderColor="#00" bw={0.5}>
              <PdfSmall>Double Inspection / Двойной контроль</PdfSmall>
              <PdfRegular textAlign="center" fontWeight="bold">
                {data.optional?.finalAction?.DIClosingSing}
              </PdfRegular>
              <PdfSmall>
                {data?.optional?.finalAction?.DIClosingName ||
                  data?.finalAction?.DIClosingName}
              </PdfSmall>
            </PDFGrid>
          </>
        ) : (
          <>
            <PDFGrid height={43} p={1} cols={5} borderColor="#00" bw={0.5}>
              <PdfSmall fontSize={6}>
                Date/time(UTC) / Дата/время (UTC)
              </PdfSmall>
              <PdfRegular textAlign="center" fontSize={12}>
                {(data?.finalAction?.closingDate ||
                  data?.optional?.finalAction?.closingDate) &&
                  moment(
                    data?.finalAction?.closingDate ||
                      data?.optional?.finalAction?.closingDate
                  )
                    .utc()
                    .format('Do. MMM. YYYY, HH:mm')}
              </PdfRegular>
            </PDFGrid>
            <PDFGrid height={43} p={1} cols={5} borderColor="#00" bw={0.5}>
              <PdfSmall fontSize={6}>TAH СНЭ,часы</PdfSmall>
              <PdfRegular textAlign="center">{'N/A'}</PdfRegular>
            </PDFGrid>
            <PDFGrid height={43} p={1} cols={5} borderColor="#00" bw={0.5}>
              <PdfSmall fontSize={6}>TAC СНЭ,циклы</PdfSmall>
              <PdfRegular textAlign="center">{'N/A'}</PdfRegular>
            </PDFGrid>
            <PDFGrid height={43} p={1} cols={5} borderColor="#00" bw={0.5}>
              <PdfSmall fontSize={6}>Place / Station Место / Станция</PdfSmall>
              <PdfRegular textAlign="center">MSQ</PdfRegular>
            </PDFGrid>
            <PDFGrid height={43} p={1} cols={5} borderColor="#00" bw={0.5}>
              <PdfSmall fontSize={6}>
                Closing Sign/Stamp Закрыл (Подп./Штамп)
              </PdfSmall>
              <PdfRegular textAlign="center" fontWeight="bold">
                {data?.finalAction?.createUser.createSing ||
                  data?.optional?.finalAction?.closingSing}
              </PdfRegular>
              <PdfSmall textAlign="center">
                {data?.finalAction?.createUser.createName ||
                  data?.optional?.finalAction?.closingName}
              </PdfSmall>
            </PDFGrid>
          </>
        )}
      </PdfView>{' '}
    </>
  );
};

export default WorkPerfomendPdfView;
