import ProForm, {
  FormInstance,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-form";
import { Form } from "antd";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import React, { FC, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getFilteredProjects } from "@/utils/api/thunks";
type ProjectFilterFormType = {
  onProjectSearch: (orders: any[] | []) => void;
};
const ProjectFilterForm: FC<ProjectFilterFormType> = ({ onProjectSearch }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const formRef = useRef<FormInstance>(null);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  return (
    <div>
      <ProForm
        className="bg-white px-4 py-3 rounded-md border-gray-400"
        size="small"
        layout="horizontal"
        labelCol={{ span: 12 }}
        formRef={formRef}
        form={form}
        onFinish={async (values) => {
          const currentCompanyID = localStorage.getItem("companyID") || "";
          const result = await dispatch(
            getFilteredProjects({
              companyID: currentCompanyID,
              planeNumber: values.planeNumber,
              status: values.projectState,
              projectType: values.projectType,
              projectWO: form.getFieldValue("projectNumber"),
            })
          );
          if (result.meta.requestStatus === "fulfilled") {
            onProjectSearch(result.payload || []);
          }
        }}
      >
        <ProFormText
          name="projectNumber"
          label={t("PROJECT No")}
          width="sm"
          fieldProps={{
            // onDoubleClick: () => setOpenPickViewer(true),
            onKeyPress: handleKeyPress,
            autoFocus: true,
          }}
        ></ProFormText>
        <ProFormSelect
          showSearch
          mode="multiple"
          name="projectType"
          label={t("PROJECT TYPE")}
          width="sm"
          tooltip={t("PROJECT TYPE")}
          valueEnum={{
            MAINTENANCE_AC_PROJECT: t("MAINTENANCE A/C "),
            REPAIR_AC_PROJECT: t("REPAIR A/C "),
            REPAIR_COMPONENT_PROJECT: t("REPAIR COMPONENT "),
            SERVICE_COMPONENT_PROJECT: t("COMPONENT SERVICE "),
            COMPONENT_REPAIR_PROJECT: t("COMPONENT REPAIR "),
            PRODUCTION_PROJECT: t("PRODUCTION "),
            PURCHASE_PROJECT: t("PURCHASE "),
            MINIMUM_SUPPLY_LIST: t("MINIMUM SUPPLY LIST"),
          }}
        />
        <ProFormText
          name="planeNumber"
          label="A/C REGISTRATION"
          width="sm"
          fieldProps={{
            // onDoubleClick: () => setOpenPickViewer(true),
            onKeyPress: handleKeyPress,
            autoFocus: true,
          }}
        />
        <ProFormText
          name="partNumber"
          label={t("PART No")}
          width="sm"
          tooltip={t("PART No")}
          fieldProps={{
            // onDoubleClick: () => setOpenPickViewer(true),
            onKeyPress: handleKeyPress,
          }}
        ></ProFormText>
        <ProFormText
          name="serialNumber"
          label={t("SERIAL No")}
          width="sm"
          tooltip={t("SERIAL No")}
          fieldProps={{
            // onDoubleClick: () => setOpenPickViewer(true),
            onKeyPress: handleKeyPress,
          }}
        ></ProFormText>
        <ProFormSelect
          showSearch
          mode="multiple"
          name="projectState"
          label={t("PROJECT STATE")}
          width="sm"
          initialValue={["DRAFT", "OPEN"]}
          valueEnum={{
            DRAFT: { text: t("DRAFT"), status: "DRAFT" },
            OPEN: { text: t("OPEN"), status: "Processing" },
            inProgress: { text: t("PROGRESS"), status: "PROGRESS" },
            PLANNED: { text: t("PLANNED"), status: "Waiting" },
            COMPLETED: { text: t("COMPLETED"), status: "Default" },
            CLOSED: { text: t("CLOSED"), status: "Success" },
            CANCELLED: { text: t("CANCELLED"), status: "Error" },
          }}
        />
      </ProForm>
    </div>
  );
};

export default ProjectFilterForm;
