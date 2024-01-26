import { Form, Select, Input, Button } from "antd";
import TextArea from "antd/es/input/TextArea";
import Title from "antd/es/typography/Title";
import { IActionType } from "@/store/reducers/AdditionalTaskSlice";
import { updateAction } from "@/store/reducers/ProjectTaskSlise";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import moment from "moment";

export interface IEditActionFormProps {
  onFinish?: () => void;
}
const WOActionDescriptionEditForm: FC<IEditActionFormProps> = () => {
  const [form] = Form.useForm();
  const { Option } = Select;
  const dispatch = useAppDispatch();
  const { currentProjectTask } = useTypedSelector((state) => state.projectTask);
  const handleSelectChange = (action: any) => {
    form.setFieldsValue({
      actionDescription: action.actionDescription,
      performedSing: action.performedSing || localStorage.getItem("singNumber"),
      performedName: action.performedName || localStorage.getItem("name"),
      performedDate:
        action.performedDate || moment.utc().format("Do. MMM. YYYY"),
      performedTime: action.performedTime || moment.utc().format("HH:mm"),
    });
  };
  useEffect(() => {
    handleSelectChange(currentProjectTask.currentAction || {});
  }, [currentProjectTask.currentAction?.actionNumber]);

  return (
    <div className="flex justify-center w-full">
      <Form
        form={form}
        className="w-full"
        autoComplete="off"
        onFinish={(values: IActionType) => {
          dispatch(
            updateAction({
              id: currentProjectTask.currentActiveIndex,
              payload: {
                actionDescription: values.actionDescription,
                performedSing: values.performedSing,
                performedDate: values.performedDate,
                performedTime: values.performedTime,
                performedName: values.performedName,
                inspectedDate: currentProjectTask.currentAction?.inspectedDate,
                inspectedTime: currentProjectTask.currentAction?.inspectedTime,
                inspectedSing: currentProjectTask.currentAction?.inspectedSing,
                inspectedName: currentProjectTask.currentAction?.inspectedName,
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
          toast.success("Описание успешно обнавлено");
          form.resetFields();
        }}
        onFinishFailed={(error: any) => {
          console.log({ error });
        }}
      >
        <Title level={5}>Edit Step Description/ Изменить действие</Title>
        <div className="flex flex-col">
          <Form.Item
            rules={[{ required: true }]}
            label="Action description / 
Описание действия"
            name="actionDescription"
          >
            <TextArea
              defaultValue={currentProjectTask.currentAction?.actionDescription}
            />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Performed Sign / 
Табельный номер исполнителя"
            name="performedSing"
          >
            <Input
              defaultValue={
                currentProjectTask.currentAction?.performedSing ||
                localStorage.getItem("singNumber") ||
                ""
              }
            />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Name / 
Имя Фамилия"
            name="performedName"
          >
            <Input
              defaultValue={
                currentProjectTask.currentAction?.performedName ||
                localStorage.getItem("name") ||
                ""
              }
            />
          </Form.Item>

          <Form.Item
            rules={[{ required: true }]}
            label="Date / Дата (UTC) "
            name="performedDate"
          >
            <Input
              defaultValue={
                currentProjectTask.currentAction?.performedDate ||
                moment.utc().format("Do. MMM. YYYY")
              }
            />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Time / время (UTC) "
            name="performedTime"
          >
            <Input
              defaultValue={
                currentProjectTask.currentAction?.performedTime ||
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
              Edit Action / Изменить
            </Button>
          </Form.Item>
        </div>

        <Toaster position="top-center" reverseOrder={false} />
      </Form>
    </div>
  );
};

export default WOActionDescriptionEditForm;
