import { Button, Empty, Form, Input, Modal, Skeleton } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { IProjectInfo } from "@/models/IProject";
import React, { FC, useState } from "react";
import { setCurrentProject } from "@/store/reducers/ProjectSlise";
import { setProjectTaskMode } from "@/store/reducers/AdditionalTaskSlice";
import { PlusOutlined } from "@ant-design/icons";

import {
  featchCountAdditionalByStatus,
  featchCountByStatus,
  updateProject,
} from "@/utils/api/thunks";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
const ProjectListView: FC = () => {
  const { allProjects, isLoading, currentProject } = useTypedSelector(
    (state) => state.projects
  );
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [searchedText, setSerchedText] = useState("");
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const rowClassName = (record: any) => {
    return record.id === selectedRowKey
      ? "cursor-pointer text-xs text-transform: uppercase bg-blue-400"
      : "cursor-pointer text-xs text-transform: uppercase ";
  };
  const { t } = useTranslation();
  const columns: ColumnsType<IProjectInfo> = [
    {
      title: `${t("W/O")}`,
      dataIndex: "projectWO",
      key: "projectWO",
      responsive: ["sm"],
      sorter: (a, b) => (a.projectWO || 0) - (b.projectWO || 0),
      filteredValue: [searchedText],
      onFilter: (value: any, record: any) => {
        return String(record?.projectWO).includes(value);
      },
    },
    {
      title: "Пакет",
      dataIndex: "projectName",
      key: "projectName",
      responsive: ["sm"],
    },
    {
      title: "Компания",
      dataIndex: ["aplicationId", "companyName"],
      key: "companyName",

      responsive: ["sm"],
    },
    {
      title: "Рег. Номер",
      dataIndex: ["aplicationId", "planeNumber"],
      key: "planeNumber",
      responsive: ["sm"],
    },
    {
      title: "Вид работ",
      dataIndex: ["aplicationId", "serviceType"],
      key: "serviceType",
      responsive: ["sm"],
    },
    {
      title: "Статус",
      dataIndex: ["status"],
      key: "serviceType",
      responsive: ["sm"],
    },
    // {
    //   key: 'action',
    //   title: 'Действие',
    //   render: (record: IProjectInfo) => {
    //     return (
    //       <div className="flex gap-1 flex-wrap">
    //         {' '}
    //         <Button
    //           size="small"
    //           type="primary"
    //           onClick={() => {
    //             dispatch(setCurrentProject(record));
    //             dispatch(featchCountByStatus(record.id || ''));
    //             dispatch(featchCountAdditionalByStatus(record.id || ''));
    //             // setOpen(true);
    //             dispatch(setProjectTaskMode(true));
    //           }}
    //         >
    //           Открыть
    //         </Button>
    //       </div>
    //     );
    //   },
    // },
  ];
  //
  return (
    <div>
      <Input.Search
        size="small"
        style={{ width: 165 }}
        allowClear
        placeholder="Поиск..."
        onSearch={(value) => {
          setSerchedText(value);
        }}
        onChange={(e) => {
          setSerchedText(e.target.value);
        }}
      />

      <Table
        className="my-1 py-1"
        onRow={(record, rowIndex) => {
          return {
            onClick: (event) => {
              setSelectedRowKey(record?.id || "");
              dispatch(setCurrentProject(record));
              dispatch(featchCountByStatus(record.id || ""));
              dispatch(featchCountAdditionalByStatus(record.id || ""));
              dispatch(setProjectTaskMode(true));
            },
          };
        }}
        // onRow={(record)=>{ dispatch(setCurrentProject(record));
        //   dispatch(featchCountByStatus(record.id || ''));
        //   dispatch(featchCountAdditionalByStatus(record.id || ''));
        //   // setOpen(true);
        //   dispatch(setProjectTaskMode(true));}}
        size="small"
        rowClassName={rowClassName}
        columns={columns}
        bordered
        scroll={{ y: "calc(10vh)" }}
        dataSource={isLoading ? [] : allProjects}
        locale={{
          emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
        }}
      ></Table>
      <>{/* <PlusOutlined onClick={() => {}} /> Создать новый проект */}</>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default ProjectListView;
