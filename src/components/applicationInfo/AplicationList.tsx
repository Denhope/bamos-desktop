import Table, { ColumnsType } from "antd/es/table";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC, useState } from "react";
import { setCurrentAplication } from "../../store/reducers/AplicationSlice";
import { Button, Empty, Form, Input, Modal, Select, Skeleton } from "antd";
import { createProject, fetchAllProjects } from "@/utils/api/thunks";
import { IAplicationInfo } from "@/types/TypesData";
import toast, { Toaster } from "react-hot-toast";
import { addNewProject } from "@/store/reducers/ProjectSlise";
import AplicationInfo from "./AplicationInfo";

const AplicationList: FC = () => {
  const [searchedCompany, setSerchedCompany] = useState("");
  const [searchedType, setSerchedType] = useState("");
  const [searchedNumber, setSerchedNumber] = useState("");
  const [searchedText, setSerchedText] = useState("");
  const { allAplications, isLoading } = useTypedSelector(
    (state) => state.application
  );
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
      title: "Заводской номер",
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
                setOpen(true);
              }}
            >
              Открыть
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
    <div className="flex mt-5  flex-col">
      <div className=" flex flex-col flex-wrap justify-between sm:flex-row ">
        <Form.Item>
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
        </Form.Item>
        <Form.Item name="companyName" label="Компания">
          <Select
            placeholder="Выберите компанию"
            allowClear
            onClear={() => setSerchedCompany("")}
            onSelect={setSerchedCompany}
          >
            <Select.Option value="Азимут">Азимут</Select.Option>

            <Select.Option value="ФГБУ «СЛО «Россия">
              ФГБУ «СЛО «Россия
            </Select.Option>
            <Select.Option value="Rossiya Airlines">
              Rossiya Airlines
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Тип ВС"
          name="type"
          rules={[
            {
              message: "Пожалуйста Выберите тип ВС",
            },
          ]}
        >
          <Select
            placeholder="Выберите тип ВС"
            allowClear
            onClear={() => setSerchedType("")}
            onSelect={setSerchedType}
          >
            <Select.Option value="RRJ-95B">RRJ-95B</Select.Option>
            <Select.Option value="RRJ‑95LR‑100">RRJ‑95LR‑100</Select.Option>
            <Select.Option value="RRJ‑95B‑100">RRJ‑95B‑100</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Заводской номер ВС" name="planeNumber">
          <Select
            allowClear
            placeholder="Выберите заводской номер"
            onSelect={setSerchedNumber}
            onClear={() => setSerchedNumber("")}
          >
            <Select.Option value="89120">89120</Select.Option>
            <Select.Option value="95174">95174</Select.Option>
            <Select.Option value="89079">89079</Select.Option>
            <Select.Option value="89022">89022</Select.Option>
            <Select.Option value="89023">89023</Select.Option>
            <Select.Option value="89032">89032</Select.Option>
            <Select.Option value="89056">89056</Select.Option>
            <Select.Option value="89063">89063</Select.Option>
            <Select.Option value="89102">89102</Select.Option>
            <Select.Option value="89107">89107</Select.Option>
            <Select.Option value="89125">89125</Select.Option>
            <Select.Option value="89126">89126</Select.Option>
            <Select.Option value="89127">89127</Select.Option>
            <Select.Option value="89128">89128</Select.Option>
            <Select.Option value="89169">89169</Select.Option>
            <Select.Option value="89170">89170</Select.Option>
            <Select.Option value="89171">89171</Select.Option>
            <Select.Option value="89172">89172</Select.Option>
            <Select.Option value="89173">89173</Select.Option>
            <Select.Option value="89174">89174</Select.Option>
            <Select.Option value="89175">89175</Select.Option>
            <Select.Option value="89176">89176</Select.Option>
            <Select.Option value="89177">89177</Select.Option>
            <Select.Option value="89178">89178</Select.Option>
            <Select.Option value="89183">89183</Select.Option>
            <Select.Option value="89039">89039</Select.Option>
          </Select>
        </Form.Item>{" "}
      </div>

      <Table
        columns={columns}
        size="small"
        bordered
        scroll={{ y: 540 }}
        dataSource={isLoading ? [] : allAplications}
        locale={{
          emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
        }}
      ></Table>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default AplicationList;
