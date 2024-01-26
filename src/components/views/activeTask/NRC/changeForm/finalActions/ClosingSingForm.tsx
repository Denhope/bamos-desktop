import { Button, Form, Input } from "antd";

import Title from "antd/es/typography/Title";

import { useTypedSelector, useAppDispatch } from "@/hooks/useTypedSelector";
import { IFinalActionType } from "@/models/IAdditionalTask";
import moment from "moment";

import React, { FC } from "react";
import toast, { Toaster } from "react-hot-toast";
import { setOptinal, setStatus } from "@/store/reducers/AdditionalTaskSlice";

const ClosingSingForm: FC = () => {
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
          dispatch(setStatus("закрыт"));

          dispatch(
            setOptinal({
              NRCInfo: currentAdditionalTask.optional?.NRCInfo,
              isDone: currentAdditionalTask.optional?.isDone,
              isActive: currentAdditionalTask.optional?.isActive,
              sing: currentAdditionalTask.optional?.sing,
              name: currentAdditionalTask.optional?.name,
              isClose: true,
              finalAction: {
                closingSing: values.closingSing,
                closingDate: values.closingDate,
                closingTime: values.closingTime,
                closingName: values.closingName,
                timeUsed: currentAdditionalTask.optional?.finalAction?.timeUsed,
                DIClosingSing:
                  currentAdditionalTask.optional?.finalAction?.DIClosingSing,
                DIClosingDate:
                  currentAdditionalTask.optional?.finalAction?.DIClosingDate,
                dIClosingTime:
                  currentAdditionalTask.optional?.finalAction?.DIClosingTime,
                DIClosingName:
                  currentAdditionalTask.optional?.finalAction?.DIClosingName,
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
            label="Closing Sign / Табельный номер"
            name="closingSing"
          >
            <Input
              defaultValue={
                currentAdditionalTask.optional?.finalAction?.closingSing ||
                localStorage.getItem("singNumber") ||
                ""
              }
            />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Name / Имя Фамилия"
            name="closingName"
          >
            <Input
              defaultValue={
                currentAdditionalTask.optional?.finalAction?.closingName ||
                localStorage.getItem("name") ||
                ""
              }
            />
          </Form.Item>

          <Form.Item
            rules={[{ required: true }]}
            label="Date / Дата (UTC) "
            name="closingDate"
          >
            <Input
              defaultValue={
                currentAdditionalTask.optional?.finalAction?.closingDate ||
                moment.utc().format("Do. MMM. YYYY")
              }
            />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Time / время (UTC) "
            name="closingTime"
          >
            <Input
              defaultValue={
                currentAdditionalTask.optional?.finalAction?.closingTime ||
                moment.utc().format("HH:mm")
              }
            />
          </Form.Item>
          <Form.Item>
            {" "}
            <Button
              disabled={!currentAdditionalTask.optional?.finalAction?.timeUsed}
              className=""
              htmlType="submit"
              // onClick={() => {
              //   toast.success('Штамп успешно добавлен');
              // }}
              style={{ marginTop: 16 }}
            >
              Add Closing stamp / Добавить
            </Button>
          </Form.Item>
        </div>
      </Form>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};
export default ClosingSingForm;
