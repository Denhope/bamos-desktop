import { TabsProps, Button, Tabs } from "antd";
import Title from "antd/es/typography/Title";

import GeneretedNRCPdf from "@/components/pdf/GeneretedNRCPdf";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC } from "react";
import { useNavigate } from "react-router-dom";

import NRCCardView from "./NRC/NrcCardView";
import NRCPdfTitle from "./NRC/NRCPdfTitle";
export interface IActiveNRCTaskPrors {
  tab: string;
}
const NRCView: FC<IActiveNRCTaskPrors> = ({ tab }) => {
  const { currentAdditionalTask } = useTypedSelector(
    (state) => state.additioonalTasks
  );
  const history = useNavigate();

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Редактирование`,
      children: <NRCCardView />,
    },
    {
      key: "2",
      label: `Печать`,
      children: (
        <div className="flex-col">
          <NRCPdfTitle />
          <GeneretedNRCPdf />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex">
        <Title className="my-0" level={4}>
          <a className="">{currentAdditionalTask.taskHeadLine}</a>
        </Title>
        <div className="mt-2 ml-auto uppercase">
          Статус: {currentAdditionalTask.status}
        </div>
      </div>
      <div>
        <Tabs size="small" type="card" defaultActiveKey={tab} items={items}>
          {/* <Tabs.TabPane tab="Tab 1" key="tab1"></Tabs.TabPane> */}
        </Tabs>
      </div>
    </div>
  );
};

export default NRCView;
