import ProjectForm from "@/components/views/project/ProjectForm";
import React, { FC, useState } from "react";

import {
  Button,
  Divider,
  Drawer,
  FloatButton,
  Form,
  Modal,
  Space,
  Switch,
} from "antd";
import { fetchAllProjects, updateProject } from "@/utils/api/thunks";
import toast, { Toaster } from "react-hot-toast";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import Title from "antd/es/typography/Title";
import { SettingOutlined, FullscreenOutlined } from "@ant-design/icons";
import { setisProjectTAskListFull } from "@/store/reducers/ViewsSlice";
import ProjectListView from "./ProjectListView";

const ProjectInfoView: FC = () => {
  const { allProjects, isLoading, currentProject } = useTypedSelector(
    (state) => state.projects
  );
  const { ProjectsTask, countByStatus } = useTypedSelector(
    (state) => state.projectTask
  );
  const { countAdditionalByStatus } = useTypedSelector(
    (state) => state.additioonalTasks
  );

  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const [showTitle, setShowTitle] = useState(false);

  const handleTitleChange = (enable: boolean) => {
    setShowTitle(enable);
    dispatch(setisProjectTAskListFull(showTitle));
  };
  const [openW, setOpenW] = useState(false);
  const onClose = () => {
    setOpenW(false);
  };
  return (
    <div className="flex flex-col">
      <Title
        className="py-0 my-0 flex justify-between gap-2 flex-wrap"
        level={5}
      >
        <Space className="flex  justify-start">
          {" "}
          <a className="">W/O: {currentProject.projectWO}</a>
          <a className="">{currentProject.projectName}</a>
          {localStorage.getItem("role") == "admin" && (
            <SettingOutlined onClick={() => setOpen(true)} />
          )}
          <Button onClick={() => setOpenW(true)}>Выбор пакета</Button>
        </Space>

        <div className="flex flex-col justify-between">
          {" "}
          <div className="flex gap-1 flex-wrap ">
            <div className="">РАБОТЫ: всего - {countByStatus.all},</div>
            <div className="">активные - {countByStatus.active},</div>
            <div className="">неактивные - {countByStatus.postponed},</div>
            <div className="">выполненые - {countByStatus.completed},</div>
            <div className="">закрытые - {countByStatus.closed}.</div>
          </div>
          <div className="flex gap-1 flex-wrap">
            <div className="">NRC: всего - {countAdditionalByStatus.all},</div>
            <div className="">активные - {countAdditionalByStatus.active},</div>
            <div className="">
              неактивные - {countAdditionalByStatus.postponed},
            </div>
            <div className="">
              выполненые - {countAdditionalByStatus.completed},
            </div>
            <div className="">закрытые - {countAdditionalByStatus.closed}</div>
          </div>
        </div>
      </Title>
      <Drawer
        title={`Выбор Пакета`}
        placement="right"
        size={"large"}
        onClose={onClose}
        open={openW}
        //</div>extra={
        //<Space>
        // <Button onClick={onClose}>Cancel</Button>
        // <Button type="primary" onClick={onClose}>
        //   OK
        // </Button>
        // </Space>
        //}
      >
        {" "}
        <ProjectListView />
      </Drawer>
      <Modal
        okButtonProps={{}}
        title="Основные сведения о проекте"
        centered
        open={open}
        cancelText="отмена"
        okType={"default"}
        okText="Сохранить проект"
        onOk={async () => {
          const result = await dispatch(
            updateProject({
              projectName: currentProject.projectName,
              status: currentProject.status,
              optional: currentProject.optional,
              id: currentProject.id,
              finishDate: currentProject.finishDate,
              startDate: currentProject.startDate,
              projectWO: currentProject.projectWO,
            })
          );
          dispatch(fetchAllProjects());
          if (result.meta.requestStatus === "fulfilled") {
            toast.success("Данные успешно обновлены");
            setOpen(false);
          } else {
            toast.error("Не удалось обновить проект");
          }
        }}
        onCancel={() => {
          setOpen(false);
        }}
        width={"80%"}
      >
        <ProjectForm project={currentProject} />
      </Modal>{" "}
    </div>
  );
};

export default ProjectInfoView;
