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
import { PDFGrid, PdfView } from "./wrapped-view.component";
import {
  PdfHeading,
  PdfNumber,
  PdfRegular,
  PdfRegularSmall,
  PdfSmall,
} from "./typography.components";
import { PdfTable } from "./table.components";

import { IAdditionalTask } from "@/models/IAdditionalTask";
import { IProjectInfo, IProjectResponce } from "@/models/IProject";

import ActionStepPdfView from "./NRCComponents/actionStep.component";
import WorkPerfomendPdfView from "./NRCComponents/workPerfomend.component";
import HeaderPdfView from "./NRCComponents/header.Component";
import SubHeaderPdfView from "./NRCComponents/subheader.component";
import WorckPackagePdfView from "./NRCComponents/worcPackage.components";
import FooterPdfView from "./NRCComponents/footer.component";
import moment from "moment";
import { IAdditionalTaskMTBCreate } from "@/models/IAdditionalTaskMTB";
import StepPdfView from "./NRCComponents/stepNrcDescription";

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
  data: IAdditionalTaskMTBCreate;
  projectData?: IProjectResponce | null;
  fields: any;
  fieldsTypes: any;
}

export const PdfParientNRC = ({
  data,
  projectData,
  fields,
  fieldsTypes,
}: PdfPatientReportProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <HeaderPdfView data={data} />
        <SubHeaderPdfView data={data} />
        <WorckPackagePdfView projectData={projectData}></WorckPackagePdfView>

        <PdfTable
          headerFixed
          fields={fieldsTypes}
          data={(data && data?.workStepReferencesLinks) || []}
        ></PdfTable>
        <PdfView display="flex" flexDirection="column">
          <PDFGrid
            height={13}
            cols={1}
            bg="#aaa"
            borderColor="#00"
            bw={0.5}
            flexDirection="row"
          >
            {" "}
            <PdfSmall> NRC Description / Описание Дефекта </PdfSmall>
            <PDFGrid p={0} ml={"380"} flexDirection="row">
              {" "}
              <PdfSmall>
                {" "}
                {String(data?.ownerId?.name)?.trim()} (
                {data?.ownerId?.singNumber?.trim()}),{" "}
                {data.createDate &&
                  moment(data.createDate).format("Do. MMM. YYYY")}
                {}
              </PdfSmall>
            </PDFGrid>
          </PDFGrid>

          <PDFGrid cols={1} borderColor="#00" bw={0.5} pl={3}>
            <PdfRegular fontWeight="bold" fontSize={14}>
              {" "}
              {data.taskHeadLine && String(data.taskHeadLine).toUpperCase()}
            </PdfRegular>
            <PdfRegular fontSize={10}>
              {" "}
              {data.taskDescription &&
                String(data.taskDescription).toUpperCase()}
            </PdfRegular>
          </PDFGrid>
        </PdfView>
        <PdfView display="flex" flexDirection="row">
          <PDFGrid
            height={13}
            bg="#aaa"
            pl={3}
            cols={1}
            borderColor="#00"
            bw={0.5}
          >
            {" "}
            <PdfSmall>
              Qualifications / Фактические трудозатраты. Категории исполнителей
            </PdfSmall>
          </PDFGrid>
        </PdfView>
        <PdfView>
          <PDFGrid cols={1} borderColor="#00" bw={0.5}>
            <PDFGrid p={0} flexDirection="row">
              {" "}
              <PDFGrid
                height={23}
                p={1}
                cols={4}
                borderColor="#00"
                blt={0.5}
                blw={0.5}
                blb={0.5}
              >
                <PdfRegularSmall fontSize={8} fontWeight="bold">
                  Performed Scope
                </PdfRegularSmall>
                <PdfRegularSmall fontSize={8} fontWeight="bold">
                  Категория Исполнителя:
                </PdfRegularSmall>
                <PdfRegular textAlign="center">
                  {/* {step.performedSing || ''} */}
                </PdfRegular>
                {/* <PdfSmall textAlign="center">{step.performedName}</PdfSmall> */}
              </PDFGrid>
              <PDFGrid
                height={23}
                p={3}
                cols={12}
                blt={0.5}
                blr={0.5}
                blb={0.5}
                borderColor="#00"
                // bg="#aaa"
              >
                <PdfRegular textAlign="center" fontSize={9} fontWeight="bold">
                  {data?.skill?.join()}
                </PdfRegular>
              </PDFGrid>
              <PDFGrid
                height={23}
                p={1}
                cols={4}
                borderColor="#00"
                blt={0.5}
                blw={0.5}
                blb={0.5}
              >
                <PdfRegularSmall fontSize={8} fontWeight="bold">
                  Act. Man
                </PdfRegularSmall>
                <PdfRegularSmall fontSize={8} fontWeight="bold">
                  Факт. кол-во исполн.:
                </PdfRegularSmall>
              </PDFGrid>
              <PDFGrid
                height={23}
                p={3}
                cols={12}
                blt={0.5}
                blr={0.5}
                blb={0.5}
                borderColor="#00"
              >
                <></>
                {/* <PdfRegular textAlign="center" fontSize={9} fontWeight="bold">
                  {data?.skill?.join()}
                </PdfRegular> */}
              </PDFGrid>
              {/* <PDFGrid
                height={23}
                p={1}
                cols={5}
                borderColor="#00"
                blt={0.5}
                blw={0.5}
                blb={0.5}
              >
                <PdfRegularSmall fontSize={8} fontWeight="bold">
                  Est. MHRS
                </PdfRegularSmall>
                <PdfRegularSmall fontSize={8} fontWeight="bold">
                  План. трудозатраты:
                </PdfRegularSmall>
              </PDFGrid> */}
              {/* <PDFGrid
                height={23}
                p={3}
                cols={12}
                blt={0.5}
                blr={0.5}
                blb={0.5}
                borderColor="#00"
              > */}
              {/* <PdfRegular textAlign="center" fontSize={9} fontWeight="bold">
                  {data.taskId?.allTaskTime}
                </PdfRegular> */}
              {/* </PDFGrid> */}
              <PDFGrid
                height={23}
                p={1}
                cols={4}
                borderColor="#00"
                blt={0.5}
                blw={0.5}
                blb={0.5}
              >
                <PdfRegularSmall fontSize={8} fontWeight="bold">
                  Act. MHRS
                </PdfRegularSmall>
                <PdfRegularSmall fontSize={8} fontWeight="bold">
                  Факт. трудозатраты:
                </PdfRegularSmall>
              </PDFGrid>
              <PDFGrid
                height={23}
                p={3}
                cols={12}
                blt={0.5}
                // blr={0.5}
                blb={0.5}
                borderColor="#00"
              >
                <PdfRegular textAlign="center" fontSize={9} fontWeight="bold">
                  {data.optional?.finalAction?.timeUsed}
                </PdfRegular>
              </PDFGrid>
              {/* <PDFGrid
                height={23}
                p={3}
                cols={12}
                blt={0.5}
                blr={0.5}
                blb={0.5}
                borderColor="#00"
              >
                <PdfRegular textAlign="center" fontSize={9} fontWeight="bold">
                  {''}
                </PdfRegular> */}
              {/* </PDFGrid> */}
            </PDFGrid>
          </PDFGrid>
        </PdfView>
        <PdfView display="flex" flexDirection="row">
          <PDFGrid
            height={13}
            bg="#aaa"
            pl={3}
            cols={1}
            borderColor="#00"
            bw={0.5}
          >
            <PdfSmall>
              Part Request / Использованные компоненты/оборудование
            </PdfSmall>
          </PDFGrid>
        </PdfView>
        {data.materialForPrint?.length && data.materialForPrint?.length > 0 ? (
          <PdfTable
            headerFixed
            fields={fields}
            data={data.materialForPrint || []}
          ></PdfTable>
        ) : (
          <PdfView display="flex" flexDirection="row">
            <PDFGrid height={16} pl={3} cols={1} borderColor="#00" bw={0.5}>
              <PdfRegularSmall>
                See Material List
                {/* No material and part requaed / Нет материалов необходимых к
                применению{' '} */}
              </PdfRegularSmall>
            </PDFGrid>
          </PdfView>
        )}
        <StepPdfView data={data.steps} />
        {/* <ActionStepPdfView data={data} /> */}
        <WorkPerfomendPdfView data={data} />

        <PdfView display="flex" flexDirection="row">
          <PDFGrid
            height={13}
            bg="#aaa"
            cols={1}
            borderColor="#00"
            pl={3}
            bw={0.5}
          >
            <PdfSmall>Released To Service / Допуск к эксплуатации</PdfSmall>
          </PDFGrid>
        </PdfView>
        <PdfView display="flex" flexDirection="row">
          <PDFGrid height={38} cols={1} borderColor="#00" pl={3} bw={0.5}>
            <PdfRegularSmall>
              CRS for the work caried out, either for single workorder or for
              the complete workpack, to be issued in Aircraft Technical Logbook
              - for line maintenance or in MRO CRS Form - for base maintenance.
              Свидетельство о ТО ВС (единичный заказ или весь пакет) должно быть
              оформлено для Оперативного ТО - в Бортовом Журнале, для
              Периодического ТО - на бланке Свидетельства о ТО ВС Организации по
              ТО.
            </PdfRegularSmall>
          </PDFGrid>
        </PdfView>
        <PdfNumber></PdfNumber>
        <FooterPdfView />
      </Page>
    </Document>
  );
};
