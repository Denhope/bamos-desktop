import React, { FC } from "react";
import { IProjectInfo } from "@/types/TypesData";
import { PdfSmall, PdfRegular } from "../typography.components";
import { PdfView, PDFGrid } from "../wrapped-view.component";
export interface IWorckPackagePdfViewProps {
  projectData: any;
}
const WorckPackagePdfView: FC<IWorckPackagePdfViewProps> = ({
  projectData,
}) => {
  return (
    <>
      <PdfView display="flex" flexDirection="row">
        <PDFGrid
          height={13}
          pl={3}
          bg="#aaa"
          cols={1}
          borderColor="#00"
          bw={0.5}
        >
          <PdfSmall>Workpackage / Пакет</PdfSmall>
        </PDFGrid>
      </PdfView>
      <PdfView display="flex" flexDirection="row">
        <PDFGrid height={38} p={1} cols={3} borderColor="#00" bw={0.5}>
          <PdfSmall>Workpackage No. / Номер пакета</PdfSmall>
          <PdfRegular fontSize={12} fontWeight="bold" textAlign="center">
            {projectData.projectName || ""}
          </PdfRegular>
        </PDFGrid>
        <PDFGrid height={38} p={1} cols={3} borderColor="#00" bw={0.5}>
          <PdfSmall>План. Дата начала - План. Дата окончания</PdfSmall>
          <PdfRegular fontSize={12} fontWeight="bold" textAlign="center">
            {"N/A"}
          </PdfRegular>
          <PdfRegular fontSize={12}></PdfRegular>
        </PDFGrid>
        <PDFGrid height={38} p={1} cols={3} borderColor="#00" bw={0.5}>
          <PdfSmall>Maintenance Provider / Поставщик услуг ТО</PdfSmall>
          <PdfRegular fontSize={12} fontWeight="bold" textAlign="center">
            {"Minsk Civil Aviation Plant No. 407"}
          </PdfRegular>
        </PDFGrid>
      </PdfView>
    </>
  );
};

export default WorckPackagePdfView;
