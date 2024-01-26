import { Button, Form, Input, Space, message } from "antd";
import { useTranslation } from "react-i18next";
import TextArea from "antd/es/input/TextArea";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import React, { FC } from "react";
import { createProjectGroup, getFilteredGroups } from "@/utils/api/thunks";
import { ProForm } from "@ant-design/pro-components";
import { USER_ID } from "@/utils/api/http";
export interface IProjectGroupAddFormPrors {
  projectID: string;
  companyID: string;
}
const GroupAddForm: FC<IProjectGroupAddFormPrors> = ({
  companyID,
  projectID,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  return (
    <div
      className="flex flex-col mx-auto"
      style={{
        width: "100%",
      }}
    >
      <ProForm
        onFinish={async () => {
          const result = await dispatch(
            createProjectGroup({
              groupDescription: form.getFieldValue("description"),
              groupName: form.getFieldValue("GroupName"),
              projectId: projectID,
              companyID: companyID,
              createDate: new Date(),
              status: "open",
              createUserID: USER_ID || "",
            })
          );
          if (result.meta.requestStatus === "fulfilled") {
            dispatch(
              getFilteredGroups({
                projectId: projectID,
                companyID: companyID,
              })
            );
            message.success("Group create");
          } else {
            message.error("Group  not create");
          }
        }}
        form={form}
        name="form"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
      >
        <Form.Item label={`${t("GROUP NAME")}`} name="GroupName">
          <Input placeholder="please enterGroup Name" />
        </Form.Item>
        <Form.Item label={`${t("Description")}`} name="description">
          <TextArea placeholder="please enter decsription" />
        </Form.Item>
      </ProForm>
    </div>
  );
};

export default GroupAddForm;
