import { Form, Select, Input, Button, Space } from "antd";
import TextArea from "antd/es/input/TextArea";
import Title from "antd/es/typography/Title";

import { addAction, updateAction } from "@/store/reducers/MtbSlice";

import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import moment from "moment";
import { IActionType } from "@/models/IProjectTaskMTB";

export interface IWOStepAddFormFormProps {
  onFinish?: () => void;
}
const WOStepAddForm: FC<IWOStepAddFormFormProps> = () => {
  const [form] = Form.useForm();
  const { Option } = Select;
  const dispatch = useAppDispatch();
  const { currentProjectTask, currentActiveIndex, currentAction } =
    useTypedSelector((state) => state.mtbase);
  const handleSelectChange = (action: IActionType) => {
    form.setFieldsValue({
      actionDescription: action.actionDescription,
      performedSing: action.performedSing || localStorage.getItem("singNumber"),
      performedName: action.performedName || localStorage.getItem("name"),
      performedDate:
        action.performedDate || moment.utc().format("Do. MMM. YYYY"),
      performedTime: action.performedTime || moment.utc().format("HH:mm"),
    });
  };
  // useEffect(() => {
  //   if (currentAction) {
  //     handleSelectChange(currentAction);
  //   }
  // }, [currentAction?.actionNumber, currentAction, currentProjectTask?._id, []]);

  return (
    <div className=" h-[37vh]  mx-auto py-3">
      <Form
        form={form}
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        autoComplete="off"
        onFinish={(values: IActionType) => {
          if (currentActiveIndex !== null) {
            dispatch(
              addAction({
                actionDescription: values.actionDescription,
                actionNumber: currentProjectTask?.actions?.length
                  ? currentProjectTask.actions.length + 1
                  : 1,
              })
            );
          }

          toast.success("Step ADD");
          form.resetFields();
        }}
        onFinishFailed={(error: any) => {
          console.log({ error });
        }}
      >
        <Form.Item
          rules={[{ required: true }]}
          label="Step description"
          name="actionDescription"
        >
          <TextArea
            size="small"
            defaultValue={currentAction?.actionDescription}
          />
        </Form.Item>

        <Form.Item wrapperCol={{ span: 12, offset: 10 }}>
          <Space>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button htmlType="reset">reset</Button>
          </Space>
        </Form.Item>

        <Toaster position="top-center" reverseOrder={false} />
      </Form>
    </div>
  );
};

export default WOStepAddForm;
