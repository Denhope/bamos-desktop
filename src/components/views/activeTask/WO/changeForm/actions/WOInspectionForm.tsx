import { Button, Form, Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import Title from "antd/es/typography/Title";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import moment from "moment";
import React, { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { IActionType } from "@/store/reducers/AdditionalTaskSlice";
import { updateAction } from "@/store/reducers/ProjectTaskSlise";

const WOInspectionForm = () => {
  const { currentProjectTask } = useTypedSelector((state) => state.projectTask);
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
                performedDate: currentProjectTask?.currentAction?.performedDate,
                performedTime: currentProjectTask?.currentAction?.performedTime,
                performedName: currentProjectTask?.currentAction?.performedName,
                inspectedDate: values.inspectedDate,
                inspectedTime: values.inspectedTime,
                inspectedSing: values.inspectedSing,
                inspectedName: values.inspectedName,
                doubleInspectionSing:
                  currentProjectTask?.currentAction?.doubleInspectionSing,
                doubleInspectedDate:
                  currentProjectTask?.currentAction?.doubleInspectedDate,
                doubleInspectedTime:
                  currentProjectTask?.currentAction?.doubleInspectedTime,
                doubleInspectedName:
                  currentProjectTask?.currentAction?.doubleInspectedName,
                actionNumber: currentProjectTask.currentAction?.actionNumber,
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
              disabled={!currentProjectTask.currentAction?.performedName}
              // defaultValue={
              //   currentProjectTask.currentAction?.performedName &&
              //   (currentProjectTask.currentAction?.inspectedSing ||
              //     localStorage.getItem('singNumber') ||
              //     '')
              // }
            />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Name / 
Имя Фамилия"
            name="inspectedName"
          >
            <Input
              disabled={!currentProjectTask.currentAction?.performedName}
              // defaultValue={
              //   currentProjectTask.currentAction?.performedName &&
              //   (currentProjectTask.currentAction?.inspectedName ||
              //     localStorage.getItem('name') ||
              //     '')
              // }
            />
          </Form.Item>

          <Form.Item
            rules={[{ required: true }]}
            label="Date / Дата (UTC) "
            name="inspectedDate"
          >
            <Input
              disabled={!currentProjectTask.currentAction?.performedName}
              // defaultValue={
              //   currentProjectTask.currentAction?.performedName &&
              //   (currentProjectTask.currentAction?.inspectedDate ||
              //     currentProjectTask.currentAction?.performedDate)
              // }
            />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Time / время (UTC) "
            name="inspectedTime"
          >
            <Input
              disabled={!currentProjectTask.currentAction?.performedName}
              defaultValue={
                currentProjectTask.currentAction?.performedName &&
                (currentProjectTask.currentAction?.inspectedTime ||
                  currentProjectTask.currentAction?.performedTime)
              }
            />
          </Form.Item>
          <Form.Item>
            <Button
              disabled={!currentProjectTask.currentAction?.performedName}
              className=""
              htmlType="submit"
              // onClick={resetValues}
              style={{ marginTop: 16 }}
            >
              Add Inspection / Добавить инспекцию
            </Button>
          </Form.Item>
        </div>

        <Toaster position="top-center" reverseOrder={false} />
      </Form>
    </div>
  );
};

export default WOInspectionForm;
