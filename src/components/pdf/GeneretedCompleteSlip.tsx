import { PDFViewer } from "@react-pdf/renderer";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";

import { title } from "process";
import React, { FC } from "react";

import { PdfParientPickSlipCompleted } from "./pickSlip/pdf-parient-report-PICKSLIPCompleted";
import { useTranslation } from "react-i18next";
type PickSlipTypeProps = { currentPick?: any };

const GeneretedCompleteSlipPdf: FC<PickSlipTypeProps> = ({ currentPick }) => {
  const { t } = useTranslation();
  const fields = [
    { title: `${t("LABEL")}`, width: 25 },
    { title: `${t("PN")}`, width: 40 },
    { title: `${t("DESCRIPTION")}`, width: 40 },
    { title: `${t("QUANTITY")}`, width: 15 },
    { title: `${t("UNIT")}`, width: 15 },
    { title: `${t("BATCH")}`, width: 30 },
    { title: `${t("SERIAL")}`, width: 20 },
    { title: `${t("LOCATION")}`, width: 20 },
    { title: `${t("NOTE")}`, width: 20 },
  ];

  const dispatch = useAppDispatch();

  return (
    <>
      {currentPick && (
        <PDFViewer
          style={{ width: "100%", height: "70vh", zIndex: 150 }}
          showToolbar={true}
        >
          <PdfParientPickSlipCompleted
            data={currentPick}
            fields={fields}
          ></PdfParientPickSlipCompleted>
        </PDFViewer>
      )}
    </>
  );
};

export default GeneretedCompleteSlipPdf;
