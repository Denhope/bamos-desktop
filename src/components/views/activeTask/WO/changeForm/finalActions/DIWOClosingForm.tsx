import { Button, Form, Input } from "antd";
import Title from "antd/es/typography/Title";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { IFinalActionType } from "@/models/IAdditionalTask";
import moment from "moment";
import React, { FC } from "react";
import toast, { Toaster } from "react-hot-toast";
import { setOptional } from "@/store/reducers/ProjectTaskSlise";

const DIWOClosingForm: FC = () => {
  const { currentProjectTask } = useTypedSelector((state) => state.projectTask);
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
            setOptional({
              WOCustomer: currentProjectTask.optional?.WOCustomer,
              MJSSNumber: currentProjectTask.optional?.MJSSNumber,
              WOPackageType: currentProjectTask.optional?.WOPackageType,
              taskNumber: currentProjectTask.optional?.taskNumber,
              position: currentProjectTask.optional?.position,
              taskDescription: currentProjectTask.optional?.taskDescription,
              isHaveNRC: currentProjectTask.optional?.isHaveNRC,
              workerId: currentProjectTask.optional?.workerId,
              isDone: currentProjectTask.optional?.isDone,
              isActive: currentProjectTask.optional?.isActive,
              sing: currentProjectTask.optional?.sing,
              name: currentProjectTask.optional?.name,
              isClose: true,
              finalAction: {
                DIClosingSing: values.DIClosingSing,
                DIClosingDate: values.DIClosingDate,
                dIClosingTime: values.DIClosingTime,
                DIClosingName: values.DIClosingName,
                closingSing:
                  currentProjectTask.optional?.finalAction?.closingSing,
                closingDate:
                  currentProjectTask.optional?.finalAction?.closingDate,
                closingTime:
                  currentProjectTask.optional?.finalAction?.closingTime,
                closingName:
                  currentProjectTask.optional?.finalAction?.closingName,
                timeUsed: currentProjectTask.optional?.finalAction?.timeUsed,
              },
            })
          );
          toast.success("Штамп успешно добавлен");
          form.resetFields();
        }}
        onFinishFailed={(error: any) => {
          console.log({ error });
        }}
      >
        <Title level={5}>Add Closing Sign / Добавить Штамп</Title>

        <div className="flex flex-col">
          <Form.Item
            rules={[{ required: true }]}
            label="DIClosing Sign / Табельный номер"
            name="DIClosingSing"
          >
            <Input
              defaultValue={
                currentProjectTask.optional?.finalAction?.DIClosingSing || ""
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
                currentProjectTask.optional?.finalAction?.DIClosingName || ""
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
                currentProjectTask.optional?.finalAction?.DIClosingDate ||
                currentProjectTask.optional?.finalAction?.closingDate
              }
            />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Time / время (UTC)"
            name="DIClosingTime"
          >
            <Input
              defaultValue={
                currentProjectTask.optional?.finalAction?.DIClosingTime ||
                currentProjectTask.optional?.finalAction?.closingTime
              }
            />
          </Form.Item>

          <Button
            className=""
            htmlType="submit"
            // onClick={resetValues}
            style={{ marginTop: 16 }}
          >
            Add Closing stamp / Добавить
          </Button>
        </div>

        <Toaster position="top-center" reverseOrder={false} />
      </Form>
    </div>
  );
};

export default DIWOClosingForm;
