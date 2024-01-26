import { IAdditionalTask } from "@/models/IAdditionalTask";
import React, { FC } from "react";
import { PdfSmall, PdfRegular } from "../typography.components";
import { PdfView, PDFGrid } from "../wrapped-view.component";
import { IAdditionalTaskMTBCreate } from "@/models/IAdditionalTaskMTB";
export interface IsubHeaderPdfViewProps {
  data: IAdditionalTaskMTBCreate;
}
const SubHeaderPdfView: FC<IsubHeaderPdfViewProps> = ({ data }) => {
  return (
    <PdfView display="flex" flexDirection="row">
      <PDFGrid height={45} p={1} cols={5} borderColor="#00" bw={0.5}>
        <PdfSmall>Type / Тип</PdfSmall>
        <PdfRegular textAlign="center">
          {data.taskType == "CABIN" ? <>C</> : ""}
          {data.taskType == "MAINT" ? <>M</> : ""}
          {data.taskType == "PIREP" ? <>P</> : ""}
        </PdfRegular>
        <PdfSmall textAlign="center">
          {data.taskType == "CABIN" ? <>CABIN</> : ""}
          {data.taskType == "MAINT" ? <>MAINT</> : ""}
          {data.taskType == "PIREP" ? <>PIREP</> : ""}
        </PdfSmall>
      </PDFGrid>
      <PDFGrid height={45} p={1} cols={5} borderColor="#00" bw={0.5}>
        <PdfSmall>ATA</PdfSmall>
        <PdfRegular textAlign="center">
          {data?.ata ? data?.ata : "N/A"}
        </PdfRegular>
        <PdfRegular>{}</PdfRegular>
      </PDFGrid>
      <PDFGrid height={45} p={1} cols={5} borderColor="#00" bw={0.5}>
        <PdfSmall>Position / Позиция</PdfSmall>
        <PdfRegular textAlign="center">
          {data?.position ? data?.position : "N/A"}
        </PdfRegular>
      </PDFGrid>
      <PDFGrid height={45} p={1} cols={5} borderColor="#00" bw={0.5}>
        <PdfSmall>Zone / Зона</PdfSmall>
        <PdfRegular textAlign="center">
          {data?.zoneNbr ? data?.zoneNbr : "N/A"}
        </PdfRegular>
        <PdfSmall>{data?.zone ? data?.zone : ""}</PdfSmall>
      </PDFGrid>
      <PDFGrid height={45} p={1} cols={5} borderColor="#00" bw={0.5}>
        <PdfSmall>Area / Область</PdfSmall>
        <PdfRegular textAlign="center">
          {data?.area ? data?.area : "N/A"}
        </PdfRegular>
        <PdfSmall>{}</PdfSmall>
      </PDFGrid>
    </PdfView>
  );
};

export default SubHeaderPdfView;
