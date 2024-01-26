import { IAdditionalTask } from "@/models/IAdditionalTask";
import React, { FC } from "react";
import {
  PdfHeading,
  PdfRegularSmall,
  PdfSmall,
  PdfRegular,
} from "../typography.components";
import { PdfHeader, PdfView, PDFGrid } from "../wrapped-view.component";
import { PdfImage } from "../images.components";
import { IProjectTaskAll } from "@/models/IProjectTask";
import { IAdditionalTaskMTBCreate } from "@/models/IAdditionalTaskMTB";
export interface IheaderPdfViewProps {
  data: IAdditionalTaskMTBCreate;
}
const HeaderPdfView: FC<IheaderPdfViewProps> = ({ data }) => {
  return (
    <PdfHeader fixed>
      <PdfView display="flex" flexDirection="row">
        <PDFGrid height={50} p={1} cols={5} borderColor="#00" bw={0.5}>
          <PdfImage
            src="/Image.jpg"
            style={{
              width: 50,
              height: 50,
              marginLeft: 25,
            }}
          ></PdfImage>
        </PDFGrid>
        <PDFGrid height={50} p={1} cols={5} borderColor="#00" bw={0.5}>
          <PdfSmall>Customer/Заказчик</PdfSmall>
          <PdfRegular fontSize={12} textAlign="center">
            {data.plane?.companyName}
          </PdfRegular>
        </PDFGrid>
        <PDFGrid height={50} p={1} cols={5} borderColor="#00" bw={0.5}>
          <PdfSmall>WO/Заказ</PdfSmall>
          <PdfHeading textAlign="center">
            {String(data.additionalNumberId)}
          </PdfHeading>
        </PDFGrid>
        <PDFGrid height={50} p={1} cols={5} borderColor="#00" bw={0.5}>
          <PdfSmall>Barcode / Штрихкод</PdfSmall>
          <PdfImage
            src={data.QRCodeLink}
            style={{
              width: 35,
              height: 35,
              marginLeft: 35,
            }}
          ></PdfImage>
          {/* <PdfRegularSmall fontSize={10}>{data._id || ''}</PdfRegularSmall> */}
        </PDFGrid>
        <PDFGrid height={50} p={1} cols={5} borderColor="#00" bw={0.5}>
          <PdfSmall>Registration / Рег. номер</PdfSmall>
          <PdfHeading textAlign="center">
            {`${data.plane?.registrationNumber}` || ""}
          </PdfHeading>
          <PdfSmall textAlign="center" fontSize={10} fontWeight="bold">
            {String(data.plane?.type).toUpperCase() || ""}
          </PdfSmall>
        </PDFGrid>
      </PdfView>
    </PdfHeader>
  );
};

export default HeaderPdfView;
