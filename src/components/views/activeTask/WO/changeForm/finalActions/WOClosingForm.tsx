import { Button, Form, Input } from 'antd';
import Title from 'antd/es/typography/Title';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import { IFinalActionType } from '@/models/IAdditionalTask';
import moment from 'moment';
import React, { FC } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { setOptional, setStatus } from '@/store/reducers/ProjectTaskSlise';

const WOClosingForm: FC = () => {
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
          dispatch(setStatus('закрыт'));
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
                closingSing: values.closingSing,
                closingDate: values.closingDate,
                closingTime: values.closingTime,
                closingName: values.closingName,
                timeUsed: currentProjectTask.optional?.finalAction?.timeUsed,
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
          toast.success('Штамп успешно добавлен');
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
              disabled={
                !currentProjectTask.optional?.finalAction?.timeUsed ||
                !currentProjectTask.actions[
                  currentProjectTask.actions.length - 1
                ].inspectedName
              }
              // defaultValue={
              //   // currentProjectTask.optional?.finalAction?.timeUsed &&
              //   currentProjectTask.optional?.finalAction?.closingSing ||
              //   currentProjectTask.actions[
              //     currentProjectTask.actions.length - 1
              //   ].inspectedSing
              // }
            />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Name / Имя Фамилия"
            name="closingName"
          >
            <Input
              disabled={
                !currentProjectTask.optional?.finalAction?.timeUsed ||
                !currentProjectTask.actions[
                  currentProjectTask.actions.length - 1
                ].inspectedName
              }
              defaultValue={
                // currentProjectTask.optional?.finalAction?.timeUsed &&
                currentProjectTask.optional?.finalAction?.closingName ||
                currentProjectTask.actions[
                  currentProjectTask.actions.length - 1
                ].inspectedName
                // FULL_NAME ||
                // ''
              }
            />
          </Form.Item>

          <Form.Item
            rules={[{ required: true }]}
            label="Date / Дата (UTC) "
            name="closingDate"
          >
            <Input
              disabled={
                !currentProjectTask.optional?.finalAction?.timeUsed ||
                !currentProjectTask.actions[
                  currentProjectTask.actions.length - 1
                ].inspectedName
              }
              // defaultValue={
              //   // currentProjectTask.optional?.finalAction?.timeUsed &&
              //   currentProjectTask.optional?.finalAction?.closingDate ||
              //   // moment.utc().format('Do. MMM. YYYY')
              //   currentProjectTask.actions[
              //     currentProjectTask.actions.length - 1
              //   ].inspectedDate
              // }
            />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Time / время (UTC) "
            name="closingTime"
          >
            <Input
              disabled={
                !currentProjectTask.optional?.finalAction?.timeUsed ||
                !currentProjectTask.actions[
                  currentProjectTask.actions.length - 1
                ].inspectedName
              }
              defaultValue={
                // currentProjectTask.optional?.finalAction?.timeUsed &&
                currentProjectTask.optional?.finalAction?.closingTime ||
                currentProjectTask.actions[
                  currentProjectTask.actions.length - 1
                ].inspectedTime
                // moment.utc().format('HH:mm')
              }
            />
          </Form.Item>

          <Form.Item>
            <Button
              disabled={
                !currentProjectTask.optional?.finalAction?.timeUsed ||
                !currentProjectTask.actions[
                  currentProjectTask.actions.length - 1
                ].inspectedName
              }
              className=""
              htmlType="submit"
              // onClick={resetValues}
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

export default WOClosingForm;
