import { PDFViewer, Document, Page } from "@react-pdf/renderer";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";

import { title } from "process";
import React, { FC, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { PdfParientLabelsCompleted } from "./pickSlip/pdf-parient-report-CompleteLabels";
import QRGenerator from "@/components/qrCode/QRGenerator";
import { getLocationDetails } from "@/utils/api/thunks";

type PickSlipTypeProps = { parts?: any; type?: any };

const GeneretedTransferPdf: FC<PickSlipTypeProps> = ({ parts, type }) => {
  const { t } = useTranslation();

  const [updatedParts, setUpdatedParts] = useState<any | null>(null);
  const dispatch = useAppDispatch();
  const companyID = localStorage.getItem("companyID") || "";
  useEffect(() => {
    const updateParts = async () => {
      if (parts) {
        const updatedParts = await Promise.all(
          parts.map(async (part: any) => {
            const locationDetails = await dispatch(
              getLocationDetails({
                shopShortName: part?.STOCK,
                location: part?.SHELF_NUMBER,
                companyID: companyID,
              })
            );
            return {
              ...part,
              locationType: locationDetails.payload?.locationType,
              rectriction: locationDetails.payload?.rectriction,
            };
          })
        );
        setUpdatedParts(updatedParts);
      }
    };
    updateParts();
  }, [parts, dispatch]);

  const handleCanvasReady = (url: string | null, index: number) => {
    if (url) {
      setUpdatedParts((prevTasks: any[]) => {
        const newTasks = [...prevTasks];
        newTasks[index] = {
          ...newTasks[index],

          QRCodeLink: url,
        };
        return newTasks;
      });
    }
  };
  return (
    <div className="">
      {updatedParts?.map((task: any, index: number) => (
        <div key={task._id || task.id}>
          <QRGenerator
            valueString={String(task.LOCAL_ID)}
            onReady={(url) => handleCanvasReady(url, index)}
          ></QRGenerator>
          <PDFViewer
            style={{ width: "100%", height: "60vh", zIndex: 150 }}
            showToolbar={true}
          >
            <PdfParientLabelsCompleted
              type={type}
              data={task}
            ></PdfParientLabelsCompleted>
          </PDFViewer>
        </div>
      ))}
    </div>
  );
};
export default GeneretedTransferPdf;
