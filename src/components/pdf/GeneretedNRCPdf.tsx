import { PDFViewer } from "@react-pdf/renderer";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { IReferencesLinkType } from "@/models/IAdditionalTask";
import { title } from "process";
import React, { FC } from "react";
import { PdfParientNRC } from "./pdf-parient-report-NRC";
import QRGenerator from "@/components/qrCode/QRGenerator";
import { setCurrentQrCodeLinkAdd } from "@/store/reducers/MtbSlice";

const fieldsTypes = [
  { title: "Type / Тип", width: 20 },
  { title: "Reference / Ссылка", width: 60 },
  { title: "Description / Описание", width: 60 },
];

// type: 'WO' | 'AMM' | 'SB';
// reference: string;
// description: string;
const GeneretedNRCPdf: FC = () => {
  const { currentProjectAdditionalTask, currentProject } = useTypedSelector(
    (state) => state.mtbase
  );
  // const { currentProject } = useTypedSelector((state) => state.projects);

  const fields = [
    //{ title: '№ п/п', width: 5 },
    { title: "Partnumber/Парт. номер", width: 30 },
    { title: "Description/Описание", width: 30 },
    { title: "QTY/Кол-во", width: 20 },
    { title: "Unit/Ед. Измер.", width: 20 },
  ];
  const QRCodeImg = document.getElementById(
    `qrGenerator-${currentProjectAdditionalTask?.additionalNumberId}`
  ) as HTMLCanvasElement;
  const QRCodeDataURL = QRCodeImg?.toDataURL() || "";
  const dispatch = useAppDispatch();
  dispatch(setCurrentQrCodeLinkAdd(QRCodeDataURL));

  return (
    <>
      {
        <QRGenerator
          valueString={String(
            currentProjectAdditionalTask &&
              currentProjectAdditionalTask?.additionalNumberId
          )}
          onReady={function (url: string | null): void {}}
        ></QRGenerator>
      }
      {currentProjectAdditionalTask && (
        <PDFViewer
          style={{ width: "100%", height: "54vh", zIndex: 150 }}
          showToolbar={true}
        >
          <PdfParientNRC
            data={currentProjectAdditionalTask}
            projectData={currentProject} // fields={undefined}
            fields={fields}
            fieldsTypes={fieldsTypes}
          ></PdfParientNRC>
        </PDFViewer>
      )}
    </>
  );
};

export default GeneretedNRCPdf;
