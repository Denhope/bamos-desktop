import { Form, Input, Button } from "antd";
import Title from "antd/es/typography/Title";

import { useTypedSelector, useAppDispatch } from "@/hooks/useTypedSelector";
import moment from "moment";
import React, { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  IActionType,
  updateAction,
} from "@/store/reducers/AdditionalTaskSlice";

const NRCDoubleInspectionForm = () => {
  const { currentAdditionalTask } = useTypedSelector(
    (state) => state.additioonalTasks
  );
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const handleSelectChange = (action: any) => {
    form.setFieldsValue({
      doubleInspectionSing:
        action?.doubleInspectionSing || localStorage.getItem("singNumber"),
      doubleInspectedDate:
        action?.doubleInspectedDate || moment.utc().format("Do. MMM. YYYY"),
      doubleInspectedTime:
        action?.doubleInspectedTime || moment.utc().format("HH:mm"),
      doubleInspectedName:
        action.doubleInspectedName || localStorage.getItem("name"),
    });
  };
  useEffect(() => {
    handleSelectChange(currentAdditionalTask.currentAction || {});
  }, [currentAdditionalTask.currentAction?.actionNumber]);
  return (
    <div className="flex justify-center ">
      <Form
        form={form}
        className="w-full"
        autoComplete="off"
        onFinish={(values: IActionType) => {
          dispatch(
            updateAction({
              id: currentAdditionalTask.currentActiveIndex,
              payload: {
                actionDescription:
                  currentAdditionalTask?.currentAction?.actionDescription,
                performedSing: String(
                  currentAdditionalTask?.currentAction?.performedSing
                ).trim(),
                performedName: String(
                  currentAdditionalTask?.currentAction?.performedName
                ).trim(),
                performedDate:
                  currentAdditionalTask?.currentAction?.performedDate,
                performedTime:
                  currentAdditionalTask?.currentAction?.performedTime,
                inspectedDate:
                  currentAdditionalTask?.currentAction?.inspectedDate,
                inspectedName: String(
                  currentAdditionalTask?.currentAction?.inspectedName
                ).trim(),

                inspectedSing: String(
                  currentAdditionalTask?.currentAction?.inspectedSing?.trim()
                ),
                doubleInspectionSing: values?.doubleInspectionSing,
                doubleInspectedDate: values?.doubleInspectedDate,
                doubleInspectedTime: values?.doubleInspectedTime,
                doubleInspectedName: values.doubleInspectedName,
                actionNumber: currentAdditionalTask.currentActiveIndex + 1,
              },
            })
          );
          toast.success("Инспекция успешно добавлена");
          form.resetFields();
        }}
        onFinishFailed={(error: any) => {
          console.log({ error });
        }}
      >
        <Title level={5}>
          Add Double Inspection / Добавить двойную инспекцию
        </Title>

        <div className="flex flex-col">
          <Form.Item
            rules={[{ required: true }]}
            label="Inspection Sign / 
Табельный номер контроллера"
            name="doubleInspectionSing"
          >
            <Input
            // defaultValue={
            //   currentAdditionalTask.currentAction?.doubleInspectionSing
            // }
            />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Name / 
Имя Фамилия"
            name="doubleInspectedName"
          >
            <Input
            // defaultValue={
            //   currentAdditionalTask.currentAction?.doubleInspectedName
            // }
            />
          </Form.Item>

          <Form.Item
            rules={[{ required: true }]}
            label="Date / Дата (UTC) "
            name="doubleInspectedDate"
          >
            <Input
              defaultValue={
                currentAdditionalTask.currentAction?.doubleInspectedDate ||
                moment.utc().format("Do. MMM. YYYY")
              }
            />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Time / время (UTC) "
            name="doubleInspectedTime"
          >
            <Input
              defaultValue={
                currentAdditionalTask.currentAction?.doubleInspectedTime ||
                moment.utc().format("HH:mm")
              }
            />
          </Form.Item>

          <Button
            className=""
            htmlType="submit"
            // onClick={resetValues}
            style={{ marginTop: 16 }}
          >
            Add Inspection / Добавить инспекцию
          </Button>
        </div>

        <Toaster position="top-center" reverseOrder={false} />
      </Form>
    </div>
  );
};

export default NRCDoubleInspectionForm;
