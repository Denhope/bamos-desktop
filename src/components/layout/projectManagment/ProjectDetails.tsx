import { EditOutlined, SettingOutlined } from "@ant-design/icons";
import { ProFormDatePicker } from "@ant-design/pro-components";
import ProForm, {
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-form";
import { Button, Col, Divider, Form, Row, Space, message } from "antd";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import React, { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { USER_ID } from "@/utils/api/http";
import { createProject, updateProject } from "@/utils/api/thunks";

type ProjectDetailsFormType = {
  project: any;
  onEditProjectDetailsEdit: (data: any) => void;
};

const ProjectDetails: FC<ProjectDetailsFormType> = ({
  onEditProjectDetailsEdit,
  project,
}) => {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(true);
  const [isEditingView, setIsEditingView] = useState(false);
  const [isCreateView, setIsCreateView] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form] = Form.useForm();
  const [formAdd] = Form.useForm();
  const { t } = useTranslation();
  const [selectedProjectType, setSelectedProjectType] = useState(null);

  useEffect(() => {
    if (project && isEditingView) {
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  }, [project]);

  useEffect(() => {
    if (isEditingView) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [isEditingView]);
  useEffect(() => {
    if (project) {
      // onSelectSelectedStore && onSelectSelectedStore(selectedStore);
      form.setFields([
        { name: "projectNumber", value: project?.projectWO },
        { name: "projectType", value: project?.projectType },
        { name: "projectState", value: project?.status },
        { name: "acRegistrationNumber", value: project.acRegistrationNumber },
        { name: "manufactureNumber", value: project.manufactureNumber },
        { name: "acType", value: project.acType },
        { name: "acHours", value: project.acHours },
        { name: "acLDG", value: project.acLDG },
        { name: "WOType", value: project.WOType },
        { name: "projectName", value: project.projectName },
        { name: "classification", value: project.classification },
        { name: "department", value: project.department },
        { name: "description", value: project.description },
        { name: "customer", value: project.customer },
        { name: "startDate", value: project.startDate },
        { name: "planedStartDate", value: project.planedStartDate },
        { name: "planedFinishDate", value: project.planedFinishDate },
      ]);

      // onFilterTransferprojects(form.getFieldsValue());
    }
  }, [project]);

  return (
    <Row gutter={{ xs: 8, sm: 11, md: 24, lg: 32 }} className="gap-6">
      <Col
        xs={2}
        sm={3}
        className="h-[60vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 "
      >
        <Space direction="vertical">
          <Space
            className={`cursor-pointer transform transition px-3 ${
              isEditing || isCreating
                ? "opacity-50 cursor-not-allowed"
                : "hover:text-blue-500"
            }`}
            onClick={() => {
              if (!isEditing) {
                setIsEditingView(!isEditingView);
                form.resetFields();
                formAdd.resetFields();
                setIsCreating(true);
                setIsEditing(false);
                onEditProjectDetailsEdit(null);
              }
            }}
          >
            <SettingOutlined
              className={`${
                isEditing || !isCreating
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            />
            <div
              className={`${
                isEditing || !isCreating
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              {t("NEW PROJECT")}
            </div>
          </Space>
          <Space
            onClick={() => project && setIsEditingView(!isEditingView)}
            className={`cursor-pointer transform transition px-3 ${
              !project ? "opacity-50 cursor-not-allowed" : "hover:text-blue-500"
            }`}
          >
            <EditOutlined />
            <>{t("EDIT")}</>
          </Space>
        </Space>
      </Col>
      <Col
        xs={2}
        sm={20}
        className="h-[60vh]  bg-white px-4 py-3 rounded-md border-gray-400  "
      >
        <ProForm
          size="small"
          form={form}
          disabled={!isEditing && !isCreating}
          layout="horizontal"
          labelCol={{ span: 10 }}
          onFinish={async (values) => {
            if (isEditing && !isCreating) {
              const result = await dispatch(
                updateProject({
                  id: project._id || project.id,
                  companyID: localStorage.getItem("companyID"),
                  projectName: values.projectName,
                  planedStartDate: values.planedStartDate,
                  planedFinishDate: values.planedFinishDate,
                  updateByID: USER_ID,
                  updateUserSing: localStorage.getItem("singNumber"),
                  department: values.department,
                  classification: values.classification,
                  updateDate: new Date(),
                  startDate:
                    values.projectState === "inProgress" ||
                    values.projectState === "INPROGRESS"
                      ? values.startDate || new Date()
                      : values.startDate,
                  finishDate: values.finishDate,
                  description: values?.description,
                  customer: values?.customer,
                  acRegistrationNumber: values?.acRegistrationNumber,
                  manufactureNumber: values?.manufactureNumber,
                  acType: values?.acType,
                  acHours: values?.acHours,
                  acLDG: values?.acLDG,
                  projectType: values.projectType,
                  WOType: values.WOType,
                  status: values.projectState,
                  acModel: values.acModel,
                })
              );
              if (result.meta.requestStatus === "fulfilled") {
                onEditProjectDetailsEdit(result.payload);
                message.success(t("SUCCESS"));
                setIsEditing(false);
                setIsCreating(false);
              } else message.error(t("ERROR"));
            }
            if (isCreating) {
              const result = await dispatch(
                createProject({
                  companyID: localStorage.getItem("companyID"),
                  projectName: values.projectName,
                  planedStartDate: values.planedStartDate,
                  planedFinishDate: values.planedFinishDate,
                  ownerId: USER_ID,
                  createByID: USER_ID,
                  createBySing: localStorage.getItem("singNumber"),
                  department: values.department,
                  classification: values.classification,
                  createDate: new Date(),
                  startDate: null,
                  finishDate: null,
                  description: values?.description,
                  customer: values?.customer,
                  acRegistrationNumber: values?.acRegistrationNumber,
                  manufactureNumber: values?.manufactureNumber,
                  acType: values?.acType,
                  acHours: values?.acHours,
                  acLDG: values?.acLDG,
                  projectType: values.projectType,
                  WOType: values.WOType,
                  acModel: values.acModel,

                  optional: {
                    isTasksCreated: false,
                    isStarting: false,
                    isFavorite: false,
                    isDone: false,
                    isActive: false,
                  },
                  isEdited: false,

                  status: "DRAFT",
                })
              );
              if (result.meta.requestStatus === "fulfilled") {
                onEditProjectDetailsEdit(result.payload);
                message.success(t("SUCCESS"));
                setIsEditing(false);
                setIsCreating(false);
              }
            }
            const currentCompanyID = localStorage.getItem("companyID") || "";
          }}
          submitter={{
            render: (_, dom) =>
              isEditing || isCreating
                ? [
                    ...dom,
                    <Button
                      key="cancel"
                      onClick={() => {
                        isEditing && setIsEditingView(!isEditingView);
                        isCreating && setIsCreating(false);
                        setSelectedProjectType(
                          form.getFieldValue("projectState")
                        );
                      }}
                    >
                      {t("Cancel")}
                    </Button>,
                  ]
                : [],
            submitButtonProps: {
              children: "Search",
            },
          }}
        >
          <ProFormSelect
            rules={[{ required: true }]}
            showSearch
            disabled={!isCreating}
            name="projectType"
            label={t("PROJECT TYPE")}
            width="lg"
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
            onChange={(value: any) => setSelectedProjectType(value)}
          />
          <ProFormSelect
            showSearch
            disabled={isCreating || !isEditing}
            rules={[{ required: true }]}
            name="projectState"
            label={t("PROJECT STATE")}
            width="sm"
            initialValue={["DRAFT"]}
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
          {(project?.projectType === "PURCHASE_PROJECT" ||
            project?.projectType === "PURCHASE_PROJECT" ||
            selectedProjectType === "PURCHASE_PROJECT" ||
            selectedProjectType === "MINIMUM_SUPPLY_LIST") && (
            <ProFormText
              rules={[{ required: true }]}
              name="projectName"
              label={t("PROJECT SHOT NAME")}
              width="sm"
            ></ProFormText>
          )}

          <ProFormTextArea
            fieldProps={{ style: { resize: "none" } }}
            rules={[{ required: true }]}
            name="description"
            label={t("DESCRIPTION")}
            width="lg"
            tooltip={t("DESCRIPTION")}
          ></ProFormTextArea>

          <ProFormGroup>
            <ProFormDatePicker
              label={t("PLANNED START DATE")}
              name="planedStartDate"
              width="sm"
            ></ProFormDatePicker>
            <ProFormDatePicker
              disabled
              label={t("START DATE")}
              name="startDate"
              width="sm"
            ></ProFormDatePicker>
            <ProFormText
              fieldProps={{ style: { resize: "none" } }}
              // rules={[{ required: true }]}
              name="customer"
              label={t("CUSTOMER")}
              width="sm"
            ></ProFormText>
          </ProFormGroup>
          <ProFormGroup>
            <ProFormDatePicker
              label={t("PLANNED FINISH DATE")}
              name="planedFinishDate"
              width="sm"
            ></ProFormDatePicker>
            <ProFormDatePicker
              disabled
              label={t("FINISH DATE")}
              name="finishDate"
              width="sm"
            ></ProFormDatePicker>
          </ProFormGroup>

          {(selectedProjectType === "MAINTENANCE_AC_PROJECT" ||
            project?.projectType === "MAINTENANCE_AC_PROJECT") && (
            <>
              <ProFormGroup>
                <ProFormText
                  rules={[{ required: true }]}
                  name="acRegistrationNumber"
                  label={t("A/C REGISTR. No")}
                  width="sm"
                ></ProFormText>
                <ProFormText
                  rules={[{ required: true }]}
                  name="manufactureNumber"
                  label={t("A/C MSN No")}
                  width="sm"
                ></ProFormText>

                <ProFormSelect
                  showSearch
                  name="acType"
                  label={t("A/C TYPE")}
                  width="xs"
                  valueEnum={{
                    RRJ_95: { text: t("RRJ-95"), status: "RRJ-95" },
                    a320: { text: t("A 320"), status: "RRJ-95" },
                  }}
                />
                <ProFormSelect
                  showSearch
                  name="acModel"
                  label={t("A/C MODEL")}
                  width="xs"
                  valueEnum={{}}
                />
              </ProFormGroup>
              <ProFormGroup>
                <ProFormText
                  rules={[{ required: true }]}
                  name="acHours"
                  label={t("A/C TIMES (HOURS)")}
                  width="sm"
                ></ProFormText>
                <ProFormText
                  rules={[{ required: true }]}
                  name="acLDG"
                  label={t("A/C TIMES (LDG)")}
                  width="sm"
                ></ProFormText>
              </ProFormGroup>
              <Divider className="my-0 pb-2"></Divider>
              <ProFormGroup>
                <ProFormText
                  rules={[{ required: true }]}
                  name="WOType"
                  label={t("WORK PACKAGE TYPE")}
                  width="sm"
                ></ProFormText>
                <ProFormText
                  rules={[{ required: true }]}
                  name="projectName"
                  label={t("WORK PACKAGE NAME")}
                  width="sm"
                ></ProFormText>
                <ProFormSelect
                  showSearch
                  name="classification"
                  label={t("CLASSIFICATION")}
                  width="sm"
                  valueEnum={{
                    SCHEDULED: { text: t("SCHEDULED"), status: "Success" },
                    UNSCHEDULED: {
                      text: t("UNSCHEDULED"),
                      status: "Processing",
                    },
                  }}
                />
                <ProFormSelect
                  showSearch
                  name="department"
                  label={t("DEPARTMENT")}
                  width="sm"
                  valueEnum={{
                    MAINTENANCE: { text: t("MAINTENANCE") },
                    OPERATIONS: {
                      text: t("OPERATIONS"),
                    },
                  }}
                />
              </ProFormGroup>
            </>
          )}
        </ProForm>
      </Col>
    </Row>
  );
};

export default ProjectDetails;
