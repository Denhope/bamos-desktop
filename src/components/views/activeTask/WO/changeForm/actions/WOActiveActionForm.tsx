import { Tabs, TabsProps } from "antd";

import { useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC } from "react";
import { useNavigate } from "react-router-dom";

import WODoubleInspectionForm from "./WODoubleInspectionForm";
import WOInspectionForm from "./WOInspectionForm";
import WOActionDescriptionEditForm from "./WOActionDescriptionEditForm";

const WOActiveActionForm: FC = () => {
  const { currentProjectTask } = useTypedSelector((state) => state.projectTask);
  const history = useNavigate();

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Description / Описание`,
      children: <WOActionDescriptionEditForm />,
    },
    {
      key: "2",
      label: `Inspection / Инспекция`,
      children: <WOInspectionForm />,
    },
    {
      key: "3",
      label: `Double Inspection / Двойная Инспекция`,
      children: currentProjectTask.isDoubleInspectionRequired ? (
        <WODoubleInspectionForm />
      ) : (
        <p>`Double Inspectio not requaed</p>
      ),
    },
  ];
  return (
    <div>
      <Tabs type="card" defaultActiveKey={"1"} items={items}></Tabs>
    </div>
  );
};

export default WOActiveActionForm;
