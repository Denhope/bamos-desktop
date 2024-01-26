import { Button, Form, Radio, RadioChangeEvent, Space } from "antd";
import Title from "antd/es/typography/Title";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC, useState } from "react";
import { useDispatch } from "react-redux";
import {
  setStatus,
  updatefinishDate,
  setOptional,
} from "@/store/reducers/ProjectTaskSlise";

export interface IWorkPerformedForm {
  onFinish?: () => void;
}
const WorkPerformedFormView: FC<IWorkPerformedForm> = ({ onFinish }) => {
  const { currentProjectTask } = useTypedSelector((state) => state.projectTask);
  const [value, setValue] = useState(currentProjectTask.optional?.isDone);
  const dispatch = useDispatch();

  const onChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
  };
  return (
    <div className="flex flex-col justify-between">
      <Form
        autoComplete="off"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 24 }}
        onFinish={onFinish}
      >
        <Title level={5}>Work Performed / Работа выполнена</Title>
        <Form.Item rules={[{ required: true }]}>
          <Radio.Group onChange={onChange} value={value}>
            <Space direction="vertical">
              <Radio value={true}>YES /ДА</Radio>
              <Radio className="mt-auto" value={false}>
                NO /НЕТ
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          onClick={() => {
            dispatch(
              setOptional({
                WOCustomer: currentProjectTask.optional?.WOCustomer,
                MJSSNumber: currentProjectTask.optional?.MJSSNumber,
                WOPackageType: currentProjectTask.optional?.WOPackageType,
                isHaveNRC: currentProjectTask.optional?.isHaveNRC,
                workerId: currentProjectTask.optional?.workerId,
                taskNumber: currentProjectTask.optional?.taskNumber,
                position: currentProjectTask.optional?.position,
                taskDescription: currentProjectTask.optional?.taskDescription,
                isDone: value,
                isActive: false,

                finalAction: {
                  closingSing:
                    currentProjectTask.optional?.finalAction?.closingSing,
                  closingDate:
                    currentProjectTask.optional?.finalAction?.closingDate,
                  DIClosingSing:
                    currentProjectTask.optional?.finalAction?.DIClosingSing,
                  DIClosingDate:
                    currentProjectTask.optional?.finalAction?.DIClosingDate,
                },
              })
            );
            if (value == true) {
              dispatch(setStatus("выполнен"));
              dispatch(updatefinishDate(new Date()));
            }
          }}
          style={{ marginTop: 16 }}
        >
          Дальше
        </Button>
        <p className="text-l mt-4 font-semibold my-0">
          I HEREBY CERTIFY THAT ALL CAUTIONS AND WARNINGS HAVE BEEN READ AND THE
          WORK HAS BEEN CARRIED OUT IN ACCORDANCE WITH ALL LAYED DOWN PROCEDURES
          AND ATTACHED NOTES AND INFORMATION. НАСТОЯЩИМ УТВЕРЖДАЮ, ЧТО ВСЕ
          ПРЕДУПРЕЖДЕНИЯ И ПРЕДОСТЕРЕЖЕНИЯ ИЗУЧЕНЫ. РАБОТА ВЫПОЛНЕНА В
          СООТВЕТСТВИИ СО ВСЕМИ ПРИЛОЖЕННЫМИ ИНСТРУКЦИЯМИ.
        </p>
      </Form>
    </div>
  );
};

export default WorkPerformedFormView;
