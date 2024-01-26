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
const OrderTextPdfView: FC<IheaderPdfViewProps> = ({ data }) => {
  return (
    <PdfView>
      <PdfView display="flex" flexDirection="column">
        <PDFGrid height={30} ph={3} cols={1} bw={0}>
          <PdfRegularSmall fontSize={9}>{"\r\n"}</PdfRegularSmall>{" "}
          <PdfRegularSmall fontSize={9}>
            {(data?.orderText && data?.orderText) || ""}
          </PdfRegularSmall>{" "}
        </PDFGrid>
      </PdfView>
    </PdfView>
  );
};

export default OrderTextPdfView;
