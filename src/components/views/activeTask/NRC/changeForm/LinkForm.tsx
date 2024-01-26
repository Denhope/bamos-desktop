import { Button, Form, Input } from "antd";
import Title from "antd/es/typography/Title";
import { IAdditionalTask } from "@/models/IAdditionalTask";
import React, { FC } from "react";

export interface ILinkFormFormProps {
  onFinish?: () => void;
  taskData: IAdditionalTask;
}
const LinkForm: FC<ILinkFormFormProps> = ({ onFinish, taskData }) => {
  return (
    <div className=" flex justify-center w-full">
      <Form
        className="w-full"
        autoComplete="off"
        onFinish={(values) => {
          // dispatch(updateProjectName(values.projectName));
        }}
        onFinishFailed={(error: any) => {
          console.log({ error });
        }}
      >
        <Title level={5}>References / Ссылки </Title>
        <Form.Item name="WO" label="WO">
          <Input disabled defaultValue={taskData.projectTaskID} />
        </Form.Item>
        <Form.Item name="AMM" label="AMM">
          <Input />
        </Form.Item>
        <Form.Item name="SB" label="SB">
          <Input />
        </Form.Item>

        <Button
          onClick={onFinish}
          type="primary"
          htmlType="submit"
          style={{ marginTop: 16 }}
        >
          Дальше
        </Button>
      </Form>
    </div>
  );
};

export default LinkForm;
