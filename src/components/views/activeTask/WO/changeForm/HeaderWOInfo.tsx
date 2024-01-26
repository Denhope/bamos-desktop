import { Button, Form, Input } from "antd";
import Title from "antd/es/typography/Title";
import { useTypedSelector } from "@/hooks/useTypedSelector";

import { IProjectTask, IProjectTaskAll } from "@/models/IProjectTask";
import moment from "moment";
import React, { FC, useState } from "react";
import { useDispatch } from "react-redux";
import { setOptional } from "@/store/reducers/ProjectTaskSlise";

export interface IHeaderInformationFormProps {
  onFinish?: () => void;
  taskData: IProjectTaskAll;
}
const HeaderWOInfo: FC<IHeaderInformationFormProps> = ({
  onFinish,
  taskData,
}) => {
  const next = () => {};
  const dispatch = useDispatch();
  const [sing, setSing] = useState("");
  const onFinishSing = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSing(e.target.value);
  };
  const { currentProject } = useTypedSelector((state) => state.projects);

  return (
    <div className="flex justify-center w-full">
      <Form
        className="w-full"
        // initialValues={''}
        autoComplete="off"
        // labelCol={{ span: 12 }}
        // wrapperCol={{ span: 14 }}
        onFinish={onFinish}
        onFinishFailed={(error: any) => {
          console.log({ error });
        }}
      >
        <Title level={5}>Введите основную информацию</Title>
        <Form.Item name="fuctureNumber" label=" A/C Registration">
          <Input
            disabled
            defaultValue={currentProject.aplicationId.planeNumber}
          />
        </Form.Item>
        <Form.Item label="A/C Type / Тип ВС" name="type">
          <Input
            disabled
            defaultValue={currentProject.aplicationId.planeType}
          ></Input>
        </Form.Item>
        {/* <Form.Item label="ATA-Chapter" name="typee">
          <Input disabled defaultValue={taskData.plane?.type}></Input>
        </Form.Item> */}
        <Form.Item label="References / Ссылки" name="amtoss">
          <Input disabled defaultValue={`W/O: ${taskData.projectTaskWO}`} />
        </Form.Item>
        <Form.Item name="companyName" label="Company / Компания">
          <Input
            disabled
            defaultValue={currentProject.aplicationId.companyName}
          />
        </Form.Item>
        <Form.Item name="createDate" label="Date / Time / Дата создания  (UTC)">
          <Input
            disabled
            defaultValue={moment(taskData.createDate)
              .utc()
              .format("Do MMM  YYYY HH:mm")}
          />
        </Form.Item>
        <Form.Item name="location" label="Station / Место выполнения">
          <Input disabled defaultValue="MSQ" />
        </Form.Item>
        {/* <Form.Item name="sing" label="Sing / Табельный номер">
          <Input
            allowClear
            defaultValue={`${taskData.name} (${taskData.sing})`}
            onChange={onFinishSing}
            disabled
          />
        </Form.Item> */}
        <Button
          disabled={sing.length == 0}
          onClick={() => {
            dispatch(
              setOptional({ isDone: false, isActive: false, workerId: sing })
            );
          }}
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

export default HeaderWOInfo;
