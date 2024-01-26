import { Tabs, TabsProps } from "antd";
import GeneretedNRCPdf from "@/components/pdf/GeneretedNRCPdf";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import DoubleInspectionForm from "./NRCDoubleInspectionForm";
import InspectionForm from "./NRCInspectionForm";
import OIlForm from "./OIlForm";
import PartRepairForm from "./PartRepair";
import TtansferForm from "./TtansferForm";
import NRCActionDescriptionEditForm from "./NRCActionDescriptionEditForm";

const ActiveActionForm: FC = () => {
  const { currentAdditionalTask } = useTypedSelector(
    (state) => state.additioonalTasks
  );
  const history = useNavigate();

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Description / Описание`,
      children: <NRCActionDescriptionEditForm />,
    },
    {
      key: "2",
      label: `Inspection / Инспекция`,
      children: <InspectionForm />,
    },
    {
      key: "3",
      label: `Double Inspection / Двойная Инспекция`,
      children: currentAdditionalTask.isDoubleInspectionRequired ? (
        <DoubleInspectionForm />
      ) : (
        <p>`Double Inspectio not requaed</p>
      ),
    },
    {
      key: "4",
      label: `Part repair / Замена изделия`,
      children: <PartRepairForm />,
    },

    {
      key: "5",
      label: `Transfer / Перенос`,
      children: <TtansferForm />,
    },
    {
      key: "6",
      label: `Oil Uplift / Заправка маслом`,
      children: <OIlForm />,
    },
  ];
  return (
    <div>
      <Tabs type="card" defaultActiveKey={"1"} items={items}></Tabs>
    </div>
  );
};

export default ActiveActionForm;
