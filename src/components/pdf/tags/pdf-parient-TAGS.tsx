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

import {
  PdfSmall,
  PdfRegular,
  PdfRegularSmall,
  PdfNumber,
} from "../typography.components";
import { PdfView, PDFGrid, PdfHeader } from "../wrapped-view.component";
import { IPickSlipResponse } from "@/models/IPickSlip";
import moment from "moment";
import { PdfTablePickSlip } from "../table.componentsPickSlip";
import { IRemovedItemResponce } from "@/models/IRemovedItem";
import { IProjectInfo } from "@/models/IProject";
import TagsItem from "./tags.component";
import TagsItems from "./tags.component";

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
  data: IRemovedItemResponce[];

  projectData: any;
}

export const PdfParientTags = ({
  data,

  projectData,
}: PdfPatientReportProps) => {
  return (
    <Document>
      <Page size="A4">
        <TagsItems data={data} projectData={projectData}></TagsItems>
      </Page>
    </Document>
  );
};
