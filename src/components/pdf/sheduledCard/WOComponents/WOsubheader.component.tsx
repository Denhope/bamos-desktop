import React, { FC } from "react";

import { IProjectTaskAll } from "@/models/IProjectTask";
import { PdfSmall, PdfRegular } from "@/components/pdf/typography.components";
import { PdfView, PDFGrid } from "@/components/pdf/wrapped-view.component";
export interface IsubHeaderPdfViewProps {
  data: IProjectTaskAll;
}
const SubHeaderPdfView: FC<IsubHeaderPdfViewProps> = ({ data }) => {
  return (
    <PdfView display="flex" flexDirection="row">
      <PDFGrid height={45} p={1} cols={5} borderColor="#00" bw={0.5}>
        <PdfSmall>Type / Тип</PdfSmall>
        <PdfRegular textAlign="center">
          {data.taskType == "routine" ||
          data.taskType == "sheduled" ||
          data.taskType == "additional" ||
          data.taskType == "hardTime" ||
          data.taskType == "addHock" ? (
            <>S</>
          ) : (
            ""
          )}
        </PdfRegular>
        <PdfSmall textAlign="center">
          {data.taskType == "routine" ||
          data.taskType == "additional" ||
          data.taskType == "hardTime" ||
          data.taskType == "sheduled" ||
          data.taskType == "addHock" ? (
            <>SCHED</>
          ) : (
            ""
          )}
        </PdfSmall>
      </PDFGrid>
      <PDFGrid height={45} p={1} cols={5} borderColor="#00" bw={0.5}>
        <PdfSmall>ATA</PdfSmall>
        <PdfRegular textAlign="center">
          {data.taskId?.amtossNewRev && data.taskId?.amtossNewRev.length > 24
            ? data.taskId?.amtossNewRev.slice(6, 8)
            : "N/A"}
        </PdfRegular>
        <PdfRegular>{}</PdfRegular>
      </PDFGrid>
      <PDFGrid height={45} p={1} cols={5} borderColor="#00" bw={0.5}>
        <PdfSmall>Position / Позиция</PdfSmall>
        <PdfRegular fontSize={12} textAlign="center">
          {data.optional?.position || "N/A"}
        </PdfRegular>
      </PDFGrid>
      <PDFGrid height={45} p={1} cols={5} borderColor="#00" bw={0.5}>
        <PdfSmall>Zone / Зона</PdfSmall>
        <PdfRegular fontSize={13} textAlign="center">
          {data?.area ? data?.area : "N/A"}
        </PdfRegular>
        <PdfSmall>
          {" "}
          {data?.zonesArr ? data?.zonesArr[0]?.subZone : "N/A"}
        </PdfSmall>
      </PDFGrid>
      <PDFGrid height={45} p={1} cols={5} borderColor="#00" bw={0.5}>
        <PdfSmall>Area / Область</PdfSmall>
        <PdfRegular textAlign="center">
          {data?.zonesArr ? data?.zonesArr[0]?.majoreZoneShort : "N/A"}
        </PdfRegular>
        <PdfSmall>
          {" "}
          {data?.zonesArr ? data?.zonesArr[0]?.majoreZone : ""}
        </PdfSmall>
      </PDFGrid>
    </PdfView>
  );
};

export default SubHeaderPdfView;
