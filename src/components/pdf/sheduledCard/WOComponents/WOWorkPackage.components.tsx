import { PdfSmall, PdfRegular } from "@/components/pdf/typography.components";
import { PdfView, PDFGrid } from "@/components/pdf/wrapped-view.component";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import { IProjectResponce } from "@/models/IProject";
import { IProjectTaskAll } from "@/models/IProjectTask";

import React, { FC } from "react";

export interface IWorkPackagePdfViewProps {
  projectData: IProjectResponce;
  currentProjectTask: any;
}
const WOWorckPackagePdfView: FC<IWorkPackagePdfViewProps> = ({
  projectData,
  currentProjectTask,
}) => {
  return (
    <>
      <PdfView display="flex" flexDirection="row">
        <PDFGrid
          height={13}
          bg="#aaa"
          pl={3}
          cols={1}
          borderColor="#00"
          bw={0.5}
        >
          <PdfSmall>Workpackage / Пакет</PdfSmall>
        </PDFGrid>
      </PdfView>
      <PdfView display="flex" flexDirection="row">
        <PDFGrid height={38} p={1} cols={3} borderColor="#00" bw={0.5}>
          <PdfSmall>Workpackage No. / Номер</PdfSmall>
          <PdfRegular fontSize={12} fontWeight="bold" textAlign="center">
            {`${currentProjectTask?.projectName}-${currentProjectTask?.WOPackageType}` ||
              ""}
          </PdfRegular>
        </PDFGrid>
        <PDFGrid height={38} p={1} cols={3} borderColor="#00" bw={0.5}>
          <PdfSmall>План. Дата начала - План. Дата окончания</PdfSmall>
          <PdfRegular textAlign="center" fontSize={12} fontWeight="bold">
            {"N/A"}
          </PdfRegular>
          <PdfRegular fontSize={12}></PdfRegular>
        </PDFGrid>
        <PDFGrid height={38} p={1} cols={3} borderColor="#00" bw={0.5}>
          <PdfSmall>Maintenance Provider / Поставщик услуг ТО</PdfSmall>
          <PdfRegular textAlign="center" fontSize={12} fontWeight="bold">
            {"Minsk Civil Aviation Plant No. 407"}
          </PdfRegular>
        </PDFGrid>
      </PdfView>
    </>
  );
};

export default WOWorckPackagePdfView;
