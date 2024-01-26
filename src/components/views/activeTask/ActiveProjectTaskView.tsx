import { TabsProps, Tabs } from "antd";
import Title from "antd/es/typography/Title";
import React, { FC } from "react";
import WorkOrderView from "./WorkOrderView";
import TaskCardView from "./WO/taskCard/TaskCarView";
import GeneretedWOPdf from "@/components/pdf/GeneretedWOPdf";
import NRCPdfTitle from "./NRC/NRCPdfTitle";
import { setCurrentProjectTask } from "@/store/reducers/ProjectTaskSlise";
import { useTypedSelector } from "@/hooks/useTypedSelector";
export interface IActiveProjectTaskPrors {
  tab: string;
}
const ActiveProjectTaskView: FC<IActiveProjectTaskPrors> = ({ tab }) => {
  const { currentProjectTask } = useTypedSelector((state) => state.projectTask);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Редактирование`,
      children: <WorkOrderView />,
    },
    {
      key: "2",
      label: `Печать`,
      children: (
        <div className="flex-col">
          <NRCPdfTitle />
          <GeneretedWOPdf task={null} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex">
        <Title className="my-0" level={4}>
          <a className="">
            W/O: {currentProjectTask.projectTaskWO} {""}
            {""}
            {""}
            {""}
            {""}
            {""}
            {""}
          </a>
          <a className="">
            {currentProjectTask.taskId?.taskNumber ||
              currentProjectTask?.optional?.taskNumber}
          </a>
        </Title>
        <div className="mt-2 ml-auto uppercase">
          Статус: {currentProjectTask.status}
        </div>
      </div>
      <div>
        <Tabs
          size="small"
          type="card"
          defaultActiveKey={tab}
          items={items}
        ></Tabs>
      </div>
    </div>
  );
};

export default ActiveProjectTaskView;
