import { PDFViewer } from "@react-pdf/renderer";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { IReferencesLinkType } from "@/models/IAdditionalTask";
import { title } from "process";
import React, { FC } from "react";
import { PdfParientNRC } from "./pdf-parient-report-NRC";
import QRGenerator from "@/components/qrCode/QRGenerator";
import { setCurrentQrCodeLink } from "@/store/reducers/AdditionalTaskSlice";
import { PdfParientTags } from "./tags/pdf-parient-TAGS";

type GeneretedNRCPdfProps = { data?: any[]; projectData?: any };
const GeneretedNRCPdf: FC<GeneretedNRCPdfProps> = ({ data, projectData }) => {
  return (
    <>
      {data && (
        <PDFViewer
          style={{ width: "100%", height: "66vh", zIndex: 150 }}
          showToolbar={true}
        >
          <PdfParientTags
            data={data}
            projectData={projectData}
          ></PdfParientTags>
        </PDFViewer>
      )}
    </>
  );
};

export default GeneretedNRCPdf;
