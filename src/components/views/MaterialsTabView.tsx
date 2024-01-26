import { TabsProps, Button, Modal, Tabs } from "antd";

import MaterialList from "@/components/material/MaterialList";
import SumMaterials from "@/components/material/SumMaterials";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC } from "react";

const MaterialsTabView: FC = () => {
  const { routineTasks, additionalTasks, hardTimeTasks, aplicationName } =
    useTypedSelector((state) => state.application.currentAplication);
  const allTasks = [...routineTasks, ...additionalTasks, ...hardTimeTasks];
  const onChange = (key: string) => {};

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Сумма материалов`,
      children: (
        <SumMaterials
          data={allTasks}
          fileName={`Сумма материалов-${aplicationName}`}
        />
      ),
    },

    {
      key: "2",
      label: `Материалы по работам`,
      children: (
        <MaterialList
          data={allTasks}
          fileName={`Материалы всех работ${aplicationName}`}
        />
      ),
    },
  ];

  return (
    <div>
      <Tabs
        type="card"
        defaultActiveKey="1"
        items={items}
        onChange={onChange}
      />
    </div>
  );
};

export default MaterialsTabView;
