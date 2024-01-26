import { PdfImage } from "@/components/pdf/images.components";
import {
  PdfSmall,
  PdfRegular,
  PdfHeading,
  PdfRegularSmall,
} from "@/components/pdf/typography.components";
import {
  PDFGrid,
  PdfHeader,
  PdfView,
} from "@/components/pdf/wrapped-view.component";
import { IAdditionalTask } from "@/models/IAdditionalTask";
import { IOrder } from "@/models/IOrder";
import moment from "moment";
import React, { FC } from "react";

export interface IheaderPdfViewProps {
  data: IOrder;
}
const SignaturePdfView: FC<IheaderPdfViewProps> = ({ data }) => {
  return (
    <PdfHeader fixed>
      <PdfView display="flex" flexDirection="row">
        <PdfView display="flex" flexDirection="row">
          <PDFGrid height={98} ph={3} cols={2} bw={0}>
            <PdfRegularSmall fontSize={9}>
              THE CUSTOMER:{"\r\n"}
              Unitary Enteprise"407 Technics"{"\r\n"}
              {"\r\n"}
              __________________{"\r\n"}Position:{"\r\n"}
              {"\r\n"}Date:"______"__________________{"\r"}_________
            </PdfRegularSmall>{" "}
          </PDFGrid>
          <PDFGrid height={98} ph={3} cols={3} bw={0}>
            <></>
          </PDFGrid>
          <PDFGrid height={98} ph={3} cols={2} bw={0}>
            <PdfRegularSmall fontSize={9}>
              ПОКУПАТЕЛЬ:{"\r\n"}
              Унитарное предприятие"407 Техникс"{"\r\n"}
              {"\r\n"}
              __________________{"\r\n"}
              {"\r\n"}
              {"\r\n"}
              Дата:"______"__________________{"\r"}_________
            </PdfRegularSmall>{" "}
          </PDFGrid>
        </PdfView>
      </PdfView>
    </PdfHeader>
  );
};

export default SignaturePdfView;
