import { Button, Form, Modal, Tabs } from "antd";
import LaborList from "@/components/laboriousness/LaborList";
import React, { FC, useState } from "react";
import type { TabsProps } from "antd";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import { includeTasks, notIncludeTasks, saveExls } from "@/services/utilites";
import TasksList from "@/components/applicationInfo/NotFoundedTaskList";
import Title from "antd/es/typography/Title";
import { useNavigate } from "react-router-dom";
import { RouteNames } from "@/router";
import AplicationInfo from "@/components/applicationInfo/AplicationInfo";
const Laboriousness: FC = () => {
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
  const notFoundedAlllTasks = notIncludeTasks(allCheackTasks, allTasksDTO);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Суммарная трудоемкость`,
      children: (
        <>
          <LaborList
            data={allCheackTasks}
            isLoading={isLoading}
            fileName={`Трудоемкость всех работ-${aplicationName}`}
          />
          {notFoundedAlllTasks.length > 0 && (
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
          <LaborList
            data={filteredRoutineItems}
            isLoading={isLoading}
            fileName={`Трудоемкость рутинных работ-${aplicationName}`}
          />
          {notFoundedRoutineTasks.length > 0 && (
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
      label: `Трудоемкость дополнительных работ и бюллетеней`,
      children: (
        <>
          <LaborList
            data={filteredAdditionalItems}
            isLoading={isLoading}
            fileName={`Трудоемкость дополнительных работ и бюллетеней-${aplicationName}`}
          />
          {notFoundedAdditionalTasks.length > 0 && (
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
          <LaborList
            data={filteredHardTimesItems}
            isLoading={isLoading}
            fileName={`Трудоемкость  работ, выполняемых вне ВС-${aplicationName}`}
          />
          ,
          {notFoundedHardTimesTasks.length > 0 && (
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
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between flex-wrap">
        <Title className="my-0" level={4}>
          Трудоемкость <a className="">{aplicationName}</a>
        </Title>
        <div className="flex gap-1 py-2">
          <Button
            onClick={() => {
              // history(`${RouteNames.CHEACK_INFO}`);
              setOpen(true);
            }}
            type={"default"}
          >
            Просмотр Данных о заявке
          </Button>
          <Modal
            okButtonProps={{}}
            centered
            open={open}
            cancelText="отмена"
            okType={"default"}
            okText="ОК"
            onOk={async () => {
              setOpen(false);
            }}
            onCancel={() => {
              setOpen(false);
            }}
            width={"80%"}
          >
            {" "}
            <AplicationInfo />
          </Modal>
        </div>
      </div>

      <Tabs
        type="card"
        defaultActiveKey="1"
        items={items}
        onChange={onChange}
      />
    </div>
  );
};

export default Laboriousness;
