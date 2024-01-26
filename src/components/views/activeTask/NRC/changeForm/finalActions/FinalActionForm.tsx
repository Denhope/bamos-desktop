import { Tabs, TabsProps } from "antd";
import DoubleInspectionForm from "@/components/views/activeTask/NRC/changeForm/actions/NRCDoubleInspectionForm";
import InspectionForm from "@/components/views/activeTask/NRC/changeForm/actions/NRCInspectionForm";
import OIlForm from "@/components/views/activeTask/NRC/changeForm/actions/OIlForm";
import PartRepairForm from "@/components/views/activeTask/NRC/changeForm/actions/PartRepair";
import TtansferForm from "@/components/views/activeTask/NRC/changeForm/actions/TtansferForm";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC } from "react";
import ClosingSingForm from "./ClosingSingForm";
import DIClosingForm from "./DIClosingForm";
import Title from "antd/es/typography/Title";
import NRCTimeUsedForm from "./NRCTimeUsedForm";

export interface IFinishActionForm {
  onFinish?: () => void;
}

const FinalActionForm: FC<IFinishActionForm> = () => {
  const { currentAdditionalTask } = useTypedSelector(
    (state) => state.additioonalTasks
  );
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Closing Sign / Штамп`,
      children: <ClosingSingForm />,
    },
    {
      key: "2",
      label: `Double Inspection / Двойная Инспекция`,
      children: currentAdditionalTask.isDoubleInspectionRequired ? (
        <DIClosingForm />
      ) : (
        <p>`Double Inspection not requaed</p>
      ),
    },
    {
      key: "3",
      label: `Time used to perform / Время затраченное на выполнение`,
      children: <NRCTimeUsedForm />,
    },
  ];
  return (
    <div className="flex  w-full flex-col gap-3">
      <Title level={5}>Final Action / Финальное действие</Title>
      <Tabs type="card" defaultActiveKey={"1"} items={items}></Tabs>
    </div>
  );
};

export default FinalActionForm;
