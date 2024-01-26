import { TabsProps, Tabs } from "antd";
import AccessList from "@/components/access/AccessList";
import HardAccessList from "@/components/access/HardAccessList";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { includeTasks } from "@/services/utilites";

const AccessTabView: FC = () => {
  const onChange = (key: string) => {};
  const history = useNavigate();

  const { routineTasks, additionalTasks, hardTimeTasks } = useTypedSelector(
    (state) => state.application.currentAplication
  );
  const { currentAplication } = useTypedSelector((state) => state.application);

  const { allTasks } = useTypedSelector((state) => state.tasks);

  const filteredRoutineItems = includeTasks(allTasks, routineTasks);
  const filteredAdditionalItems = includeTasks(allTasks, additionalTasks);
  const filteredHardTimesItems = includeTasks(allTasks, hardTimeTasks);

  const allCheackTasks = [
    ...filteredRoutineItems,
    ...filteredAdditionalItems,
    ...filteredHardTimesItems,
  ];

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Панели`,
      children: (
        <AccessList
          data={allCheackTasks}
          fileName={`panels-${currentAplication.aplicationName}`}
        />
      ),
    },
    {
      key: "2",
      label: `Тяжелые доступы`,
      children: (
        <HardAccessList
          data={allCheackTasks}
          fileName={`hardAccess-${currentAplication.aplicationName}`}
        />
      ),
    },
  ];

  return (
    <Tabs type="card" defaultActiveKey="1" items={items} onChange={onChange} />
  );
};

export default AccessTabView;
