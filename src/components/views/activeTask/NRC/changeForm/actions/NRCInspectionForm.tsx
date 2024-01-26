import { Button, Form, Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import Title from "antd/es/typography/Title";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import moment from "moment";
import React, { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  IActionType,
  setCurrentAdditionalTask,
  updateAction,
} from "@/store/reducers/AdditionalTaskSlice";

const InspectionForm = () => {
  const { currentAdditionalTask } = useTypedSelector(
    (state) => state.additioonalTasks
  );
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const handleSelectChange = (action: any) => {
    form.setFieldsValue({
      inspectedDate:
        action.inspectedDate || moment.utc().format("Do. MMM. YYYY"),
      inspectedTime: action.inspectedTime || moment.utc().format("HH:mm"),
      inspectedSing: action.inspectedSing || localStorage.getItem("singNumber"),
      inspectedName: action.inspectedName || localStorage.getItem("name"),
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
                performedSing:
                  currentAdditionalTask?.currentAction?.performedSing,
                performedDate:
                  currentAdditionalTask?.currentAction?.performedDate,
                performedTime:
                  currentAdditionalTask?.currentAction?.performedTime,
                performedName:
                  currentAdditionalTask?.currentAction?.performedName,
                inspectedDate: values.inspectedDate,
                inspectedTime: values.inspectedTime,
                inspectedSing: values.inspectedSing,
                inspectedName: values.inspectedName,
                doubleInspectionSing:
                  currentAdditionalTask?.currentAction?.doubleInspectionSing,
                doubleInspectedDate:
                  currentAdditionalTask?.currentAction?.doubleInspectedDate,
                doubleInspectedTime:
                  currentAdditionalTask?.currentAction?.doubleInspectedTime,
                doubleInspectedName:
                  currentAdditionalTask?.currentAction?.doubleInspectedName,
                actionNumber: currentAdditionalTask.currentAction?.actionNumber,
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
        <Title level={5}>Add Inspection / Добавить инспекцию</Title>

        <div className="flex flex-col">
          <Form.Item
            rules={[{ required: true }]}
            label="Inspection Sign / 
Табельный номер инспектора"
            name="inspectedSing"
          >
            <Input
              defaultValue={
                currentAdditionalTask.currentAction?.inspectedSing ||
                localStorage.getItem("singNumber") ||
                ""
              }
            />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Name / 
Имя Фамилия"
            name="inspectedName"
          >
            <Input
              defaultValue={
                currentAdditionalTask.currentAction?.inspectedName ||
                localStorage.getItem("name") ||
                ""
              }
            />
          </Form.Item>

          <Form.Item
            rules={[{ required: true }]}
            label="Date / Дата (UTC) "
            name="inspectedDate"
          >
            <Input
              defaultValue={
                currentAdditionalTask.currentAction?.inspectedDate ||
                moment.utc().format("Do. MMM. YYYY")
              }
            />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Time / время (UTC) "
            name="inspectionTime"
          >
            <Input
              defaultValue={
                currentAdditionalTask.currentAction?.inspectedTime ||
                moment.utc().format("HH:mm")
              }
            />
          </Form.Item>

          <Form.Item>
            <Button
              className=""
              htmlType="submit"
              // onClick={resetValues}
              style={{ marginTop: 16 }}
            >
              Add Inspection / Добавить инспекцию
            </Button>
          </Form.Item>
        </div>
      </Form>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default InspectionForm;
