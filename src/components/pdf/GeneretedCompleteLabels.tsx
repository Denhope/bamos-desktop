// import { PDFViewer, Document, Page } from '@react-pdf/renderer';
// import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';

import { PDFViewer, Document, Page } from "@react-pdf/renderer";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";

import { title } from "process";
import React, { FC, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { PdfParientLabelsCompleted } from "./pickSlip/pdf-parient-report-CompleteLabels";
import QRGenerator from "@/components/qrCode/QRGenerator";
import { getLocationDetails } from "@/utils/api/thunks";

type PickSlipTypeProps = { currentPick?: any };

const GeneretedCompleteSlipPdf: FC<PickSlipTypeProps> = ({ currentPick }) => {
  const { t } = useTranslation();

  const [updatedTasks, setUpdatedTasks] = useState<any | null>(null);
  useEffect(() => {
    if (currentPick?.materials) {
      setUpdatedTasks(
        currentPick.materials.filter((material: any) => material.foRealese)
      );
    }
  }, [currentPick]);
  const dispatch = useAppDispatch();
  const companyID = localStorage.getItem("companyID") || "";
  useEffect(() => {
    const updateTasks = async () => {
      if (updatedTasks) {
        const updatedTasksWithDetails = await Promise.all(
          updatedTasks.map(async (task: any) => {
            const locationDetails = await dispatch(
              getLocationDetails({
                shopShortName: task?.STOCK,
                location: task?.SHELF_NUMBER,
                companyID: companyID,
              })
            );
            return {
              ...task,
              locationType: locationDetails.payload?.locationType,
              rectriction: locationDetails.payload?.rectriction,
            };
          })
        );
        setUpdatedTasks(updatedTasksWithDetails);
      }
    };
    updateTasks();
  }, [updatedTasks, dispatch]);

  const handleCanvasReady = (url: string | null, index: number) => {
    if (url) {
      setUpdatedTasks((prevTasks: any[]) => {
        const newTasks = [...prevTasks];
        newTasks[index] = {
          ...newTasks[index],
          onBlock: newTasks[index].onBlock.map((block: any) => ({
            ...block,
            QRCodeLink: url,
          })),
        };
        return newTasks;
      });
    }
  };
  return (
    <div className="">
      {updatedTasks?.map((task: any, index: number) => (
        <div key={task.id || task._id}>
          <QRGenerator
            valueString={String(task.LOCAL_ID)}
            onReady={(url) => handleCanvasReady(url, index)}
          ></QRGenerator>
          <PDFViewer
            style={{ width: "100%", height: "60vh", zIndex: 150 }}
            showToolbar={true}
          >
            <PdfParientLabelsCompleted
              data={task?.onBlock[0]}
            ></PdfParientLabelsCompleted>
          </PDFViewer>
        </div>
      ))}
    </div>
  );
};
export default GeneretedCompleteSlipPdf;
