import React, { FC, useEffect, useState } from "react";
import {
  ProForm,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { ConfigProvider, Form } from "antd";

import UserSearchForm from "@/components/shared/form/UserSearchForm";
import { UserResponce } from "@/models/IUser";
import UserSearchProForm from "@/components/shared/form/UserSearchProForm";
import DateTimePickerForm from "@/components/shared/form/DateTimePickerForm";
import {
  updateRemovedItemByIds,
  getFilteredRemoverdItems,
} from "@/utils/api/thunks";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import { useTranslation } from "react-i18next";
import { USER_ID } from "@/utils/api/http";

type InstallItemFormProps = { currentItem: any };
const InstallItemForm: FC<InstallItemFormProps> = ({ currentItem }) => {
  const [selectedUser, setSelectedUser] = useState<UserResponce | null>();
  const [dateTime, setDateTime] = useState("");
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const handleDateTimeChange = (newDateTime: any) => {
    setDateTime(newDateTime);
  };
  const [form] = Form.useForm();
  useEffect(() => {
    console.log(currentItem);
    form.setFieldsValue({
      accessNbr: currentItem.removeItem.accessNbr,
      description: currentItem.removeItem.description,
      zone: currentItem.removeItem.zone,
      subZone: currentItem.removeItem.subZone,
      position: currentItem.removeItem.position,
      status: currentItem.status,
    });
  }, [currentItem]);

  const [reset, setReset] = useState(false); //

  const handleReset = () => {
    setSelectedUser(null); // сбросить выбранного пользователя
    setReset(true); // установить reset в true при сбросе
  };
  const companyID = localStorage.getItem("companyID");
  return (
    <div>
      <ProForm
        form={form}
        // labelCol={{ span: 8 }}
        // wrapperCol={{ span: 16 }}
        // style={{ maxWidth: 600 }}
        onReset={handleReset}
        onFinish={async (values) => {
          const result = await dispatch(
            updateRemovedItemByIds({
              ids: [currentItem?._id],
              installDate: dateTime,
              companyID: companyID || "",
              installManId: selectedUser?._id || "",
              updateDate: new Date(),
              status: form.getFieldValue("status"),
              updateUserID: USER_ID || "",
              installItem: {
                ...currentItem.installItem,
                description: form.getFieldValue("description"),
                serialNbr: form.getFieldValue("serialNbr"),
                panel: form.getFieldValue("panel"),
                zone: form.getFieldValue("zone"),
                subZone: form.getFieldValue("subZone"),
                position: form.getFieldValue("position"),
              },
            })
          );
          if (result.meta.requestStatus === "fulfilled") {
            const result = await dispatch(
              getFilteredRemoverdItems({
                companyID: companyID || "",
                projectId: currentItem.projectID,
              })
            );
            setSelectedUser(null); // сбросить выбранного пользователя
            setReset(true); // установить reset в true при сбросе
          }
        }}
      >
        <ProForm.Group>
          <ProFormText
            width={"sm"}
            disabled
            // hasFeedback

            // rules={[
            //   {
            //     pattern: /^2\d*$/,
            //     message: 'Please enter a number starting with 2',
            //   },
            // ]}
            label="Access/P/N Number"
            name="accessNbr"
          />
          <ProFormText
            width={"lg"}
            // hasFeedback

            label={`${t("Description")}`}
            name="description"
          />
          <ProFormText width={"sm"} label={`${t("ZONE")}`} name="zone" />
          <ProFormText width={"sm"} label={`${t("SUB ZONE")}`} name="subZone" />
          <ProFormText width={"sm"} label="Position" name="position" />
          <ProFormText
            width={"sm"}
            // hasFeedback

            label={`${t("Serial Number")}`}
            name="serialNbr"
          />
          <ProFormSelect
            name="status"
            label="Status"
            width="sm"
            tooltip="Item status"
            valueEnum={{
              closed: "CLOSED",
              open: "OPEN",
            }}
            placeholder="Please select status"
            rules={[
              {
                required: true,
                message: "Please select  STATUS!",
                type: "string",
              },
            ]}
          />
        </ProForm.Group>

        <UserSearchProForm
          performedName={currentItem.installMan ? currentItem.installMan : null}
          performedSing={currentItem.instalSing ? currentItem.instalSing : null}
          onUserSelect={(user) => {
            setSelectedUser(user);
            setReset(false);
          }}
          actionNumber={null}
          reset={reset}
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
          dateTime={currentItem.installDate ? currentItem.instalDate : null}
          onDateTimeChange={handleDateTimeChange}
        />
      </ProForm>
    </div>
  );
};

export default InstallItemForm;
