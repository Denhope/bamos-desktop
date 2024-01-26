import {
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  Space,
  TimePicker,
  TimePickerProps,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import Title from "antd/es/typography/Title";
import React, { FC, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import type { DatePickerProps } from "antd";

import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { addAction } from "@/store/reducers/ProjectTaskSlise";
import { IActionType } from "@/store/reducers/AdditionalTaskSlice";
import moment from "moment";

export interface IAddActionFormProps {
  onFinish?: () => void;
}
const { Option } = Select;

type PickerType = "time" | "date";

const PickerWithType = ({
  type,
  onChange,
}: {
  type: PickerType;
  onChange: TimePickerProps["onChange"] | DatePickerProps["onChange"];
}) => {
  if (type === "time") return <TimePicker onChange={onChange} />;
  if (type === "date") return <DatePicker onChange={onChange} />;
  return <DatePicker picker={type} onChange={onChange} />;
};
// const resetValues = () => {
//   toast.success('Действие добавлена');
// };
const AddActionForm: FC<IAddActionFormProps> = ({ onFinish }) => {
  const { currentProjectTask } = useTypedSelector((state) => state.projectTask);
  const [form] = Form.useForm();
  const { Option } = Select;
  const dispatch = useAppDispatch();

  return (
    <div className="flex justify-center w-full">
      <Form
        form={form}
        className="w-full"
        autoComplete="off"
        onFinish={(values: IActionType) => {
          dispatch(
            addAction({
              actionDescription: values.actionDescription,
              performedSing: values.performedSing,
              performedName: values.performedName,
              performedDate: values.performedDate,
              inspectedTime: values.performedTime,
              actionNumber: currentProjectTask.actions.length + 1,
            })
          );
          toast.success("Описание успешно обнавлено");
          form.resetFields();
          // form.resetFields();
        }}
        onFinishFailed={(error: any) => {
          console.log({ error });
        }}
      >
        <Title level={5}>Add Action / Добавить действие</Title>
        <div className="flex flex-col">
          <Form.Item
            rules={[{ required: true }]}
            label="Action description / 
Описание действия"
            name="actionDescription"
          >
            <TextArea />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Performed Sign / 
Табельный номер исполнителя"
            name="performedSing"
          >
            <Input defaultValue={localStorage.getItem("singNumber") || ""} />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Name / 
Имя Фамилия"
            name="performedName"
          >
            <Input defaultValue={localStorage.getItem("name") || ""} />
          </Form.Item>

          <Form.Item
            rules={[{ required: true }]}
            label="Date / Дата (UTC) "
            name="performedDate"
          >
            <Input defaultValue={moment.utc().format("Do. MMM. YYYY")} />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Time / время (UTC) "
            name="performedTime"
          >
            <Input defaultValue={moment.utc().format("HH:mm")} />
          </Form.Item>
          <Form.Item>
            <Button
              className=""
              htmlType="submit"
              // onClick={resetValues}
              style={{ marginTop: 16 }}
            >
              Add Next Action / Добавить новое Действие
            </Button>
          </Form.Item>
        </div>

        {/* <Button
          onClick={onFinish}
          type="primary"
          htmlType="submit"
          style={{ marginTop: 16 }}
        >
          Дальше
        </Button> */}
        <Toaster position="top-center" reverseOrder={false} />
      </Form>
    </div>
  );
};

export default AddActionForm;
