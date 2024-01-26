import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  Table,
  Skeleton,
  Empty,
} from "antd";
import { ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";

import { useTypedSelector, useAppDispatch } from "@/hooks/useTypedSelector";
import React, { FC, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { setCurrentAplication } from "@/store/reducers/AplicationSlice";
import { IAplicationInfo } from "@/types/TypesData";
import { createProject, fetchAllProjects } from "@/utils/api/thunks";

interface AplicationListProps {
  // toggleColumn: (columnKey: any) => void;
  columns?: any;
  // initialColumns: any;
  height: string;
  scroll: string;
}
const AplicationViewList: FC<AplicationListProps> = ({ height, scroll }) => {
  const [searchedCompany, setSerchedCompany] = useState("");
  const [searchedType, setSerchedType] = useState("");
  const [searchedNumber, setSerchedNumber] = useState("");
  const [searchedText, setSerchedText] = useState("");
  const { allAplications, isLoading } = useTypedSelector(
    (state) => state.application
  );
  const { currentAplication } = useTypedSelector((state) => state.application);
  const [open, setOpen] = useState(false);

  const dispatch = useAppDispatch();

  const columns: ColumnsType<any> = [
    {
      title: "Заявка",
      dataIndex: "aplicationName",
      key: "aplicationName",
      responsive: ["sm"],
      filteredValue: [searchedText],
      onFilter: (value: any, record: any) => {
        return (
          record.aplicationName?.toLowerCase().includes(value.toLowerCase()) ||
          record.planeType?.toLowerCase().includes(value.toLowerCase()) ||
          record.planeNumber?.toLowerCase().includes(value.toLowerCase()) ||
          record.companyName?.toLowerCase().includes(value.toLowerCase())
        );
      },
    },
    {
      title: "Компания",
      dataIndex: "companyName",
      key: "companyName",
      filteredValue: [searchedCompany],
      responsive: ["sm"],
      onFilter: (value, record) => {
        return record.companyName?.includes(value);
      },
    },
    {
      title: "Тип ВС",
      dataIndex: "planeType",
      key: "planeType",
      filteredValue: [searchedType],
      responsive: ["sm"],
      onFilter: (value, record) => {
        return record.planeType?.includes(value);
      },
    },
    {
      title: "Рег. Номер",
      dataIndex: "planeNumber",
      key: "planeNumber",
      filteredValue: [searchedNumber],
      responsive: ["sm"],
      onFilter: (value, record) => {
        return record.planeNumber?.includes(value);
      },
    },

    {
      key: "action",
      title: "Действие",
      render: (record: IAplicationInfo) => {
        return (
          <div className="flex gap-1 flex-wrap">
            {" "}
            <Button
              size="small"
              type="primary"
              onClick={() => {
                dispatch(setCurrentAplication(record));
              }}
            >
              Открыть
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={async () => {
                const result = await dispatch(
                  createProject({
                    aplicationId: record.id,
                    projectName: record.aplicationName,
                    ownerId: record.ownerId,
                    createDate: new Date(),
                    startDate: null,
                    finishDate: null,
                    optional: {
                      isRoutineTaskCreated: false,
                      isAdditionalTaskCreated: false,
                      isHardTimeTasksCreated: false,
                      isStarting: false,
                      isFavorite: false,
                      isDone: false,
                      isActive: false,
                    },
                    isEdited: false,

                    status: "отложен",
                  })
                );
                if (result.meta.requestStatus === "fulfilled") {
                  toast.success("Проект успешно создан");
                  dispatch(fetchAllProjects());
                } else {
                  toast.error(
                    "Не удалось создать проект, или проект уже существует"
                  );
                }
              }}
            >
              Создать проект
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div
      className="flex mt-4 mx-auto flex-col"
      style={{
        width: "95%",
      }}
    >
      <div className=" flex flex-col flex-wrap justify-between sm:flex-row ">
        <Input.Search
          allowClear
          placeholder="Поиск..."
          onSearch={(value) => {
            setSerchedText(value);
          }}
          onChange={(e) => {
            setSerchedText(e.target.value);
          }}
        />

        <Title className="my-0" level={4}>
          <a className="">{currentAplication.aplicationName}</a>
        </Title>
      </div>
      <div className={`${height}`}>
        {/* <div className="h-1/3"> */}{" "}
        <Table
          className="my-1"
          columns={columns}
          rowClassName="text-xs text-transform: uppercase"
          size="small"
          bordered
          scroll={{ y: `${scroll}` }}
          // scroll={{ y: 'calc(15vh)' }}
          dataSource={isLoading ? [] : allAplications}
          locale={{
            emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
          }}
        ></Table>
      </div>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default AplicationViewList;
