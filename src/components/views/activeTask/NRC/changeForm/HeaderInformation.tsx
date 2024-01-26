import { Button, Form, Input } from "antd";
import Title from "antd/es/typography/Title";
import { IAdditionalTask } from "@/models/IAdditionalTask";

import moment from "moment";
import React, { FC, useState } from "react";
import { useDispatch } from "react-redux";
import { setOptinal } from "@/store/reducers/AdditionalTaskSlice";
import { setCurrentProjectTask } from "@/store/reducers/ProjectTaskSlise";
export interface IHeaderInformationFormProps {
  onFinish?: () => void;
  taskData: IAdditionalTask;
}
const HeaderInformation: FC<IHeaderInformationFormProps> = ({
  onFinish,
  taskData,
}) => {
  const next = () => {};
  const dispatch = useDispatch();
  const [sing, setSing] = useState("");
  const [name, setName] = useState("");
  const onFinishSing = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSing(e.target.value);
  };
  const onFinishName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  return (
    <div className="flex justify-center w-full">
      <Form
        className="w-full"
        autoComplete="off"
        onFinish={onFinish}
        onFinishFailed={(error: any) => {
          console.log({ error });
        }}
      >
        <Title level={5}>Введите основную информацию</Title>
        <Form.Item name="fuctureNumber" label=" A/C Registration">
          <Input disabled defaultValue={taskData.plane?.registrationNumber} />
        </Form.Item>
        <Form.Item label="A/C Type / Тип ВС" name="type">
          <Input disabled defaultValue={taskData.plane?.type}></Input>
        </Form.Item>

        <Form.Item label="References / Ссылки" name="amtoss">
          <Input disabled defaultValue={`WO: ${taskData.projectTaskWO}`} />
        </Form.Item>
        <Form.Item name="companyName" label="Company / Компания">
          <Input disabled defaultValue={taskData.plane?.companyName} />
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

        <Form.Item name="sing" label="Sing / Табельный номер">
          <Input
            allowClear
            disabled={taskData.additionalNumberId != null}
            defaultValue={
              taskData.optional?.sing ||
              localStorage.getItem("singNumber") ||
              ""
            }
            onChange={onFinishSing}
          />
        </Form.Item>
        <Form.Item name="name" label="Name / Имя Фамилия">
          <Input
            allowClear
            disabled={taskData.additionalNumberId != null}
            defaultValue={
              taskData.optional?.name || localStorage.getItem("name") || ""
            }
            onChange={onFinishName}
          />
        </Form.Item>

        <Button
          disabled={sing.length == 0}
          onClick={() => {
            dispatch(
              setOptinal({
                isDone: false,
                isActive: false,
                sing: sing,
                name: name,
              })
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

export default HeaderInformation;
