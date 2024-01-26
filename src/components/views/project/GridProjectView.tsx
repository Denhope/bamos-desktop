import React, { FC, useState } from "react";
import ProjectListView from "./ProjectListView";

import { useTypedSelector } from "@/hooks/useTypedSelector";
import ProjectInfoView from "./ProjectInfoView";

import ProjectTasksView from "../projectTask/ProjectTaskView";
import ActiveProjectTaskView from "../activeTask/ActiveProjectTaskView";
import NRCView from "../activeTask/NRCView";
import {
  Button,
  Card,
  Col,
  Drawer,
  DrawerProps,
  FloatButton,
  Row,
  Space,
} from "antd";
import Title from "antd/es/typography/Title";

const GridProjectView: FC = () => {
  const { currentProject } = useTypedSelector((state) => state.projects);
  const { NRCViewMode, currentProjectTask } = useTypedSelector(
    (state) => state.projectTask
  );
  const { currentAdditionalTask } = useTypedSelector(
    (state) => state.additioonalTasks
  );
  const { isProjectTAskListFull } = useTypedSelector(
    (state) => state.viewsStore
  );

  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<DrawerProps["size"]>();

  const onClose = () => {
    setOpen(false);
  };
  return (
    <div className="flex">
      <div
        className="flex my-0 mx-auto flex-col h-[86vh]"
        style={{
          width: "95%",
        }}
      >
        {" "}
        <Drawer
          title={`Выбор Пакета`}
          placement="right"
          size={"large"}
          onClose={onClose}
          open={open}
          // extra={
          //   <Space>
          //     <Button onClick={onClose}>Cancel</Button>
          //     <Button type="primary" onClick={onClose}>
          //       OK
          //     </Button>
          //   </Space>
          // }
        >
          {" "}
          <ProjectListView />
        </Drawer>
        {currentProject.projectName.length > 2 ? (
          <div
            className="flex flex-col mx-auto"
            style={{
              width: "99%",
            }}
          >
            <Title className="my-0 text-gray-500 py-0" level={5}>
              BASE MAINTENANSE
            </Title>
            <ProjectInfoView />
            <ProjectTasksView />
          </div>
        ) : (
          <div
            className="flex flex-col mx-auto"
            style={{
              width: "99%",
            }}
          >
            <Title className="my-0 text-gray-500 py-0" level={5}>
              BASE MAINTENANSE
            </Title>
            <ProjectListView />
            {/* <FloatButton tooltip={<div>Выбор пакета</div>} /> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default GridProjectView;
