import { Form, Input, Button } from "antd";
import Title from "antd/es/typography/Title";

import { useTypedSelector, useAppDispatch } from "@/hooks/useTypedSelector";
import moment from "moment";
import React, { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { IActionType } from "@/store/reducers/AdditionalTaskSlice";
import { updateAction } from "@/store/reducers/ProjectTaskSlise";
const WODoubleInspectionForm = () => {
  const { currentProjectTask } = useTypedSelector((state) => state.projectTask);
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
    handleSelectChange(currentProjectTask.currentAction || {});
  }, [currentProjectTask.currentAction?.actionNumber]);
  return (
    <div className="flex justify-center ">
      <Form
        form={form}
        className="w-full"
        autoComplete="off"
        onFinish={(values: IActionType) => {
          dispatch(
            updateAction({
              id: currentProjectTask.currentActiveIndex,
              payload: {
                actionDescription:
                  currentProjectTask?.currentAction?.actionDescription,
                performedSing: currentProjectTask?.currentAction?.performedSing,
                performedName: currentProjectTask?.currentAction?.performedName,
                performedDate: currentProjectTask?.currentAction?.performedDate,
                performedTime: currentProjectTask?.currentAction?.performedTime,
                inspectedDate: currentProjectTask?.currentAction?.inspectedDate,
                inspectedName: currentProjectTask?.currentAction?.inspectedName,

                inspectedSing: currentProjectTask?.currentAction?.inspectedSing,
                doubleInspectionSing: values?.doubleInspectionSing,
                doubleInspectedDate: values?.doubleInspectedDate,
                doubleInspectedTime: values?.doubleInspectedTime,
                doubleInspectedName: values.doubleInspectedName,
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
            //   currentProjectTask.currentAction?.doubleInspectionSing
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
            //   currentProjectTask.currentAction?.doubleInspectedName
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
                currentProjectTask.currentAction?.doubleInspectedDate ||
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
                currentProjectTask.currentAction?.doubleInspectedTime ||
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

export default WODoubleInspectionForm;
