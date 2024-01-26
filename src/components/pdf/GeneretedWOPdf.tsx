import { PDFViewer } from "@react-pdf/renderer";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { IReferencesLinkType } from "@/models/IAdditionalTask";
import { title } from "process";
import React, { FC, useRef, useEffect, useState } from "react";

import { PdfParientWO } from "./pdf-parient-WO";

import QRGenerator from "@/components/qrCode/QRGenerator";
import { setCurrentQrCodeLink } from "@/store/reducers/MtbSlice";
import { IProjectTask } from "@/models/IProjectTaskMTB";
import { IProjectResponce } from "@/models/IProject";

const fieldsTypes = [
  { title: "Type / Тип", width: 20 },
  { title: "Reference / Ссылка", width: 60 },
  { title: "Description / Описание", width: 60 },
];

// type: 'WO' | 'AMM' | 'SB';
// reference: string;
// description: string;
export interface GeneretedWOPdfProps {
  task: IProjectTask | null;
  currentProject?: IProjectResponce | null | undefined;
  scroll?: any;
}
const GeneretedWOPdf: FC<GeneretedWOPdfProps> = ({ task, scroll }) => {
  const { currentProjectTask } = useTypedSelector((state) => state.mtbase);
  const { currentProject } = useTypedSelector((state) => state.mtbase);
  const { allMaterials, isLoading } = useTypedSelector(
    (state) => state.material
  );

  const fields = [
    // { title: 'Code/Код', width: 20 },
    { title: "Partnumber/Парт. номер", width: 30 },
    { title: "Description/Описание", width: 30 },
    // { title: 'Description/Альтернатива', width: 40 },
    { title: "QTY/Кол-во", width: 20 },
    { title: "Unit/Ед. Измер.", width: 20 },
  ];
  const fieldsMat = [
    { title: "Code/Код", width: 20 },
    { title: "Partnumber/Парт. номер", width: 30 },
    { title: "Description/Альтернатива", width: 35 },
    { title: "Description/Описание", width: 35 },
    { title: "QTY/Кол-во", width: 20 },
    { title: "Unit/Ед. Измер.", width: 20 },
    // { title: 'id', width: 10 },
  ];
  const fieldsInstr = [
    { title: "Partnumber/Парт. номер", width: 30 },
    { title: "Description/Описание", width: 55 },
    { title: "QTY/Кол-во", width: 20 },
    { title: "Code/Код", width: 35 },
    { title: "Description/Альтернатива", width: 20 },
    // { title: 'Code/Код', width: 20 },
  ];
  const fieldAccess = [
    { title: "Panel/Панель", width: 20 },
    { title: "Description/Описание", width: 80 },
  ];
  const fieldZones = [
    { title: "Zona/Зона", width: 20 },
    { title: "Description/Описание", width: 80 },
  ];

  const QRCodeImgRef = useRef<HTMLCanvasElement | null>(null);
  const [updatedTask, setUpdatedTask] = useState<any | null>(task);

  useEffect(() => {
    setUpdatedTask(task);
  }, [task]);

  const handleCanvasReady = (url: string | null) => {
    if (url) {
      setUpdatedTask((prevTask: any) => ({
        ...prevTask,
        QRCodeLink: url,
      }));
    }
  };

  return (
    <div className="">
      <QRGenerator
        valueString={String(task && task?.projectTaskWO)}
        onReady={handleCanvasReady}
      ></QRGenerator>
      {updatedTask && (
        <>
          <PDFViewer
            style={{
              width: "100%",
              height: scroll ? scroll : "55vh",
              zIndex: 150,
            }}
            showToolbar={true}
          >
            <PdfParientWO
              data={updatedTask}
              projectData={currentProject} // fields={undefined}
              fields={fields}
              fieldsTypes={fieldsTypes}
              fieldsMat={fieldsMat}
              allMaterials={[]}
              fieldsInstrument={fieldsInstr}
              fieldAccess={fieldAccess}
              fieldNotIncludeAccess={fieldAccess}
              fieldZones={fieldZones}
            ></PdfParientWO>
          </PDFViewer>
        </>
      )}
    </div>
  );
};

export default GeneretedWOPdf;
