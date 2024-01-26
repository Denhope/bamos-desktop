import React, { useState } from "react";

import {
  Page,
  Document,
  StyleSheet,
  Font,
  PDFViewer,
} from "@react-pdf/renderer";
import { PDFGrid, PdfView } from "./wrapped-view.component";
import {
  PdfNumber,
  PdfRegular,
  PdfRegularSmall,
  PdfSmall,
} from "./typography.components";
import { PdfTable } from "./table.components";
import ActionStepPdfView from "./NRCComponents/actionStep.component";
import moment from "moment";
import FooterPdfView from "./sheduledCard/WOComponents/WOfooter.component";
import SubHeaderPdfView from "./sheduledCard/WOComponents/WOsubheader.component";
import WorkPerfomendPdfView from "./NRCComponents/workPerfomend.component";
import WOHeaderPdfView from "./sheduledCard/WOComponents/WOheader.Component";
import WOWorckPackagePdfView from "./sheduledCard/WOComponents/WOWorkPackage.components";
import { IProjectTaskAll } from "@/models/IProjectTask";
import { IMatData, IPanelDTO, IPanelDTO1 } from "@/types/TypesData";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import { setCurrentProjectTask } from "@/store/reducers/ProjectTaskSlise";
import { IAdditionalTask } from "@/models/IAdditionalTask";
import WoAsscces from "./sheduledCard/WOComponents/WoAsscces.component";

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
  data: any;
  projectData: any;
  fields: any;
  fieldsTypes: any;
  fieldsMat: any;
  allMaterials: IMatData[];
  fieldsInstrument: any;
  fieldAccess: any;
  fieldZones: any;
  fieldNotIncludeAccess: any;
}

export const PdfParientWO = ({
  data,
  projectData,
  fieldsTypes,
  fieldsMat,
  fields,
  fieldsInstrument,
  fieldAccess,
  fieldZones,
  fieldNotIncludeAccess,
}: PdfPatientReportProps) => {
  const dataArr: any[] = [2];

  return (
    <Document title={String(data.projectTaskWO)}>
      <Page size="A4" style={styles.page}>
        <WOHeaderPdfView currentProjectTask={data} data={projectData} />
        <SubHeaderPdfView data={data} />
        <WOWorckPackagePdfView
          projectData={projectData}
          currentProjectTask={data}
        ></WOWorckPackagePdfView>
        <PdfTable
          headerFixed
          fields={fieldsTypes}
          data={
            (data &&
              data.workStepReferencesLinks &&
              data.workStepReferencesLinks.flat(10)) ||
            []
          }
        ></PdfTable>
        *{" "}
        <PdfView display="flex" flexDirection="column">
          <PDFGrid
            height={13}
            cols={1}
            bg="#aaa"
            borderColor="#00"
            bw={0.5}
            pl={3}
            flexDirection="row"
          >
            <PdfSmall> Description Step / Описание </PdfSmall>
            <PDFGrid p={0} ml={"380"} flexDirection="row">
              {" "}
              <PdfSmall>
                {" "}
                {data.createUserName?.name || localStorage.getItem("name")} (
                {data.createUserName?.sing ||
                  localStorage.getItem("singNumber")}
                ),
                {"   "}
                {data.createDate &&
                  moment(data.createDate).format("Do. MMM. YYYY")}
                {}
              </PdfSmall>
            </PDFGrid>
          </PDFGrid>

          <PDFGrid cols={1} borderColor="#00" bw={0.5} pl={3}>
            <PDFGrid cols={1} borderColor="#00" pl={0} flexDirection="row">
              {" "}
              <PdfRegular fontWeight="bold">{data.taskNumber}</PdfRegular>
              <PDFGrid
                cols={1}
                borderColor="#00"
                pl={0}
                ml="515"
                flexDirection="row"
              >
                <PdfRegular style={{ marginLeft: "10" }} fontWeight="bold">
                  {data?.code}
                </PdfRegular>
              </PDFGrid>
            </PDFGrid>

            <PdfRegular fontSize={10} fontWeight="bold">
              {data?.taskDescription}
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
              Planning Qualifications / Плановые трудозатраты. Категории
              исполнителей
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
                cols={5}
                borderColor="#00"
                blt={0.5}
                blw={0.5}
                blb={0.5}
              >
                <PdfRegularSmall fontSize={8} fontWeight="bold">
                  Inspection Scope
                </PdfRegularSmall>
                <PdfRegularSmall fontSize={8} fontWeight="bold">
                  Категория инспектора:
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
                  {(data?.inspectionScope &&
                    data?.inspectionScope.length &&
                    data?.inspectionScope.length > 0 &&
                    data?.inspectionScope[0].inspectionScope) ||
                    ""}
                </PdfRegular>
              </PDFGrid>
              <PDFGrid
                height={23}
                p={1}
                cols={5}
                borderColor="#00"
                blt={0.5}
                blw={0.5}
                blb={0.5}
              >
                <PdfRegularSmall fontSize={8} fontWeight="bold">
                  Est. Man
                </PdfRegularSmall>
                <PdfRegularSmall fontSize={8} fontWeight="bold">
                  План. кол-во исполн.:
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
                <PdfRegular textAlign="center" fontSize={9} fontWeight="bold">
                  {data?.workerNumber}
                </PdfRegular>
              </PDFGrid>
              <PDFGrid
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
                <PdfRegular textAlign="center" fontSize={9} fontWeight="bold">
                  {data?.allTaskTime}
                </PdfRegular>
              </PDFGrid>
              <PDFGrid
                height={23}
                p={1}
                cols={5}
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
              <PDFGrid
                height={23}
                p={3}
                cols={12}
                blt={0.5}
                blr={0.5}
                blb={0.5}
                borderColor="#00"
              >
                <PdfRegular textAlign="center" fontSize={9} fontWeight="bold">
                  {""}
                </PdfRegular>
              </PDFGrid>
            </PDFGrid>
          </PDFGrid>
        </PdfView>
        <WoAsscces
          data={data}
          fieldAccess={fieldAccess}
          fieldZones={fieldZones}
          fieldNotIncludeAccess={fieldNotIncludeAccess}
        ></WoAsscces>
        <PdfView display="flex" flexDirection="row">
          <PDFGrid
            height={13}
            bg="#aaa"
            cols={1}
            pl={3}
            borderColor="#00"
            bw={0.5}
          >
            <PdfSmall>Part Request / Необходимые материалы</PdfSmall>
          </PDFGrid>
        </PdfView>
        {data.materialForPrint && data.materialForPrint.length > 0 ? (
          <PdfTable
            headerFixed
            fields={fields}
            data={data.materialForPrint || []}
          ></PdfTable>
        ) : (
          <PdfView display="flex" flexDirection="row">
            <PDFGrid height={16} cols={1} pl={3} borderColor="#00" bw={0.5}>
              <PdfRegularSmall>
                See Material list
                {/* No material and part requaed / Нет материалов необходимых к
                применению{' '} */}
              </PdfRegularSmall>
            </PDFGrid>
          </PdfView>
        )}
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
            <PdfSmall>Instrument Request / Необходимый инструмент</PdfSmall>
          </PDFGrid>
        </PdfView>
        {data.instrument && data.instrument.length > 0 ? (
          <PdfTable
            headerFixed
            fields={fieldsInstrument}
            data={data.instrument}
          ></PdfTable>
        ) : (
          <PdfView display="flex" flexDirection="row">
            <PDFGrid height={16} cols={1} pl={3} borderColor="#00" bw={0.5}>
              <PdfRegularSmall>
                No instrument requaed / Нет инструмента необходимого к
                применению{" "}
              </PdfRegularSmall>
            </PDFGrid>
          </PdfView>
        )}
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
            <PdfSmall>{""}</PdfSmall>
          </PDFGrid>
        </PdfView>
        <PdfView display="flex" flexDirection="row">
          <PDFGrid height={38} ph={3} cols={1} borderColor="#00" bw={0.5}>
            <PdfRegularSmall>
              I HEREBY CERTIFY THAT ALL CAUTIONS AND WARNINGS HAVE BEEN READ AND
              THE WORK HAS BEEN CARRIED OUT IN ACCORDANCE WITH ALL LAYED DOWN
              PROCEDURES AND ATTACHED NOTES AND INFORMATION. НАСТОЯЩИМ
              УТВЕРЖДАЮ, ЧТО ВСЕ ПРЕДУПРЕЖДЕНИЯ И ПРЕДОСТЕРЕЖЕНИЯ ИЗУЧЕНЫ.
              РАБОТА ВЫПОЛНЕНА В СООТВЕТСТВИИ СО ВСЕМИ ПРИЛОЖЕННЫМИ
              ИНСТРУКЦИЯМИ.
            </PdfRegularSmall>
          </PDFGrid>
        </PdfView>
        <ActionStepPdfView data={data} stepIndex={0} />
        <WorkPerfomendPdfView data={data} />
        <PdfView display="flex" flexDirection="row">
          {" "}
          <PDFGrid
            height={13}
            bg="#aaa"
            cols={1}
            pl={3}
            borderColor="#00"
            bw={0.5}
          >
            <PdfSmall>
              TASKCARD FINDING / Дефект, обнаруженный во время выполнения
            </PdfSmall>
          </PDFGrid>
        </PdfView>
        <PdfView display="flex" flexDirection="row">
          <PDFGrid height={98} ph={3} cols={1} borderColor="#00" bw={0.5}>
            <PdfRegularSmall fontSize={9}>
              TASKCARD FINDING (Tick applicable Box) / Дефект, обнаруженный во
              время выполнения (Отметить): [ {"\r\r\r"}] YES / ДА [{"\r\r\r"} ]
              NO / НЕТ {"\r\n"}WORKORDER REFERENCE / Ссылка на заказ:
              {
                "________________________________________________________________________________________ "
              }
              {"\r\n"}
              (PLEASE ENTER TASKCARD REFERENCE ALSO ON WORKORDER!) / (Также
              просьба внести ссылку на задачу в заказе!) {"\r\n"}IF INTERRUPTED:
              TASKCARD PERFORMED UP TO / В случае прерывания выполнения: Задача
              выполнена до{"\r\n"}
              PAGE/Стр_______ PARAGRAPH/Параграф________ STEP/Шаг________
              {"\r\n"}REMARKS / Примечания:
              ______________________________________________________________________________________________________________________________________________
            </PdfRegularSmall>
            <PdfRegularSmall> </PdfRegularSmall>
            <PdfRegularSmall></PdfRegularSmall>
          </PDFGrid>
        </PdfView>
        <PdfView display="flex" flexDirection="row">
          {" "}
          <PDFGrid height={13} bg="#aaa" cols={1} borderColor="#00" bw={0.5}>
            <PdfSmall>Released To Service / Допуск к эксплуатации</PdfSmall>
          </PDFGrid>
        </PdfView>
        <PdfView display="flex" flexDirection="row">
          <PDFGrid height={38} ph={3} cols={1} borderColor="#00" bw={0.5}>
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
