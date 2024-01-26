import { Button, Form, Input, Radio, RadioChangeEvent, Space } from "antd";
import Title from "antd/es/typography/Title";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import { IAdditionalTask } from "@/models/IAdditionalTask";
import { IProjectTaskAll } from "@/models/IProjectTask";
import React, { FC, useState } from "react";
import { useDispatch } from "react-redux";
import { updateMaintenanceType } from "@/store/reducers/AdditionalTaskSlice";

export interface IWOTpeFormProps {
  onFinish?: () => void;
  taskData?: IAdditionalTask;
}
export enum Shudle {
  "routine",
  "hardTime",
  "additional",
  "partRepare",
}
const WOTypeForm: FC<IWOTpeFormProps> = ({ onFinish, taskData }) => {
  const { currentAdditionalTask } = useTypedSelector(
    (state) => state.additioonalTasks
  );
  const [value, setValue] = useState(currentAdditionalTask.taskType || "MAINT");
  const dispatch = useDispatch();

  const onChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
  };
  const [disabled, setDisabled] = useState(true);
  const next = () => {};
  return (
    <div className="flex flex-col">
      <Form
        autoComplete="off"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 24 }}
        onFinish={onFinish}
      >
        <Title level={5}>Выберите тип работы (дефекта)</Title>
        <Form.Item rules={[{ required: true }]}>
          <Radio.Group disabled onChange={onChange} value={value}>
            <Space direction="vertical">
              <Radio value="MAINT">
                Maitenance Defect / Замечание при обслуживании
              </Radio>
              <Radio value="PIREP">Pilot report / Замечание экипажа</Radio>
              <Radio value="CABIN">
                {" "}
                Cabine report / Замечание б/проводника
              </Radio>
              <Radio value={Shudle}>Scheduled / Плановые работы</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          onClick={() => {
            dispatch(updateMaintenanceType(value));
          }}
          style={{ marginTop: 16 }}
        >
          Дальше
        </Button>
      </Form>
    </div>
  );
};

export default WOTypeForm;
