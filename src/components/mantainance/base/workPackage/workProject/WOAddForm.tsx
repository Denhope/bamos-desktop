import { AutoComplete, Button, Form, Input, Select, Space } from "antd";
import TextArea from "antd/es/input/TextArea";
import Title from "antd/es/typography/Title";

import { useAppDispatch } from "@/hooks/useTypedSelector";
import { IProjectTaskAll } from "@/models/IProjectTask";
import React, { FC, useRef, useState } from "react";
import { ITaskType } from "@/types/TypesData";
import {
  createProjectTask,
  getProjectNumber,
  getTasks,
} from "@/utils/api/thunks";
import { useTranslation } from "react-i18next";
import { ProForm } from "@ant-design/pro-components";
const WOAddForm: FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [options, setOptions] = useState([]);
  const [optionsWO, setOptionsWO] = useState([]);
  const [selectedTask, setSelectedTask] = useState<ITaskType | null>(null);
  const [selectedWO, setSelectedWO] = useState<any | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRefWO = useRef<NodeJS.Timeout | null>(null);
  const handleSearch = async (value: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      // form.setFieldsValue({
      //   taskDescription: '',
      //   amtoss: '',
      // });
    }
    timeoutRef.current = setTimeout(async () => {
      setOptions(await getTasks(value));
    }, 400);
  };

  const handleSearchWO = async (value: any) => {
    if (timeoutRefWO.current) {
      clearTimeout(timeoutRefWO.current);
      form.setFieldsValue({
        planeNumber: "",
        companyName: "",
        type: "",
      });
    }
    timeoutRefWO.current = setTimeout(async () => {
      setOptionsWO(await getProjectNumber(value));
    }, 400);
  };
  const handleSelect = (value: string) => {
    const task = options.find((task: ITaskType) => task.taskNumber === value);
    if (task) {
      setSelectedTask(task);
      // console.log(task);
      handleSelectChange(task);
    }
  };
  const handleSelectWO = (value: string) => {
    const wo = optionsWO.find((project: any) => project.projectWO === value);
    if (wo) {
      setSelectedWO(wo);
      handleSelectChangeWO(wo);
    }
  };

  const handleSelectChangeWO = (action: any) => {
    form.setFieldsValue({
      planeNumber: action?.aplication.planeNumber,
      companyName: action?.aplication.companyName,
      type: action?.aplication.planeType,
    });
  };
  const handleSelectChange = (action: any) => {
    form.setFieldsValue({
      amtoss: action?.amtossNewRev,
      taskDescription: action?.taskDescription,
    });
  };

  const onFinish = (values: any) => {
    console.log("Received values of form: ", values);
  };
  return (
    <div
      className="flex my-0 mx-auto flex-col"
      style={{
        width: "93%",
      }}
    >
      <ProForm
        name="complex-form"
        // onFinish={onFinish}

        onFinish={async (values: any) => {
          const result = await dispatch(
            createProjectTask({
              projectId: selectedWO?._id,
              taskType: values.taskType,
              taskId: selectedTask?._id,
              newMaterial: [],
              materialReuest: [],
              materialReuestAplications: [],
              status: "отложен",
              name: String(localStorage.getItem("name")),
              sing: String(localStorage.getItem("singNumber")),
              projectTaskNRSs: [],
              createDate: new Date(),
              ownerId: selectedWO.aplication.ownerId,
              plane: {
                registrationNumber: values.planeNumber,
                type: values.type || "",
                companyName: values.companyName,
              },
              optional: {
                amtoss: values.amtoss,
                WOCustomer: values.woCustomer,
                WOPackageType: values.woPackageType,
                taskNumber: values.taskNumber,
                position: values?.position,
                taskDescription: values.taskDescription,
                isActive: false,
                isDone: false,
                isFavorite: false,
                isStarting: false,
              },
              actions: [
                {
                  actionDescription: `ВЫПОЛНЕНО: \r\n ${
                    values.taskDescription
                    //   ?.replace(
                    //   /ДОСТУП ПРИМЕЧАНИЕ:.+/,
                    //   ''.replace(/ДОСТУП:.+/, '')
                    // )
                    // }\nв соответствии с:\nAMM-${task.amtoss}`,
                  }\nв соответствии с:${values.amtoss}`,
                },
              ],
              workStepReferencesLinks: [
                {
                  type: "WO",
                  reference: values.woCustomer || "",
                  description: "Customer WO / WO Заказчика",
                },
                {
                  type: "WO",
                  reference: String(values.woNumber) || "",
                  description: "Local WO / Внутренний WO",
                },
              ],
              cascader:
                selectedTask &&
                selectedTask.accessArr &&
                selectedTask.accessArr.length
                  ? ["mec", "accessOpen"]
                  : null,
              rewiewStatus:
                selectedTask &&
                selectedTask.accessArr &&
                selectedTask.accessArr.length
                  ? "waiting"
                  : null,
            })
          );
        }}
        form={form}
        className="w-full mx-auto"
        autoComplete="off"
      >
        <Form.Item
          rules={[{ required: true }]}
          label="Local WO Number"
          name="woNumber"
        >
          <AutoComplete
            allowClear
            onSelect={handleSelectWO}
            options={optionsWO.map((project: any) => ({
              value: project.projectWO,
            }))}
            onSearch={handleSearchWO}
          >
            {" "}
            <Input />
          </AutoComplete>
        </Form.Item>
        <Form.Item rules={[{ required: true }]} label="Plane Type" name="type">
          <Select allowClear placeholder="Выберите тип ВС">
            <Select.Option value="rrj-95">RRJ-95</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          rules={[{ required: true }]}
          label="Registration Number"
          name="planeNumber"
        >
          <Input allowClear />
        </Form.Item>
        <Form.Item
          rules={[{ required: true }]}
          label="Company Name"
          name="companyName"
        >
          <Input allowClear />
        </Form.Item>
        {/* </Space> */}
        <Form.Item
          rules={[
            {
              required: true,
            },
          ]}
          label="WO Customer"
          name="woCustomer"
        >
          <Input allowClear />
        </Form.Item>
        <Form.Item
          // hasFeedback
          rules={[{ required: true }]}
          label={`${t("Task Number")}`}
          name="taskNumber"
        >
          <AutoComplete
            allowClear
            // options={options || ''}
            onSelect={handleSelect}
            options={options.map((task: any) => ({ value: task.taskNumber }))}
            onSearch={handleSearch}
          >
            {" "}
            <Input />
          </AutoComplete>
        </Form.Item>
        <Form.Item
          rules={[{ required: true }]}
          label="Task Type"
          name="taskType"
        >
          <Select allowClear placeholder="Выберите тип задачи">
            <Select.Option value="routine">Routine</Select.Option>
            <Select.Option value="additional">Additional</Select.Option>
            <Select.Option value="addHock">АddHock</Select.Option>{" "}
          </Select>
        </Form.Item>
        <Form.Item
          rules={[{ required: true }]}
          label="WOPackageType"
          name="woPackageType"
        >
          <Input />
        </Form.Item>
        <Form.Item
          // rules={[{ required: false }]}
          label="Position"
          name="position"
        >
          <Input allowClear />
        </Form.Item>
        <Form.Item rules={[{ required: true }]} label="Amtoss" name="amtoss">
          <Input allowClear />
        </Form.Item>
        <Form.Item
          rules={[{ required: true }]}
          label={`${t("Description")}`}
          name="taskDescription"
        >
          <TextArea allowClear />
        </Form.Item>
        <Form.Item label={`${t("Serial Number")}`} name="serialNumber">
          <Input />
        </Form.Item>
      </ProForm>
    </div>
  );
};

export default WOAddForm;
