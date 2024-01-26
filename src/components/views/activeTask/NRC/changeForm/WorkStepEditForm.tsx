import { Button, Checkbox, Form, Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import Title from "antd/es/typography/Title";
import { IAdditionalTask } from "@/models/IAdditionalTask";
import React, { FC, useState } from "react";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import {
  addDoubleInspectionRequired,
  setOptinal,
  updateWorkStepDescription,
  updateWorkStepHeadLine,
} from "@/store/reducers/AdditionalTaskSlice";

import { CheckboxChangeEvent } from "antd/es/checkbox";

export interface IWorkStepFormProps {
  onFinish?: () => void;
  taskData: IAdditionalTask;
}

const WorkStepForm: FC<IWorkStepFormProps> = ({ taskData, onFinish }) => {
  const { currentAdditionalTask } = useTypedSelector(
    (state) => state.additioonalTasks
  );
  const dispatch = useAppDispatch();
  const [taskHeadLine, setTaskHeadline] = useState("");
  const [ata, setTaskAta] = useState("");
  const [position, setPosition] = useState("");
  const [zone, setZone] = useState("");
  const [area, setArea] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const onFinishHeadLine = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskHeadline(e.target.value);
  };

  const onFinishATA = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskAta(e.target.value);
  };
  const onFinishPosition = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPosition(e.target.value);
  };
  const onFinishZone = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZone(e.target.value);
  };
  const onFinishArea = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArea(e.target.value);
  };
  const onFinishDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTaskDescription(e.target.value);
  };

  const [value, setValue] = useState(taskData.isDoubleInspectionRequired);

  const onChange = (e: CheckboxChangeEvent) => {
    setValue(e.target.checked);
  };
  const [form] = Form.useForm();
  return (
    <div className="flex justify-center w-full">
      <Form
        form={form}
        className="w-full"
        autoComplete="off"
        onFinish={onFinish}
        onFinishFailed={(error: any) => {
          console.log({ error });
        }}
      >
        <Title level={5}>Описание дефекта</Title>
        <Form.Item name="WOType" label="Type / Тип Дефекта">
          <Input disabled defaultValue={taskData.taskType} />
        </Form.Item>
        <Form.Item
          name="fuctureNumber"
          label="A/C Registration / Регистрационный номер"
        >
          <Input disabled defaultValue={taskData.plane?.registrationNumber} />
        </Form.Item>
        <Form.Item label="A/C Type / Тип ВС" name="type">
          <Input disabled defaultValue={taskData.plane?.type} />
        </Form.Item>
        <Form.Item rules={[{ required: true }]} label="ATA-Chapter" name="ata">
          <Input
            allowClear
            defaultValue={taskData.optional?.NRCInfo?.ata}
            onChange={onFinishATA}
          />
        </Form.Item>
        <Form.Item label="Position / Позиция" name="position">
          <Input
            allowClear
            defaultValue={taskData.optional?.NRCInfo?.position}
            onChange={onFinishPosition}
          />
        </Form.Item>
        <Form.Item rules={[{ required: true }]} label="Zone / Зона" name="zone">
          <Input
            allowClear
            defaultValue={taskData.optional?.NRCInfo?.zone}
            onChange={onFinishZone}
          />
        </Form.Item>
        <Form.Item
          // rules={[{ required: true }]}
          label="Area / Область"
          name="area"
        >
          <Input
            allowClear
            defaultValue={taskData.optional?.NRCInfo?.area}
            onChange={onFinishArea}
          />
        </Form.Item>
        <Form.Item
          // rules={[{ required: true }]}
          label="HeadLine / Краткое описание "
          name="taskDescription"
        >
          <Input
            allowClear
            disabled
            defaultValue={`${taskData?.taskHeadLine}`}
            onChange={onFinishHeadLine}
          />
        </Form.Item>
        <Form.Item
          // rules={[{ required: true }]}
          label="Step description / Описание дефекта"
          name="StepDescription"
        >
          <TextArea
            // disabled
            allowClear
            defaultValue={taskData.taskDescription}
            onChange={onFinishDescription}
          />
        </Form.Item>
        <Button
          // disabled={taskHeadLine.length == 0 || taskDescription.length == 0}
          onClick={() => {
            // dispatch(updateWorkStepHeadLine(taskHeadLine));
            dispatch(updateWorkStepDescription(taskDescription));
            // dispatch(addDoubleInspectionRequired(value));
            dispatch(
              setOptinal({
                NRCInfo: {
                  ata: ata,
                  zone: zone,
                  area: area,
                  position: position,
                },
                name: currentAdditionalTask.optional?.name,
                sing: currentAdditionalTask.optional?.sing,
              })
            );
          }}
          type="primary"
          htmlType="submit"
          style={{ marginTop: 16 }}
        >
          Дальше
        </Button>
        {/* <Checkbox
          // disabled={taskHeadLine.length == 0 || taskDescription.length == 0}
          onChange={onChange}
          value={true}
          className="p-5"
        >
          Двойная инспекция
        </Checkbox> */}
      </Form>
    </div>
  );
};

export default WorkStepForm;
