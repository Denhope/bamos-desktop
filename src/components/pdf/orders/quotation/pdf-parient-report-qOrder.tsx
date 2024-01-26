import React, { useState } from "react";

import {
  Text,
  Page,
  Image,
  Document,
  StyleSheet,
  Font,
  View,
} from "@react-pdf/renderer";
import { IOrder } from "@/models/IOrder";
import { PDFGrid, PdfView } from "@/components/pdf/wrapped-view.component";
import {
  PdfNumber,
  PdfRegular,
  PdfRegularSmall,
  PdfSmall,
} from "@/components/pdf/typography.components";
import { PdfTable } from "@/components/pdf/table.components";
import FooterPdfView from "@/components/pdf/NRCComponents/footer.component";
import SubHeaderPdfView from "@/components/pdf/NRCComponents/subheader.component";
import WorckPackagePdfView from "@/components/pdf/NRCComponents/worcPackage.components";
import moment from "moment";
import HeaderPdfView from "./header.OrderComponent";
import SignaturePdfView from "./signature.OrderComponent copy";
import OrderTextPdfView from "./orderText.OrderComponent";

Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    paddingBottom: "40pt",
    paddingTop: "20pt",
    fontFamily: "Roboto",
  },
  image: {
    marginVertical: 15,
    marginHorizontal: 100,
  },
  wrapp: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: "140",
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
});

interface PdfPatientReportProps {
  data: IOrder;
  fieldsTypes: any;
}

export const PdfParientQOrder = ({
  data,
  fieldsTypes,
}: PdfPatientReportProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <HeaderPdfView data={data} />
        {/* <SubHeaderPdfView data={data} /> */}
        <OrderTextPdfView data={data}></OrderTextPdfView>
        <PdfView display="flex" flexDirection="row">
          <PdfTable
            headerFixed
            fields={fieldsTypes}
            data={data.partsToPrint || []}
          ></PdfTable>
        </PdfView>
        <PdfRegularSmall fontSize={9}>
          {"\r\n"}
          {"\r\n"}
          {"\r\n"}
          {"\r\n"}
        </PdfRegularSmall>{" "}
        <SignaturePdfView data={data}></SignaturePdfView>
        <PdfNumber></PdfNumber>
        <FooterPdfView />
      </Page>
    </Document>
  );
};
