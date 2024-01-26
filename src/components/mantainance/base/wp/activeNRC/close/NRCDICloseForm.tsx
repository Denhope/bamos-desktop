import { Form, Button, Space, Spin, message } from "antd";
import TextArea from "antd/es/input/TextArea";

import {
  setUpdatedProjectAdditionalTask,
  setUpdatedProjectTask,
} from "@/store/reducers/MtbSlice";

import { useAppDispatch } from "@/hooks/useTypedSelector";
import React, { FC, useEffect, useState } from "react";

import {
  IActionType,
  IFinalAction,
  IProjectTask,
} from "@/models/IProjectTaskMTB";
import { updateProjectTask, updateAdditionalTask } from "@/utils/api/thunks";
import UserSearchForm from "@/components/shared/form/UserSearchForm";
import { UserResponce } from "@/models/IUser";
import DateTimePickerForm from "@/components/shared/form/DateTimePickerForm";
import { IAdditionalTaskMTBCreate } from "@/models/IAdditionalTaskMTB";
import { USER_ID } from "@/utils/api/http";

export interface IEditActionFormProps {
  onFinish?: () => void;
  currentAdditionalTask: IAdditionalTaskMTBCreate | null;
  finalAction: IFinalAction | null;
  isLoading: boolean;
  projectAdditionalTasks: any[];
  disabled?: boolean;
}
const WODICloseForm: FC<IEditActionFormProps> = ({
  currentAdditionalTask,
  finalAction,
  isLoading,
  projectAdditionalTasks,
  disabled,
}) => {
  const dispatch = useAppDispatch();
  const [selectedUser, setSelectedUser] = useState<UserResponce | null>();
  const [reset, setReset] = useState(false);
  const [form] = Form.useForm();

  const [dateTime, setDateTime] = useState("");

  const handleDateTimeChange = (newDateTime: any) => {
    setDateTime(newDateTime);
  };

  return (
    <div className="h-[52vh] overflow-y-auto mx-auto py-3">
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
            onFinish={async (values: IFinalAction) => {
              let updatedAction = {
                ...(currentAdditionalTask?.optional?.finalAction || null),
              };

              updatedAction = {
                ...updatedAction,
                DIClosingSing: selectedUser
                  ? selectedUser?.singNumber
                  : finalAction?.DIClosingSing,
                DIClosingName: selectedUser
                  ? selectedUser?.name
                  : finalAction?.DIClosingName,

                DIClosingDate: dateTime ? dateTime : finalAction?.DIClosingDate,
                updateDate: new Date(),
                actionUpdateUserID: USER_ID,
              };

              const result = await dispatch(
                updateAdditionalTask({
                  optional: { finalAction: updatedAction, isClose: true },
                  _id: currentAdditionalTask?._id,
                  projectId: currentAdditionalTask?.projectId,
                  status: "closed",
                })
              );
              if (result.meta.requestStatus === "fulfilled") {
                const companyID = localStorage.getItem("companyID");
                const index = projectAdditionalTasks.findIndex(
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
            <UserSearchForm
              performedName={
                finalAction?.DIClosingName ? finalAction?.DIClosingName : null
              }
              performedSing={
                finalAction?.DIClosingSing ? finalAction?.DIClosingSing : null
              }
              onUserSelect={(user) => {
                setSelectedUser(user);
              }}
              reset={reset}
              actionNumber={null}
            />

            <DateTimePickerForm
              setToNow={
                selectedUser && selectedUser.name
                  ? selectedUser.name?.length > 1
                  : false
              }
              form={form}
              dateTimeName="DIClosingDate"
              dateTime={
                finalAction?.DIClosingDate ? finalAction?.DIClosingDate : null
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

export default WODICloseForm;
