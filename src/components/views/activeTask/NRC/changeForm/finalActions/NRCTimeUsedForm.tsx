import { Button, Form, Input } from "antd";
import Title from "antd/es/typography/Title";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { IFinalActionType } from "@/models/IAdditionalTask";
import moment from "moment";
import React, { FC } from "react";
import toast, { Toaster } from "react-hot-toast";
import { setOptinal } from "@/store/reducers/AdditionalTaskSlice";

const NRCTimeUsedForm: FC = () => {
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
              ...currentAdditionalTask.optional,
              finalAction: {
                ...currentAdditionalTask.optional?.finalAction,
                timeUsed: values.timeUsed,
              },
            })
            // setOptinal({
            //   // WOCustomer: currentAdditionalTask.optional?.WOCustomer,
            //   // MJSSNumber: currentAdditionalTask.optional?.MJSSNumber,
            //   // WOPackageType: currentAdditionalTask.optional?.WOPackageType,
            //   // taskNumber: currentAdditionalTask.optional?.taskNumber,
            //   // position: currentAdditionalTask.optional?.position,
            //   // taskDescription: currentAdditionalTask.optional?.taskDescription,
            //   // isHaveNRC: currentAdditionalTask.optional?.isHaveNRC,
            //   workerId: currentAdditionalTask.optional?.workerId,
            //   isDone: currentAdditionalTask.optional?.isDone,
            //   isActive: currentAdditionalTask.optional?.isActive,
            //   sing: currentAdditionalTask.optional?.sing,
            //   name: currentAdditionalTask.optional?.name,
            //   isClose: true,
            //   finalAction: {
            //     closingSing:
            //       currentAdditionalTask.optional?.finalAction?.closingSing,
            //     closingDate:
            //       currentAdditionalTask.optional?.finalAction?.closingDate,
            //     closingTime:
            //       currentAdditionalTask.optional?.finalAction?.closingTime,
            //     closingName:
            //       currentAdditionalTask.optional?.finalAction?.closingName,
            //     timeUsed: values.timeUsed,
            //     DIClosingSing:
            //       currentAdditionalTask.optional?.finalAction?.DIClosingSing,
            //     DIClosingDate:
            //       currentAdditionalTask.optional?.finalAction?.DIClosingDate,
            //     dIClosingTime:
            //       currentAdditionalTask.optional?.finalAction?.DIClosingTime,
            //     DIClosingName:
            //       currentAdditionalTask.optional?.finalAction?.DIClosingName,
            //   },
            // })
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
              defaultValue={
                currentAdditionalTask.optional?.finalAction?.timeUsed || ""
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
                currentAdditionalTask.optional?.finalAction?.closingName ||
                localStorage.getItem("singNumber") ||
                ""
              }
            />
          </Form.Item>

          <Form.Item>
            <Button
              disabled={!currentAdditionalTask.optional?.isDone}
              className=""
              htmlType="submit"
              // onClick={resetValues}
              style={{ marginTop: 16 }}
            >
              Add time / Добавить
            </Button>
          </Form.Item>
        </div>
      </Form>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default NRCTimeUsedForm;
