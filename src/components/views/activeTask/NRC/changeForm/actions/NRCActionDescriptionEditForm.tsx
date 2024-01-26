import { Form, Select, Input, Button } from "antd";
import TextArea from "antd/es/input/TextArea";
import Title from "antd/es/typography/Title";
import { IActionType, updateAction } from "@/store/reducers/AdditionalTaskSlice";

import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { IAdditionalTask } from "@/models/IAdditionalTask";
import moment from "moment";

export interface IEditActionFormProps {
  onFinish?: () => void;
}
const NRCActionDescriptionEditForm: FC<IEditActionFormProps> = () => {
  const [form] = Form.useForm();
  const { Option } = Select;
  const dispatch = useAppDispatch();
  const { currentAdditionalTask } = useTypedSelector(
    (state) => state.additioonalTasks
  );
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
    handleSelectChange(currentAdditionalTask.currentAction || {});
  }, [currentAdditionalTask.currentAction?.actionNumber]);

  return (
    <div className="flex justify-center w-full">
      <Form
        form={form}
        className="w-full"
        autoComplete="off"
        onFinish={(values: IActionType) => {
          dispatch(
            updateAction({
              id: currentAdditionalTask.currentActiveIndex,
              payload: {
                actionDescription: values.actionDescription,
                performedSing: values.performedSing,
                performedDate: values.performedDate,
                performedTime: values.performedTime,
                performedName: values.performedName,
                inspectedDate:
                  currentAdditionalTask.currentAction?.inspectedDate,
                inspectedTime:
                  currentAdditionalTask.currentAction?.inspectedTime,
                inspectedSing:
                  currentAdditionalTask.currentAction?.inspectedSing,
                inspectedName:
                  currentAdditionalTask.currentAction?.inspectedName,
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
          toast.success("Информация добавлена");
          form.resetFields();
        }}
        onFinishFailed={(error: any) => {
          console.log({ error });
        }}
      >
        <Title level={5}>
          Edit Step Description/ Изменить описание действия
        </Title>
        <div className="flex flex-col">
          <Form.Item
            rules={[{ required: true }]}
            label="Action description / 
Описание действия"
            name="actionDescription"
          >
            <TextArea
              defaultValue={
                currentAdditionalTask.currentAction?.actionDescription
              }
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
                currentAdditionalTask.currentAction?.performedSing ||
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
                currentAdditionalTask.currentAction?.performedName ||
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
                currentAdditionalTask.currentAction?.performedDate ||
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
                currentAdditionalTask.currentAction?.performedTime ||
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

export default NRCActionDescriptionEditForm;
