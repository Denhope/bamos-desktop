import { IProjectInfo, IProjectResponce } from "@/models/IProject";
import { IRemovedItemResponce } from "@/models/IRemovedItem";
import React, { FC } from "react";
import {
  PdfRegularSmall,
  PdfSmall,
  PdfHeading,
  PdfRegular,
} from "../typography.components";
import { PDFGrid, PdfView } from "../wrapped-view.component";
import moment from "moment";
export interface ITagsItemPdfViewProps {
  data: IRemovedItemResponce[];
  projectData: IProjectResponce;
}
const TagsItems: FC<ITagsItemPdfViewProps> = ({ data, projectData }) => {
  return (
    <div>
      {data.map((tag: IRemovedItemResponce) => (
        <PdfView display="flex" flexDirection="column">
          {/* <PDFGrid cols={1} borderColor="#00" bw={0.5} pl={0}> */}{" "}
          <PDFGrid
            height={25}
            cols={1}
            // bg="#aaa"
            borderColor="#00"
            bw={0.5}
            mt={20}
            flexDirection="row"
          >
            {" "}
            <PdfSmall fontSize={12} textAlign="center">
              {" "}
              Ярлык Идентификационный{" "}
            </PdfSmall>
            {/* <PdfSmall> Description Step / Описание </PdfSmall> */}
            <PDFGrid p={0} ml={"380"} flexDirection="row">
              {" "}
              <PdfSmall>
                {" "}
                {/* {step.performedName && step.performedSing && step.performedDate
                  ? `${step.performedName} (${step.performedSing}), ${step.performedDate}` */}
                {/* : ''} */}
              </PdfSmall>
            </PDFGrid>
          </PDFGrid>
          {/* </PDFGrid> */}
          <PDFGrid cols={1} borderColor="#00" bw={0.5} pl={0}>
            <PdfRegular fontSize={5}></PdfRegular>
            <PDFGrid p={0} flexDirection="row">
              {" "}
              <PDFGrid height={26} p={1} cols={2} borderColor="#00" bw={0.5}>
                <PdfSmall>Cсылка на документ</PdfSmall>
                <PdfSmall fontSize={12} textAlign="center">
                  {tag?.referenceSum
                    ? tag.referenceSum.slice(0, 5).join() +
                      (tag.referenceSum.length > 5 ? "..." : "")
                    : ""}
                </PdfSmall>
              </PDFGrid>
              <PDFGrid height={26} p={1} cols={2} borderColor="#00" bw={0.5}>
                <PdfSmall>Ссылка на пакет рабочей документации</PdfSmall>
                <PdfRegular fontSize={12} textAlign="center">
                  {projectData.projectName || ""}
                </PdfRegular>
              </PDFGrid>
            </PDFGrid>
          </PDFGrid>
          <PDFGrid cols={1} borderColor="#00" bw={0.5} pl={0}>
            <PDFGrid p={0} flexDirection="row">
              {" "}
              <PDFGrid height={26} p={1} cols={3} borderColor="#00" bw={0.5}>
                <PdfSmall>Заказчик</PdfSmall>

                <PdfSmall fontSize={12} textAlign="center">
                  {projectData.companyName || ""}
                </PdfSmall>
              </PDFGrid>
              <PDFGrid height={26} p={1} cols={3} borderColor="#00" bw={0.5}>
                <PdfSmall>Тип ВС</PdfSmall>
                <PdfRegular fontSize={12} textAlign="center">
                  {projectData.planeType?.toUpperCase() || ""}
                </PdfRegular>
              </PDFGrid>
              <PDFGrid height={26} p={1} cols={3} borderColor="#00" bw={0.5}>
                <PdfSmall>Регистрационный номер ВС</PdfSmall>
                <PdfRegular textAlign="center">
                  {projectData.planeNumber || ""}
                </PdfRegular>
              </PDFGrid>
            </PDFGrid>
          </PDFGrid>
          <PDFGrid cols={1} borderColor="#00" bw={0.5} pl={0}>
            <PDFGrid p={0} flexDirection="row">
              {" "}
              <PDFGrid height={26} p={1} cols={1} borderColor="#00" bw={0.5}>
                <PdfSmall>Описание</PdfSmall>
                <PdfRegular fontSize={12} textAlign="center">
                  {tag?.removeItem?.description.toUpperCase() || ""}
                </PdfRegular>
              </PDFGrid>
            </PDFGrid>
          </PDFGrid>
          <PDFGrid cols={1} borderColor="#00" bw={0.5} pl={0}>
            <PDFGrid p={0} flexDirection="row">
              {" "}
              <PDFGrid height={26} p={1} cols={1} borderColor="#00" bw={0.5}>
                <PdfSmall>Чертежный номер</PdfSmall>
                <PdfSmall fontSize={12} textAlign="center">
                  {String(tag?.removeItem?.accessNbr).toUpperCase() || ""}
                </PdfSmall>
              </PDFGrid>
              <PDFGrid height={26} p={1} cols={2} borderColor="#00" bw={0.5}>
                <PdfSmall>Серийный номер</PdfSmall>
                <PdfRegular fontSize={12} textAlign="center">
                  {tag?.removeItem?.serialNbr || ""}
                </PdfRegular>
              </PDFGrid>
            </PDFGrid>
          </PDFGrid>
          <PDFGrid cols={1} borderColor="#00" bw={0.5} pl={0}>
            <PdfRegular fontSize={5}></PdfRegular>
            <PDFGrid p={0} flexDirection="row">
              {" "}
              <PDFGrid height={26} p={1} cols={1} borderColor="#00" bw={0.5}>
                <PdfSmall>Зона</PdfSmall>
                <PdfRegular fontSize={12} textAlign="center">
                  {tag?.removeItem?.zone || ""}
                </PdfRegular>
              </PDFGrid>{" "}
              <PDFGrid height={26} p={1} cols={1} borderColor="#00" bw={0.5}>
                <PdfSmall>Область</PdfSmall>
                <PdfRegular fontSize={12} textAlign="center">
                  {tag?.removeItem?.subZone || ""}
                </PdfRegular>
              </PDFGrid>{" "}
              <PDFGrid height={26} p={1} cols={1} borderColor="#00" bw={0.5}>
                <PdfSmall>Позиция</PdfSmall>
                <PdfRegular fontSize={12} textAlign="center">
                  {tag?.removeItem?.position || ""}
                </PdfRegular>
              </PDFGrid>
            </PDFGrid>
          </PDFGrid>
          <PDFGrid cols={1} borderColor="#00" bw={0.5} pl={0}>
            <PdfRegular fontSize={5}></PdfRegular>
            <PDFGrid p={0} flexDirection="row">
              {" "}
              <PDFGrid height={26} p={1} cols={1} borderColor="#00" bw={0.5}>
                <PdfSmall>Штамп персонала либо номер штампа и подпись</PdfSmall>

                <PdfSmall fontSize={12} textAlign="center">
                  {tag?.removeMan?.removeName &&
                    `${tag?.removeMan?.removeName}  (${tag?.removeMan?.removedSing})`}
                </PdfSmall>
              </PDFGrid>
              <PDFGrid height={26} p={1} cols={2} borderColor="#00" bw={0.5}>
                <PdfSmall>Дата</PdfSmall>
                <PdfRegular fontSize={12} textAlign="center">
                  {tag.removeDate &&
                    moment(tag.removeDate).format("Do. MMM. YYYY")}
                </PdfRegular>
              </PDFGrid>
            </PDFGrid>
          </PDFGrid>
        </PdfView>
      ))}
    </div>
  );
};

export default TagsItems;
