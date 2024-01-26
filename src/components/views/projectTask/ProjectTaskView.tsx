import { Tabs, TabsProps } from "antd";

import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC } from "react";

import {
  featchFilteredTasksByProjectId,
  featchFilteredNRCProject,
} from "@/utils/api/thunks";

import { useNavigate } from "react-router-dom";

import ProjectTaskListView from "./ProjectTaskListView";
import NRCListView from "./NRSListView";
import { setViewMode } from "@/store/reducers/ProjectTaskSlise";
export interface IProjectListPrors {
  data: any[];
  fileName: string;
}

const ProjectTasksView: FC = () => {
  const { currentProject } = useTypedSelector((state) => state.projects);
  const dispatch = useAppDispatch();
  const onChange = (key: string) => {
    if (key == "1") {
      dispatch(
        featchFilteredTasksByProjectId({
          projectId: currentProject.id || "",
          filter: "",
        })
      );
      dispatch(setViewMode(false));
    }
    if (key == "2") {
      dispatch(setViewMode(false));
      dispatch(
        featchFilteredTasksByProjectId({
          projectId: currentProject.id || "",
          filter: "routine",
        })
      );
    }
    if (key == "3") {
      dispatch(setViewMode(false));
      dispatch(
        featchFilteredTasksByProjectId({
          projectId: currentProject.id || "",
          filter: "additional",
        })
      );
    }
    if (key == "4") {
      dispatch(setViewMode(false));
      dispatch(
        featchFilteredTasksByProjectId({
          projectId: currentProject.id || "",
          filter: "hardTime",
        })
      );
    }
    if (key == "5") {
      dispatch(setViewMode(true));
      dispatch(
        featchFilteredNRCProject({
          projectId: currentProject.id || "",
        })
      );
    }
  };
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Все работы `,
      children: <ProjectTaskListView filter={""} />,
    },
    {
      key: "2",
      label: `Рутинные работы`,
      children: <ProjectTaskListView filter={"routine"} />,
    },
    {
      key: "3",
      label: `Дополнительные работы`,
      children: <ProjectTaskListView filter={"additional"} />,
    },
    // {
    //   key: '4',
    //   label: `Работы Вне ВС`,
    //   children: <ProjectTaskListView filter={'hardTime'} />,
    // },
    {
      key: "5",
      label: `Работы по устранению дефектов`,
      children: <NRCListView filter={"MAINT"} />,
    },
  ];
  const history = useNavigate();
  return (
    <div
    // style={{
    //   width: '95%',
    // }}
    >
      {/* <div className="flex justify-between">
        <Title className="my-0" level={4}>
          Просмотр задач <a className="">{currentProject.projectName}</a>
        </Title>
      </div> */}

      <Tabs
        type="card"
        size={"small"}
        defaultActiveKey="1"
        items={items}
        onChange={onChange}
      />
    </div>
  );
};

export default ProjectTasksView;
