import { Pie } from "@ant-design/charts";

import {
  ProDescriptions,
  ProForm,
  ProFormCheckbox,
  ProFormRadio,
} from "@ant-design/pro-components";
import { Button, ConfigProvider } from "antd";

import dayjs from "dayjs";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import React from "react";
import { USER_ID } from "@/utils/api/http";
import {
  getFilteredAditionalTasks,
  getFilteredProjectTasks,
  updateProject,
} from "@/utils/api/thunks";

export default () => {
  const { projectTasks, isLoading, currentProject, projectAdditionalTasks } =
    useTypedSelector((state) => state.mtbase);

  const completedTasks = projectTasks.filter(
    (task) => task.status === "closed"
  ).length;
  const openProjectTasks = projectTasks.filter(
    (task) => task.status === "open"
  ).length;
  const openAdditionalTasks = projectAdditionalTasks.filter(
    (task) => task.status === "open"
  ).length;
  const completedAdditionalTasks = projectAdditionalTasks.filter(
    (task) => task.status === "closed"
  ).length;

  const progressAdditionalTasks = projectAdditionalTasks.filter(
    (task) => task.status === "inProgress"
  ).length;

  const progressRoutineTasks = projectTasks.filter(
    (task) => task.status === "inProgress"
  ).length;

  const totalTasks = projectTasks.length;
  const totalAdditionalTasks = projectAdditionalTasks.length;

  const progress =
    ((completedTasks + completedAdditionalTasks) /
      (totalTasks + totalAdditionalTasks)) *
    100;
  const progressNrc =
    (completedAdditionalTasks / totalAdditionalTasks) * 100 || 0;

  const pieData = [
    {
      type: "In Progress",
      value: progressRoutineTasks + progressAdditionalTasks,
    },
    {
      type: "Completed Tasks",
      value: completedTasks + completedAdditionalTasks,
    },
    { type: "Open Tasks", value: openProjectTasks + openAdditionalTasks },
  ];

  const pieDataRoutine = [
    { type: "In Progress", value: progressRoutineTasks },
    { type: "Completed Routine", value: completedTasks },
    { type: "Open Routine", value: openProjectTasks },
  ];

  const pieDataAdditional = [
    { type: "In Progress", value: progressAdditionalTasks },
    { type: "Completed NRC", value: completedAdditionalTasks },
    { type: "Open NRC", value: openAdditionalTasks },
  ];

  const config = {
    appendPadding: 10,
    data: pieData,
    angleField: "value",
    colorField: "type",

    label: {
      type: "inner",
      offset: "-30%",
      content: (data: any) =>
        `${((data.value / (totalTasks + totalAdditionalTasks)) * 100).toFixed(
          1
        )}%`,
      style: {
        fontSize: 14,
        textAlign: "center",
      },
    },
    interactions: [{ type: "element-active" }],
  };
  const configADditional = {
    appendPadding: 10,
    data: pieDataAdditional,
    angleField: "value",
    colorField: "type",

    label: {
      type: "inner",
      offset: "-30%",
      // radius: 0.8,
      content: (data: any) =>
        `${((data.value / totalAdditionalTasks) * 100).toFixed(1)}%`,
      style: {
        fontSize: 14,
        textAlign: "center",
      },
    },
    interactions: [{ type: "element-active" }],
  };
  const configRoutine = {
    appendPadding: 10,
    data: pieDataRoutine,
    angleField: "value",
    colorField: "type",

    label: {
      type: "inner",
      offset: "-30%",
      content: (data: any) =>
        `${((data.value / totalTasks) * 100).toFixed(1)}%`,
      style: {
        fontSize: 14,
        textAlign: "center",
      },
    },
    interactions: [{ type: "element-active" }],
  };
  const dispatch = useAppDispatch();
  const [form] = ProForm.useForm();

  React.useEffect(() => {
    form.setFieldsValue({
      acDcStatus:
        currentProject?.planeStatus &&
        currentProject?.planeStatus.find(
          (status) => status === "AC/DC ON" || status === "AC/DC OFF"
        ),
      hydStatus:
        currentProject?.planeStatus &&
        currentProject?.planeStatus.find(
          (status) => status === "HYD ON" || status === "HYD OFF"
        ),
      otherStatus:
        currentProject?.planeStatus &&
        currentProject?.planeStatus.filter(
          (status) =>
            !["AC/DC ON", "AC/DC OFF", "HYD ON", "HYD OFF"].includes(status)
        ),
    });
  }, [currentProject]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <ProDescriptions
          column={1}
          title={currentProject?.projectName}
          tooltip={currentProject?.planeNumber}
        >
          <ProDescriptions.Item
            label="Labor Cost"
            tooltip={currentProject?.projectName}
            valueType="digit"
          >
            100
          </ProDescriptions.Item>

          <ProDescriptions.Item label="Date In" valueType="dateTime">
            {currentProject?.startDate}
          </ProDescriptions.Item>

          <ProDescriptions.Item label="Date Out" valueType="date">
            {currentProject?.finishDate}
          </ProDescriptions.Item>

          <ProDescriptions.Item label="Progress" valueType="progress">
            {progress.toFixed(2)}
          </ProDescriptions.Item>
        </ProDescriptions>
        <>
          <Pie {...config} />
          <Pie {...configRoutine} />
          <Pie {...configADditional} />
        </>
      </div>{" "}
      <ProForm
        size="small"
        form={form}
        // initialValues={{
        //   acStatus: currentProject?.planeStatus,
        // }}
        loading={isLoading}
        onFinish={async (values: any) => {
          const companyID = localStorage.getItem("companyID");

          // Объединяем все значения в один массив acStatus
          const acStatus =
            [values.acDcStatus, values.hydStatus, ...values.otherStatus] || [];

          console.log(acStatus);

          const result = await dispatch(
            updateProject({
              id: currentProject?._id,
              planeStatus: acStatus,
              updateDate: new Date(),
              updateUserID: USER_ID || "",
            })
          );
          if (result.meta.requestStatus === "fulfilled") {
          }
          const resultP = await dispatch(
            getFilteredProjectTasks({
              projectId: currentProject?._id || "",
            })
          );
          const resultA = await dispatch(
            getFilteredAditionalTasks({
              projectId: currentProject?._id || "",
              companyID: companyID || "",
            })
          );
        }}
      >
        <ProForm.Group>
          <ProFormRadio.Group
            name="acDcStatus"
            label="POWER STATUS"
            options={[
              { label: "AC/DC ON", value: "AC/DC ON" },
              { label: "AC/DC OFF", value: "AC/DC OFF" },
            ]}
            className="flex flex-wrap"
          />
          <ProFormRadio.Group
            name="hydStatus"
            label="HYDRO STATUS"
            options={[
              { label: "HYD ON", value: "HYD ON" },
              { label: "HYD OFF", value: "HYD OFF" },
            ]}
            className="flex flex-wrap"
          />
          <ProFormCheckbox.Group
            name="otherStatus"
            label="CONFIGURATION"
            options={[
              { label: "AIRCRAFT JACKING", value: "AIRCRAFT JACKING" },
              { label: "SLATS EXTENDED", value: "SLATS EXTENDED" },
              { label: "SPOILERS EXTENDED", value: "SPOILERS EXTENDED" },
              { label: "FLAPS EXTENDED", value: "FLAPS EXTENDED" },
            ]}
            className="flex flex-wrap"
          />
        </ProForm.Group>
      </ProForm>
    </>
  );
};
