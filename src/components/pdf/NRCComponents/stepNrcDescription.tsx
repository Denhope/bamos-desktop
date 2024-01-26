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
import ActionStepPdfView from "./actionStep.component";
import moment from "moment";

export interface IStepPdfViewProps {
  data: any;
}
export type IStepType = {
  data: any;
  isPartsRepareTask?: any;
  isTrasferTask?: any;
  createDate?: any;
  createUser?: any;
  stepDescription?: any;
  stepHeadLine?: any;
  updateById?: any;
  updateDate?: any;
  actions?: any;
};
const StepPdfView: FC<IStepPdfViewProps> = ({ data }) => {
  return (
    <>
      {data
        ? data.map((step: IStepType, index: number) => {
            if (!step) {
              return null; // пропустить этот шаг, если он не определен
            }
            return (
              <>
                <PdfView display="flex" flexDirection="column">
                  {step.isPartsRepareTask ? (
                    <OnOfPartsTable></OnOfPartsTable>
                  ) : null}
                  {step.isTrasferTask ? (
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
                      {`Description Step ${index + 1} / Описание Шага`}
                    </PdfSmall>
                    {/* <PdfSmall> Description Step / Описание </PdfSmall> */}
                    <PDFGrid p={0} ml={"380"} flexDirection="row">
                      {" "}
                      <PdfSmall>
                        {" "}
                        {step.createUser.createName &&
                        step.createUser.createSing &&
                        step.createDate
                          ? `${
                              step.createUser.createName
                            } (${step.createUser.createSing.trim()}), ${moment(
                              step.createDate
                            ).format("Do. MMM. YYYY")}`
                          : ""}
                      </PdfSmall>
                    </PDFGrid>
                  </PDFGrid>
                  <PDFGrid cols={1} borderColor="#00" bw={0.5} pl={3}>
                    {" "}
                    <PdfRegular fontSize={10}>
                      {step.stepDescription?.toUpperCase() || ""}
                    </PdfRegular>
                  </PDFGrid>
                </PdfView>
                {step.actions && (
                  <ActionStepPdfView stepIndex={index} data={step} />
                )}
              </>
            );
          })
        : null}
    </>
  );
};

export default StepPdfView;
