import { Tabs, TabsProps } from "antd";
import TaskViewList from "@/components/shared/TaskViewList";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC } from "react";

import { includeTasks } from "@/services/utilites";

const TasksTabsView: FC = () => {
  const onChange = (key: string) => {};

  const { routineTasks, additionalTasks, hardTimeTasks, aplicationName } =
    useTypedSelector((state) => state.application.currentAplication);

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
      label: `Все работы`,
      children: (
        <TaskViewList
          filteredItems={allCheackTasks}
          fileName={`Все работы-${aplicationName}`}
        />
      ),
    },
    {
      key: "2",
      label: `Рутинные работы`,
      children: (
        <TaskViewList
          filteredItems={filteredRoutineItems}
          fileName={`Рутинные работы-${aplicationName}`}
        />
      ),
    },
    {
      key: "3",
      label: `Дополнительные работы `,
      children: (
        <TaskViewList
          filteredItems={filteredAdditionalItems}
          fileName={`Доп. работы-${aplicationName}`}
        />
      ),
    },
    {
      key: "4",
      label: `Работы, выполняемых вне ВС`,
      children: (
        <TaskViewList
          filteredItems={filteredHardTimesItems}
          fileName={`Работы Вне ВС-${aplicationName}`}
        />
      ),
    },
  ];

  return (
    <Tabs
      size="small"
      type="card"
      defaultActiveKey="1"
      items={items}
      onChange={onChange}
    />
  );
};

export default TasksTabsView;
