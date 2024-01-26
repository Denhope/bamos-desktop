import { IAdditionalTask } from "@/models/IAdditionalTask";
import React, { FC } from "react";

import {
  PdfSmall,
  PdfRegular,
  PdfRegularSmall,
  PdfHeading,
} from "@/components/pdf/typography.components";
import {
  PdfHeader,
  PdfView,
  PDFGrid,
} from "@/components/pdf/wrapped-view.component";

import { IProjectInfo, IProjectResponce } from "@/models/IProject";

import { PdfImage } from "@/components/pdf/images.components";
import { IProjectTaskAll } from "@/models/IProjectTask";
import { QRCode } from "antd";

export interface IheaderPdfViewProps {
  data: IProjectResponce;
  currentProjectTask: any;
}
const WOHeaderPdfView: FC<IheaderPdfViewProps> = ({
  data,
  currentProjectTask,
}) => {
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
            {currentProjectTask?.plane?.companyName}
          </PdfRegular>
        </PDFGrid>
        <PDFGrid height={50} p={1} cols={5} borderColor="#00" bw={0.5}>
          <PdfSmall>WO/Заказ</PdfSmall>
          <PdfHeading textAlign="center">
            {currentProjectTask.projectTaskWO || ""}
          </PdfHeading>
        </PDFGrid>
        <PDFGrid height={50} p={1} cols={5} borderColor="#00" bw={0.5}>
          <PdfSmall>Barcode / Штрихкод</PdfSmall>

          {currentProjectTask.QRCodeLink && (
            <PdfImage
              src={currentProjectTask.QRCodeLink}
              style={{
                width: 35,
                height: 35,
                marginLeft: 35,
              }}
            ></PdfImage>
          )}
          {/* <QRCode
            className="justify-items-center mx-auto"
            size={96}
            value={data.id || ''}
          /> */}
          {/* <PdfRegularSmall fontSize={10}>{data.id || ''}</PdfRegularSmall> */}
        </PDFGrid>
        <PDFGrid height={50} p={1} cols={5} borderColor="#00" bw={0.5}>
          <PdfSmall>Registration / Рег. номер</PdfSmall>
          <PdfHeading textAlign="center">
            {`${currentProjectTask?.plane?.registrationNumber}` || ""}
          </PdfHeading>
          <PdfRegular textAlign="center" fontSize={10} fontWeight="bold">
            {String(currentProjectTask?.plane?.type)?.toUpperCase() || ""}
          </PdfRegular>
        </PDFGrid>
      </PdfView>
    </PdfHeader>
  );
};

export default WOHeaderPdfView;
