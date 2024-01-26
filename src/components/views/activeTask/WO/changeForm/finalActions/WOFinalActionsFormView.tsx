import { Tabs, TabsProps } from "antd";

import { useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC } from "react";

import Title from "antd/es/typography/Title";
import WOClosingForm from "./WOClosingForm";
import DIWOClosingForm from "./DIWOClosingForm";
import WOTimeUsedForm from "./WOTimeUsedForm";

export interface IFinishActionForm {
  onFinish?: () => void;
}

const WOFinalActionForm: FC<IFinishActionForm> = () => {
  const { currentProjectTask } = useTypedSelector((state) => state.projectTask);
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Closing Sign / Штамп`,
      children: <WOClosingForm />,
    },
    {
      key: "2",
      label: `Double Inspection / Двойная Инспекция`,
      children: currentProjectTask.isDoubleInspectionRequired ? (
        <DIWOClosingForm />
      ) : (
        <p>Double Inspection not requaed</p>
      ),
    },
    {
      key: "3",
      label: `Time used to perform / Время затраченное на выполнение`,
      children: <WOTimeUsedForm />,
    },
  ];
  return (
    <div className="flex  w-full flex-col gap-3">
      <Title level={5}>Final Action / Финальное действие</Title>
      <Tabs type="card" defaultActiveKey={"1"} items={items}></Tabs>
    </div>
  );
};

export default WOFinalActionForm;
