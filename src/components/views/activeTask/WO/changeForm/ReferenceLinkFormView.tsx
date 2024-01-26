import { Button, Form, Input, Radio } from "antd";
import TextArea from "antd/es/input/TextArea";
import Title from "antd/es/typography/Title";
import { IAdditionalTask } from "@/models/IAdditionalTask";
import { IProjectTaskAll } from "@/models/IProjectTask";
import React, { FC } from "react";

export interface ILinkFormFormProps {
  onFinish?: () => void;
  taskData: IProjectTaskAll;
}
const ReferenceLinkFormView: FC<ILinkFormFormProps> = ({
  onFinish,
  taskData,
}) => {
  return (
    <div className=" flex justify-center w-full">
      <Form
        className="w-full"
        // initialValues={''}
        autoComplete="off"
        // labelCol={{ span: 6 }}
        // wrapperCol={{ span: 48 }}
        onFinish={(values) => {
          // dispatch(updateProjectName(values.projectName));
        }}
        onFinishFailed={(error: any) => {
          console.log({ error });
        }}
      >
        <Title level={5}>References / Ссылки </Title>
        <Form.Item name="WO" label="WO">
          <Input disabled defaultValue={taskData._id} />
        </Form.Item>
        <Form.Item name="NRC" label="NRC">
          <Input />
        </Form.Item>
        <Form.Item name="AMM" label="AMM">
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

export default ReferenceLinkFormView;
