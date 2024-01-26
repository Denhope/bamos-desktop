import { Button, Form, Input } from "antd";
import Title from "antd/es/typography/Title";
import { useTypedSelector, useAppDispatch } from "@/hooks/useTypedSelector";
import { IFinalActionType } from "@/models/IAdditionalTask";
import React, { FC } from "react";
import toast, { Toaster } from "react-hot-toast";
import { setOptinal } from "@/store/reducers/AdditionalTaskSlice";

const DIClosingSingForm: FC = () => {
  const { currentAdditionalTask } = useTypedSelector(
    (state) => state.additioonalTasks
  );
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  return (
    <div className="flex justify-center ">
      <Form
        form={form}
        className="w-full"
        autoComplete="off"
        onFinish={(values: IFinalActionType) => {
          dispatch(
            setOptinal({
              isDone: currentAdditionalTask.optional?.isDone,
              isActive: currentAdditionalTask.optional?.isActive,
              sing: currentAdditionalTask.optional?.sing,
              name: currentAdditionalTask.optional?.name,
              isClose: true,
              finalAction: {
                DIClosingSing: values.DIClosingSing,
                DIClosingDate: values.DIClosingDate,
                dIClosingTime: values.DIClosingTime,
                DIClosingName: values.DIClosingName,
                closingSing:
                  currentAdditionalTask.optional?.finalAction?.closingSing,
                closingDate:
                  currentAdditionalTask.optional?.finalAction?.closingDate,
                closingTime:
                  currentAdditionalTask.optional?.finalAction?.closingTime,
                closingName:
                  currentAdditionalTask.optional?.finalAction?.closingName,
              },
            })
          );
          toast.success("Штамп успешно добавлен");
          // form.resetFields();
        }}
        onFinishFailed={(error: any) => {
          console.log({ error });
        }}
      >
        <Title level={5}>Add DIClosing Sign / Добавить Штамп</Title>

        <div className="flex flex-col">
          <Form.Item
            rules={[{ required: true }]}
            label="DIClosing Sign / Табельный номер"
            name="DIClosingSing"
          >
            <Input
              defaultValue={
                currentAdditionalTask.optional?.finalAction?.DIClosingSing
              }
            />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Name / Имя Фамилия"
            name="DIClosingName"
          >
            <Input
              defaultValue={
                currentAdditionalTask.optional?.finalAction?.DIClosingName
              }
            />
          </Form.Item>

          <Form.Item
            rules={[{ required: true }]}
            label="Date / Дата (UTC) "
            name="DIClosingDate"
          >
            <Input
              defaultValue={
                currentAdditionalTask.optional?.finalAction?.DIClosingDate
              }
            />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Time / время (UTC) "
            name="DIClosingTime"
          >
            <Input
              defaultValue={
                currentAdditionalTask.optional?.finalAction?.DIClosingTime
              }
            />
          </Form.Item>

          <Button
            className=""
            htmlType="submit"
            // onClick={resetValues}
            style={{ marginTop: 16 }}
          >
            Add DIClosing stamp / Добавить
          </Button>
        </div>

        <Toaster position="top-center" reverseOrder={false} />
      </Form>
    </div>
  );
};
export default DIClosingSingForm;
