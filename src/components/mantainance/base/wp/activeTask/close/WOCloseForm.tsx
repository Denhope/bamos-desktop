import { Form, Button, Space, Spin, message } from "antd";
import TextArea from "antd/es/input/TextArea";

import { setUpdatedProjectTask } from "@/store/reducers/MtbSlice";

import { useAppDispatch } from "@/hooks/useTypedSelector";
import React, { FC, useEffect, useState } from "react";

import {
  IActionType,
  IFinalAction,
  IProjectTask,
} from "@/models/IProjectTaskMTB";
import { updateProjectTask } from "@/utils/api/thunks";
import UserSearchForm from "@/components/shared/form/UserSearchForm";
import { UserResponce } from "@/models/IUser";
import DateTimePickerForm from "@/components/shared/form/DateTimePickerForm";
import { USER_ID } from "@/utils/api/http";

export interface IEditActionFormProps {
  onFinish: (record: any) => void;
  currentProjectTask: IProjectTask | null;
  finalAction: IFinalAction | null;
  isLoading: boolean;
  projectTasks: any[];
  disabled?: boolean;
}
const WOCloseForm: FC<IEditActionFormProps> = ({
  currentProjectTask,
  onFinish,
  finalAction,
  isLoading,
  projectTasks,
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
    <div className=" h-[48vh] overflow-y-automx-auto py-3">
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
                ...(currentProjectTask?.finalAction || null),
              };

              updatedAction = {
                ...updatedAction,
                closingSing: selectedUser
                  ? selectedUser?.singNumber
                  : finalAction?.closingSing,
                closingName: selectedUser
                  ? selectedUser?.name
                  : finalAction?.closingName,

                closingDate: dateTime ? dateTime : finalAction?.closingDate,
                updateDate: new Date(),
                actionUpdateUserID: USER_ID,
              };

              const result = await dispatch(
                updateProjectTask({
                  optional: {
                    finalAction: updatedAction,
                    isClose: true,
                  },
                  status: !currentProjectTask?.isDoubleInspectionRequired
                    ? "closed"
                    : "inProgress",
                  id: currentProjectTask?._id,
                })
              );
              if (result.meta.requestStatus === "fulfilled") {
                onFinish(result.payload);
                const companyID = localStorage.getItem("companyID");
                const index = projectTasks.findIndex(
                  (task) => task._id === currentProjectTask?._id
                );
                if (index !== -1) {
                  dispatch(
                    setUpdatedProjectTask({
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
                finalAction?.closingName ? finalAction?.closingName : null
              }
              performedSing={
                finalAction?.closingSing ? finalAction?.closingSing : null
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
              // setToNow={true}
              form={form}
              dateTimeName="closingDate"
              dateTime={
                finalAction?.closingDate ? finalAction?.closingDate : null
              }
              onDateTimeChange={handleDateTimeChange}
            />

            <Form.Item wrapperCol={{ span: 12, offset: 10 }}>
              <Space>
                <Button disabled={disabled} type="primary" htmlType="submit">
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

export default WOCloseForm;
