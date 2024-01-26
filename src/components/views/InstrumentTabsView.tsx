import { Tabs, TabsProps } from "antd";
import InstrumentList from "@/components/instrument/InstrumentList";
import SumInstrument from "@/components/instrument/SumInstrument";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC } from "react";

const InstrumentTabsView: FC = () => {
  const { routineTasks, additionalTasks, hardTimeTasks, aplicationName } =
    useTypedSelector((state) => state.application.currentAplication);
  const allTasks = [...routineTasks, ...additionalTasks, ...hardTimeTasks];
  const onChange = (key: string) => {};

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Cумма Инструмента`,
      children: (
        <SumInstrument
          data={allTasks}
          fileName={`Сумма инструмента всех работ-${aplicationName}`}
        />
      ),
    },
    {
      key: "2",
      label: `Инструмент по задачам`,
      children: (
        <InstrumentList
          data={allTasks}
          fileName={`Инструмент всех работ по задачам-${aplicationName}`}
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

export default InstrumentTabsView;
