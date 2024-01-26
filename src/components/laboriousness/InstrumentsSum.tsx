import { Button, Modal, Tabs, TabsProps } from "antd";
import Title from "antd/es/typography/Title";
import AplicationInfo from "@/components/applicationInfo/AplicationInfo";
import SumInstrument from "@/components/instrument/SumInstrument";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC, useState } from "react";

const InstrumentsSum: FC = () => {
  const { routineTasks, additionalTasks, hardTimeTasks, aplicationName } =
    useTypedSelector((state) => state.application.currentAplication);
  const allTasks = [...routineTasks, ...additionalTasks, ...hardTimeTasks];
  const onChange = (key: string) => {};

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Сумма инструмента всех работ`,
      children: (
        <SumInstrument
          data={allTasks}
          fileName={`Сумма инструмента всех работ -${aplicationName}`}
        />
      ),
    },
    {
      key: "2",
      label: `Cумма инструмента рутинных работ`,
      children: (
        <SumInstrument
          data={routineTasks}
          fileName={`Cумма инструмента рутинных работ -${aplicationName}`}
        />
      ),
    },
    {
      key: "3",
      label: `Сумма инструмента дополнительных работ и бюллетеней`,
      children: (
        <SumInstrument
          data={additionalTasks}
          fileName={`Сумма инструмента дополнительных работ и бюллетеней -${aplicationName}`}
        />
      ),
    },
    {
      key: "4",
      label: `Сумма инструмент работ Вне ВС`,
      children: (
        <SumInstrument
          data={hardTimeTasks}
          fileName={`Сумма инструмент работ Вне ВС`}
        />
      ),
    },
  ];
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between">
        <Title className="my-0" level={4}>
          Инструмент <a className="">{aplicationName}</a>
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

export default InstrumentsSum;
