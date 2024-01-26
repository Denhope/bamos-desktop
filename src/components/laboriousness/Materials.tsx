import { Button, Modal, Tabs, TabsProps } from "antd";
import Title from "antd/es/typography/Title";
import AplicationInfo from "@/components/applicationInfo/AplicationInfo";
import MaterialList from "@/components/material/MaterialList";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC, useState } from "react";

const Materials: FC = () => {
  const { routineTasks, additionalTasks, hardTimeTasks, aplicationName } =
    useTypedSelector((state) => state.application.currentAplication);
  const allTasks = [...routineTasks, ...additionalTasks, ...hardTimeTasks];
  const onChange = (key: string) => {};

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Материалы всех работ`,
      children: (
        <MaterialList
          data={allTasks}
          fileName={`Материалы всех работ${aplicationName}`}
        />
      ),
    },
    {
      key: "2",
      label: `Материалы рутинных работ`,
      children: (
        <MaterialList
          data={routineTasks}
          fileName={`Материалы рутинных работ${aplicationName}`}
        />
      ),
    },
    {
      key: "3",
      label: `Материалы дополнительных работ и бюллетеней`,
      children: (
        <MaterialList
          data={additionalTasks}
          fileName={`Материалы дополнительных работ и бюллетеней${aplicationName}`}
        />
      ),
    },
    {
      key: "4",
      label: `Материалы работ Вне ВС`,
      children: (
        <MaterialList
          data={hardTimeTasks}
          fileName={`Материалы работ Вне ВС${aplicationName}`}
        />
      ),
    },
  ];
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between">
        <Title className="my-0" level={4}>
          Материалы <a className="">{aplicationName}</a>
        </Title>
        <div className="flex gap-1">
          <Button
            onClick={() => {
              // history(`${RouteNames.CHEACK_INFO}`);
              setOpen(true);
            }}
            type={"default"}
          >
            Просмотр сведений о заявке
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

export default Materials;
