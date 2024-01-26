import { Form, Button, Space, Spin, message } from "antd";
import TextArea from "antd/es/input/TextArea";

import {
  setUpdatedProjectAdditionalTask,
  setUpdatedProjectTask,
} from "@/store/reducers/MtbSlice";

import { useAppDispatch } from "@/hooks/useTypedSelector";
import React, { FC, useEffect, useState } from "react";

import { IActionType, IProjectTask } from "@/models/IProjectTaskMTB";
import { updateAdditionalTask, updateProjectTask } from "@/utils/api/thunks";
import UserSearchForm from "@/components/shared/form/UserSearchForm";
import { UserResponce } from "@/models/IUser";
import DateTimePickerForm from "@/components/shared/form/DateTimePickerForm";
import { IAdditionalTaskMTBCreate } from "@/models/IAdditionalTaskMTB";
import { USER_ID } from "@/utils/api/http";

export interface IEditActionFormProps {
  onFinish?: () => void;
  currentAdditionalTask: IAdditionalTaskMTBCreate | null;
  currentActiveIndex: any;
  currentAction: IActionType | null;
  isLoading: boolean;
  projectTasks: any[];
  disabled: boolean;
}
const WOPerfomedForm: FC<IEditActionFormProps> = ({
  currentAdditionalTask,
  currentActiveIndex,
  currentAction,
  isLoading,
  projectTasks,
  disabled,
}) => {
  const dispatch = useAppDispatch();
  const [selectedUser, setSelectedUser] = useState<UserResponce | null>();
  const [reset, setReset] = useState(false);
  const [form] = Form.useForm();

  const handleSelectChange = (action: IActionType) => {
    form.setFieldsValue({
      actionDescription: action.actionDescription,
    });
  };
  useEffect(() => {
    if (currentAction) {
      handleSelectChange(currentAction);
    }
  }, [dispatch, currentAction?.actionNumber, currentAdditionalTask?._id, []]);

  const [dateTime, setDateTime] = useState("");

  const handleDateTimeChange = (newDateTime: any) => {
    setDateTime(newDateTime);
  };

  return (
    <div className=" h-[48vh] overflow-y-auto mx-auto py-3">
      {isLoading && (
        <div className="flex justify-center mx-auto ">
          <Spin></Spin>
        </div>
      )}
      {!isLoading && (
        <>
          <Form
            disabled={disabled}
            form={form}
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            autoComplete="off"
            onFinish={async (values: IActionType) => {
              const updatedActions = [
                ...(currentAdditionalTask?.actions || []),
              ];

              updatedActions[currentActiveIndex] = {
                ...updatedActions[currentActiveIndex],
                performedSing: selectedUser
                  ? selectedUser?.singNumber
                  : currentAction?.performedSing,
                actionDescription: values.actionDescription,
                performedName: selectedUser?.name
                  ? selectedUser?.name
                  : currentAction?.performedName,
                performedDate: dateTime
                  ? dateTime
                  : currentAction?.performedDate,
                performedTime: values.performedTime,
                updateDate: new Date(),
                actionUpdateUserID: USER_ID,
              };

              const result = await dispatch(
                updateAdditionalTask({
                  actions: updatedActions,
                  projectId: currentAdditionalTask?.projectId._id,
                  _id: currentAdditionalTask?._id,
                })
              );
              if (result.meta.requestStatus === "fulfilled") {
                const companyID = localStorage.getItem("companyID");
                const index = projectTasks.findIndex(
                  (task) => task._id === currentAdditionalTask?._id
                );
                if (index !== -1) {
                  dispatch(
                    setUpdatedProjectAdditionalTask({
                      index: index,
                      task: result.payload,
                    })
                  );
                }
                message.success("Task successfully updated ");
                setSelectedUser(null);
              } else {
                message.error("Task not updated");
              }
            }}
          >
            <Form.Item
              rules={[{ required: true }]}
              label="Step description"
              name="actionDescription"
            >
              <TextArea className="h-[30vh]" />
            </Form.Item>

            <UserSearchForm
              performedName={
                currentAction?.performedName
                  ? currentAction?.performedName
                  : null
              }
              actionNumber={currentAction?.actionNumber || null}
              performedSing={
                currentAction?.performedSing
                  ? currentAction?.performedSing
                  : null
              }
              onUserSelect={(user) => {
                setSelectedUser(user);
              }}
              reset={reset}
            />

            <DateTimePickerForm
              setToNow={
                selectedUser && selectedUser.name
                  ? selectedUser.name?.length > 1
                  : false
              }
              form={form}
              dateTimeName="performedDate"
              dateTime={
                currentAction?.performedDate
                  ? currentAction?.performedDate
                  : null
              }
              onDateTimeChange={handleDateTimeChange}
            />

            <Form.Item wrapperCol={{ span: 12, offset: 10 }}>
              <Space>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
                <Button onClick={() => setReset(true)} htmlType="reset">
                  reset
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </>
      )}
    </div>
  );
};

export default WOPerfomedForm;
