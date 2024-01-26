import { Form, Button, Space, Spin, message } from "antd";
import TextArea from "antd/es/input/TextArea";

import { setUpdatedProjectTask } from "@/store/reducers/MtbSlice";

import { useAppDispatch } from "@/hooks/useTypedSelector";
import React, { FC, useEffect, useState } from "react";

import { IActionType, IProjectTask } from "@/models/IProjectTaskMTB";
import { updateProjectTask } from "@/utils/api/thunks";
import UserSearchForm from "@/components/shared/form/UserSearchForm";
import { UserResponce } from "@/models/IUser";
import DateTimePickerForm from "@/components/shared/form/DateTimePickerForm";
import { USER_ID } from "@/utils/api/http";

export interface IEditActionFormProps {
  onFinish?: (record: any) => void;

  currentProjectTask: IProjectTask | null;
  currentActiveIndex: any;
  currentAction: IActionType | null;
  isLoading: boolean;
  projectTasks: any[];
  disabled: boolean;
}
const WOInspectionForm: FC<IEditActionFormProps> = ({
  currentProjectTask,
  currentActiveIndex,
  currentAction,
  isLoading,
  projectTasks,
  disabled,
  onFinish,
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
  }, [dispatch, currentAction?.actionNumber, currentProjectTask?._id, []]);

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
              const updatedActions = [...(currentProjectTask?.actions || [])];

              updatedActions[currentActiveIndex] = {
                ...updatedActions[currentActiveIndex],
                inspectedSing: selectedUser
                  ? selectedUser?.singNumber
                  : currentAction?.inspectedSing,

                inspectedName: selectedUser?.name
                  ? selectedUser?.name
                  : currentAction?.inspectedName,
                inspectedDate: dateTime
                  ? dateTime
                  : currentAction?.inspectedDate,
                updateDate: new Date(),
                actionUpdateUserID: USER_ID,
                // performedTime: values.performedTime,
              };

              const result = await dispatch(
                updateProjectTask({
                  actions: updatedActions,
                  id: currentProjectTask?._id,
                })
              );
              if (result.meta.requestStatus === "fulfilled") {
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
                if (onFinish) {
                  onFinish(result.payload);
                }
                setSelectedUser(null);
              } else {
                message.error("Task not updated");
              }
            }}
          >
            <UserSearchForm
              performedName={
                currentAction?.inspectedName
                  ? currentAction?.inspectedName
                  : null
              }
              actionNumber={currentAction?.actionNumber || null}
              performedSing={
                currentAction?.inspectedSing
                  ? currentAction?.inspectedSing
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
              dateTimeName="inspectedDate"
              dateTime={
                currentAction?.inspectedDate
                  ? currentAction?.inspectedDate
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

export default WOInspectionForm;
