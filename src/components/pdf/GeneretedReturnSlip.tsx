import { PDFViewer } from "@react-pdf/renderer";
import { useAppDispatch } from "@/hooks/useTypedSelector";

import React, { FC, useEffect, useState } from "react";

import { PdfParientReturnSlip } from "./returnSlip/pdf-parient-report-RETURNSLIP";
import { featchPickSlipByID, featchReturnSlipByID } from "@/utils/api/thunks";
import { useTranslation } from "react-i18next";
type PickSlipTypeProps = { currentPickSlipID?: any };

const GeneretedPickSlipPdf: FC<PickSlipTypeProps> = ({ currentPickSlipID }) => {
  const { t } = useTranslation();
  useEffect(() => {
    const fetchData = async () => {
      const companyID = localStorage.getItem("companyID");

      if (companyID) {
        const result = await dispatch(
          featchReturnSlipByID({
            companyID: companyID,
            returnSlipID: currentPickSlipID || "",
          })
        );
        if (result.meta.requestStatus === "fulfilled") {
          // console.log(result.payload);

          result.payload
            ? setCurrentPickSlip(result.payload)
            : setCurrentPickSlip(null);
        }
      }
    };
    fetchData();
    // if () {
  }, [currentPickSlipID]);
  const [currentPickSlip, setCurrentPickSlip] = useState(null);
  // const { currentPickSlip } = useTypedSelector((state) => state.pickSlips);

  const fields = [
    { title: `${t("LABEL")}`, width: 25 },
    { title: `${t("PN")}`, width: 40 },
    { title: `${t("DESCRIPTION")}`, width: 40 },

    { title: `${t("QTY")}`, width: 15 },
    { title: `${t("UNIT")}`, width: 15 },
    { title: `${t("BATCH")}`, width: 30 },
    { title: `${t("SERIAL")}`, width: 20 },
    { title: `${t("OWNER")}`, width: 18 },
    { title: `${t("INVENT")}`, width: 15 },
    { title: `${t("PRICE")}`, width: 20 },
  ];

  const dispatch = useAppDispatch();

  return (
    <>
      {currentPickSlip && (
        <PDFViewer
          style={{ width: "100%", height: "70vh", zIndex: 150 }}
          showToolbar={true}
        >
          <PdfParientReturnSlip
            data={currentPickSlip}
            fields={fields}
          ></PdfParientReturnSlip>
        </PDFViewer>
      )}
    </>
  );
};

export default GeneretedPickSlipPdf;
