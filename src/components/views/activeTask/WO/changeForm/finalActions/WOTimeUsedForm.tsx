import { Button, Form, Input } from "antd";
import Title from "antd/es/typography/Title";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { IFinalActionType } from "@/models/IAdditionalTask";
import moment from "moment";
import React, { FC } from "react";
import toast, { Toaster } from "react-hot-toast";
import { setOptional, setStatus } from "@/store/reducers/ProjectTaskSlise";

const WOTimeUsedForm: FC = () => {
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
                closingSing:
                  currentProjectTask.optional?.finalAction?.closingSing,
                closingDate:
                  currentProjectTask.optional?.finalAction?.closingDate,
                closingTime:
                  currentProjectTask.optional?.finalAction?.closingTime,
                closingName:
                  currentProjectTask.optional?.finalAction?.closingName,
                timeUsed: values.timeUsed,
                DIClosingSing:
                  currentProjectTask.optional?.finalAction?.DIClosingSing,
                DIClosingDate:
                  currentProjectTask.optional?.finalAction?.DIClosingDate,
                dIClosingTime:
                  currentProjectTask.optional?.finalAction?.DIClosingTime,
                DIClosingName:
                  currentProjectTask.optional?.finalAction?.DIClosingName,
              },
            })
          );
          toast.success("Информация о затраченном времени успешно добавлена");
        }}
        onFinishFailed={(error: any) => {
          console.log({ error });
        }}
      >
        <Title level={5}>Add Time Used / Добавить время</Title>

        <div className="flex flex-col">
          <Form.Item
            rules={[{ required: true }]}
            label=" Used time/ Затраченное время"
            name="timeUsed"
          >
            <Input
              disabled={
                !currentProjectTask.optional?.isDone ||
                !currentProjectTask.actions[
                  currentProjectTask.actions.length - 1
                ]?.performedName
              }
              defaultValue={
                currentProjectTask.optional?.finalAction?.timeUsed ||
                currentProjectTask.taskId?.allTaskTime
              }
            />
          </Form.Item>
          <Form.Item
            // rules={[{ required: true }]}
            label="Closing Sign / Табельный номер"
            name="closingSing"
          >
            <Input
              disabled
              defaultValue={
                currentProjectTask.optional?.finalAction?.closingName ||
                localStorage.getItem("singNumber") ||
                ""
              }
            />
          </Form.Item>

          <Form.Item>
            <Button
              disabled={
                !currentProjectTask.optional?.isDone ||
                !currentProjectTask.actions[
                  currentProjectTask.actions.length - 1
                ]?.performedName
              }
              className=""
              htmlType="submit"
              // onClick={resetValues}
              style={{ marginTop: 16 }}
            >
              Add time / Добавить
            </Button>
          </Form.Item>
        </div>

        <Toaster position="top-center" reverseOrder={false} />
      </Form>
    </div>
  );
};

export default WOTimeUsedForm;
