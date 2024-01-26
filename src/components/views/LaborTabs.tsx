import { TabsProps, Tabs, Form, Switch } from "antd";
import TasksList from "@/components/applicationInfo/NotFoundedTaskList";
import LaborList from "@/components/laboriousness/LaborList";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { includeTasks, notIncludeTasks } from "@/services/utilites";

const LaborTabs: FC = () => {
  const onChange = (key: string) => {};
  const history = useNavigate();

  const { routineTasks, additionalTasks, hardTimeTasks, aplicationName } =
    useTypedSelector((state) => state.application.currentAplication);

  const { allTasks, isLoading } = useTypedSelector((state) => state.tasks);
  const allTasksDTO = [...routineTasks, ...additionalTasks, ...hardTimeTasks];
  const filteredRoutineItems = includeTasks(allTasks, routineTasks);
  const filteredAdditionalItems = includeTasks(allTasks, additionalTasks);
  const filteredHardTimesItems = includeTasks(allTasks, hardTimeTasks);
  const notFoundedRoutineTasks = notIncludeTasks(
    filteredRoutineItems,
    routineTasks
  );

  const notFoundedAdditionalTasks = notIncludeTasks(
    filteredAdditionalItems,
    additionalTasks
  );
  const notFoundedHardTimesTasks = notIncludeTasks(
    filteredHardTimesItems,
    hardTimeTasks
  );

  const allCheackTasks = [
    ...filteredRoutineItems,
    ...filteredAdditionalItems,
    ...filteredHardTimesItems,
  ];
  const [showTitle, setShowTitle] = useState(false);
  const handleTitleChange = (enable: boolean) => {
    setShowTitle(enable);
  };
  const notFoundedAlllTasks = notIncludeTasks(allCheackTasks, allTasksDTO);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Суммарная трудоемкость`,
      children: (
        <>
          <Form.Item label="Показать Отсутствующие задачи">
            <Switch checked={showTitle} onChange={handleTitleChange} />
          </Form.Item>
          <LaborList
            data={allCheackTasks}
            isLoading={isLoading}
            fileName={`Трудоемкость всех работ-${aplicationName}`}
          />
          {notFoundedAlllTasks.length > 0 && showTitle && (
            <TasksList
              data={notFoundedAlllTasks}
              title=" Все работы "
              fileName={`Все отсутствующие в базе  работы - ${aplicationName}`}
            />
          )}
        </>
      ),
    },
    {
      key: "2",
      label: `Трудоемкость рутинных работ`,
      children: (
        <>
          <Form.Item label="Показать Отсутствующие задачи">
            <Switch checked={showTitle} onChange={handleTitleChange} />
          </Form.Item>
          <LaborList
            data={filteredRoutineItems}
            isLoading={isLoading}
            fileName={`Трудоемкость рутинных работ-${aplicationName}`}
          />
          {notFoundedRoutineTasks.length > 0 && showTitle && (
            <TasksList
              data={notFoundedRoutineTasks}
              title=" Рутинные "
              fileName={`Все отсутствующие в базе   рутинные работы - ${aplicationName}`}
            />
          )}
        </>
      ),
    },
    {
      key: "3",
      label: `Трудоемкость дополнительных работ`,
      children: (
        <>
          <Form.Item label="Показать Отсутствующие задачи">
            <Switch checked={showTitle} onChange={handleTitleChange} />
          </Form.Item>
          <LaborList
            data={filteredAdditionalItems}
            isLoading={isLoading}
            fileName={`Трудоемкость дополнительных работ -${aplicationName}`}
          />
          {notFoundedAdditionalTasks.length > 0 && showTitle && (
            <TasksList
              data={notFoundedAdditionalTasks}
              title=" Бюллетени и Дополнительные "
              fileName={`Все отсутствующие в базе дополнительных работ и бюллетени - ${aplicationName}`}
            />
          )}
          ,
        </>
      ),
    },
    {
      key: "4",
      label: `Трудоемкость  работ, выполняемых вне ВС`,
      children: (
        <>
          <Form.Item label="Показать Отсутствующие задачи">
            <Switch checked={showTitle} onChange={handleTitleChange} />
          </Form.Item>
          <LaborList
            data={filteredHardTimesItems}
            isLoading={isLoading}
            fileName={`Трудоемкость  работ, выполняемых вне ВС-${aplicationName}`}
          />
          ,
          {notFoundedHardTimesTasks.length > 0 && showTitle && (
            <TasksList
              data={notFoundedHardTimesTasks}
              title=" ВНЕ ВС"
              fileName={`Все отсутствующие в базе работы, выполняемых вне ВС - ${aplicationName}`}
            />
          )}
        </>
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

export default LaborTabs;
