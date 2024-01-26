import { IAdditionalTask } from "@/models/IAdditionalTask";
import React, { FC } from "react";
import { IActionType } from "@/store/reducers/AdditionalTaskSlice";
import {
  PdfRegularSmall,
  PdfSmall,
  PdfHeading,
  PdfRegular,
} from "../typography.components";
import { PDFGrid, PdfView } from "../wrapped-view.component";
import TransferPdfView from "./transfer.component";
import OnOfPartsTable from "./onOfParts.component";
import moment from "moment";

export interface IActionactionPdfViewProps {
  data: any;
  stepIndex: number;
}
const ActionactionPdfView: FC<IActionactionPdfViewProps> = ({
  data,
  stepIndex,
}) => {
  return (
    <>
      {data && data?.actions
        ? data?.actions?.map((action: IActionType, index: number) => {
            if (!action) {
              return null; // пропустить этот шаг, если он не определен
            }
            return (
              <PdfView display="flex" flexDirection="column">
                {action.isPartsRepareTask ? (
                  <OnOfPartsTable></OnOfPartsTable>
                ) : null}
                {action.isTrasferTask ? (
                  <TransferPdfView></TransferPdfView>
                ) : null}

                <PDFGrid
                  height={13}
                  cols={1}
                  bg="#aaa"
                  borderColor="#00"
                  bw={0.5}
                  flexDirection="row"
                >
                  {" "}
                  <PdfSmall>
                    {" "}
                    {`Action Step ${stepIndex + 1}-${
                      index + 1
                    }/ Действие `}{" "}
                  </PdfSmall>
                  {/* <PdfSmall> Description action / Описание </PdfSmall> */}
                  <PDFGrid p={0} ml={"370"} flexDirection="row">
                    {" "}
                    <PdfSmall>
                      {" "}
                      {action?.createUser?.createName &&
                      action?.createUser?.createSing &&
                      action?.createDate
                        ? `${
                            action?.createUser?.createName
                          } (${action?.createUser?.createSing.trim()}), ${moment(
                            action?.createDate
                          ).format("Do. MMM. YYYY")}`
                        : ""}
                    </PdfSmall>
                  </PDFGrid>
                </PDFGrid>

                {data.isDoubleInspectionRequired ? (
                  <PDFGrid cols={1} borderColor="#00" bw={0.5} pl={3}>
                    <PdfRegular fontSize={10}>
                      {action?.description?.toUpperCase() || ""}
                    </PdfRegular>
                    <PDFGrid p={0} ml={"316"} flexDirection="row">
                      {" "}
                      <PDFGrid
                        height={43}
                        p={1}
                        cols={7}
                        borderColor="#00"
                        bw={0.5}
                      >
                        <PdfSmall>Performed / Выполнил</PdfSmall>
                        <PdfRegular textAlign="center">
                          {action.performedSing || ""}
                        </PdfRegular>
                        <PdfSmall textAlign="center">
                          {action.performedName}
                        </PdfSmall>
                      </PDFGrid>
                      <PDFGrid
                        height={43}
                        p={1}
                        cols={7}
                        borderColor="#00"
                        bw={0.5}
                      >
                        <PdfSmall>Inspected / Проверил</PdfSmall>
                        <PdfRegular textAlign="center">
                          {action.inspectedSing || ""}
                        </PdfRegular>
                        <PdfSmall textAlign="center">
                          {action.inspectedName}
                        </PdfSmall>
                      </PDFGrid>
                      <PDFGrid
                        height={43}
                        p={1}
                        cols={7}
                        borderColor="#00"
                        bw={0.5}
                      >
                        <PdfSmall>Double Inspected / Двойной контроль</PdfSmall>
                        <PdfRegular textAlign="center">
                          {action.doubleInspectionSing || ""}
                        </PdfRegular>
                        <PdfSmall textAlign="center">
                          {action.doubleInspectedName}
                        </PdfSmall>
                      </PDFGrid>
                    </PDFGrid>
                  </PDFGrid>
                ) : (
                  <PDFGrid cols={1} borderColor="#00" bw={0.5} pl={3}>
                    <PdfRegular fontSize={10}>
                      {action.description?.toUpperCase() || ""}
                    </PdfRegular>
                    <PDFGrid p={0} ml={"394"} flexDirection="row">
                      {" "}
                      <PDFGrid
                        height={43}
                        p={1}
                        cols={7}
                        borderColor="#00"
                        bw={0.5}
                      >
                        <PdfSmall>Performed / Выполнил</PdfSmall>
                        <PdfRegular textAlign="center">
                          {action?.createUser?.createSing || ""}
                        </PdfRegular>
                        <PdfSmall textAlign="center">
                          {action?.createUser?.createName}
                        </PdfSmall>
                      </PDFGrid>
                      <PDFGrid
                        height={43}
                        p={1}
                        cols={7}
                        borderColor="#00"
                        bw={0.5}
                      >
                        <PdfSmall>Inspected / Проверил</PdfSmall>
                        <PdfRegular textAlign="center">
                          {action?.inspectionAction?.createUser.createSing ||
                            ""}
                        </PdfRegular>
                        <PdfSmall textAlign="center">
                          {action?.inspectionAction?.createUser.createName}
                        </PdfSmall>
                      </PDFGrid>
                    </PDFGrid>
                  </PDFGrid>
                )}
              </PdfView>
            );
          })
        : null}
    </>
  );
};

export default ActionactionPdfView;
