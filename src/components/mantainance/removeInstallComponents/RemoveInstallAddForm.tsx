import {
  ProForm,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import {
  AutoComplete,
  Button,
  ConfigProvider,
  Form,
  Input,
  Select,
  message,
} from "antd";

import { IProjectResponce } from "@/models/IProject";
import React, { FC, useRef, useState } from "react";
import {
  createRemoveInstallSingleComponent,
  getfilteredAccessNumbers,
} from "@/utils/api/thunks";

import { useAppDispatch } from "@/hooks/useTypedSelector";
import { useTranslation } from "react-i18next";
import { USER_ID } from "@/utils/api/http";
type AddRemoveInstallAddFormOrops = { projectData: IProjectResponce };
const RemoveInstallAddForm: FC<AddRemoveInstallAddFormOrops> = ({
  projectData,
}) => {
  const { Option } = Select;
  const [access, setAccess] = useState([]);
  const [selectedAccess, setSelectedAccess] = useState<any | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [form] = Form.useForm();
  const [subZone, setZone] = useState("");

  const handleAreaChange = (value: string) => {
    setZone(value);
  };
  const handleSearch = async (value: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      const filteredAccessNumbers = await getfilteredAccessNumbers({
        companyID: localStorage.getItem("companyID") || "",
        accessNbr: value,
        acType: projectData.planeType || "",
        zone: form.getFieldValue("zone"),
        description: form.getFieldValue("description"),
        subZone: form.getFieldValue("subZone"),
        type: form.getFieldValue("type"),
      });

      if (filteredAccessNumbers.length > 0) {
        setAccess(filteredAccessNumbers);
      } else {
        setAccess([]);
        setSelectedAccess(null);
        // console.log(selectedAccess);
      }
    }, 400);
  };

  const handleSelect = (value: string) => {
    const task = access.find((task: any) => task.panel === value);
    if (task) {
      setSelectedAccess(task);
      handleSelectChange(task);
    }
  };
  const handleSelectChange = (item: any) => {
    form.setFieldsValue({
      accessNbr: item?.panel,
      description: item?.description.toUpperCase(),
      zone: item?.majoreZone.toUpperCase(),
      subZone: item?.subZone.toUpperCase(),
      type: item?.type.toUpperCase(),
    });
  };
  const zones: { [key: string]: string[] } = {
    "FUS LOWER HALF": [
      "LWRFUS",
      "RADOME",
      "E/E COMP",
      "FWD C/C",
      "E/E COMP",
      "MLG W/W",
      "BULK",
      "WTB",
      "AFT C/C",
    ],
    "FUS UPPER HALF": [
      "UPFUS",
      "COCKPIT",
      "E/E COMP",
      "FWD ENTRY",
      "FWD PAX",
      "CTR PAX",
      "AFT PAX",
      "AFT ENTRY",
      "AFT C/C",
    ],
    "LH WING": [
      "LEADING EDGE",
      "TRALING EDGE FLAP FARING",
      "FIX SECTION",
      "FIX TIP SECTION",
      "AFT FIX SECTION",
      "FLAP",
      "AILERON",
    ],
    "RH WING": [
      "LEADING EDGE",
      "TRALING EDGE FLAP FARING",
      "FIX SECTION",
      "FIX TIP SECTION",
      "AFT FIX SECTION",
      "FLAP",
      "AILERON",
    ],
    TAIL: [
      "TAIL",
      "TAIL CONE",
      "THS COMP",
      "TAIL CONE",
      "VERT STAB",
      "HOR STAB",
      "LH HOR STAB",
      "RH HOR STAB",
    ],
    "POWER PLANT": [
      "POWER PLANT",
      "LH FWD PYLON",
      "RH FWD PYLON",
      "LH NACELLE",
      "RH NACELLE",
      "LH CORE",
      "RH CORE",
      "LH TR",
      "RH TR",
      "LH FIX PYLON",
      "RH FIX PYLON",
    ],
    "LANDING GEAR": ["NLG", "MLG", "LH MLG", "RH MLG"],
    CABIN: ["FWD PAX", "CTR PAX", "ATF PAX"],
    "FUEL TANK": ["LH TANK", "CTR TANK", "RH TANK", "ACT"],
    DOOR: [
      "DOOR",
      "LH FWD ENTRY SERVICE",
      "LH AFT ENTRY SERVICE",
      "LH EMER EXIT",
      "RH FWD ENTRY SERVICE",
      "RH AFT ENTRY SERVICE",
      "RH EMER EXIT",
    ],
    TBD: ["TBD"],
    // Добавьте здесь другие зоны для каждой области
  };
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  return (
    // <div>
    <ProForm
      // form={form}
      // labelCol={{ span: 8 }}
      // wrapperCol={{ span: 16 }}
      // style={{ maxWidth: 600 }}
      onFinish={async (values: any) => {
        if (!values.nrcTaskNumber && !values.taskNbr) {
          message.error(
            "Please fill in at least one of the fields: NRC Number or Task Number"
          );
          return;
        }
        //console.log(values, selectedAccess._id);
        dispatch(
          createRemoveInstallSingleComponent({
            companyID: localStorage.getItem("companyID") || "",
            projectId: projectData._id || "",
            createDate: new Date(),
            createUserID: USER_ID || "",
            accessIds: selectedAccess
              ? [selectedAccess && selectedAccess?._id]
              : null,
            projectTaskWOs: [form.getFieldValue("taskNbr")],
            additionalTaskWOs: [form.getFieldValue("nrcTaskNumber")],
            removeItem: {
              panel: form.getFieldValue("accessNbr") || null,
              zone: form.getFieldValue("zone") || null,
              subZone: form.getFieldValue("subZone") || null,
              description: form.getFieldValue("description") || null,
              serialNbr: form.getFieldValue("serialNbr") || null,
              position: form.getFieldValue("position") || null,
              type: form.getFieldValue("type") || null,
            },
            installItem: { panel: form.getFieldValue("accessNbr") || null },

            //</ConfigProvider>
          })
        );
      }}
    >
      <ProForm.Item
        // hasFeedback
        rules={[{ required: true }]}
        label={`${t("ACCESS/P/N")}`}
        name="accessNbr"
      >
        <AutoComplete
          allowClear
          onSelect={handleSelect}
          onSearch={handleSearch}
        >
          {Array.isArray(access)
            ? access.map((task: any) => (
                <AutoComplete.Option key={task.panel} value={task.panel}>
                  {`${task.panel}-${task.description}`}
                </AutoComplete.Option>
              ))
            : null}
        </AutoComplete>
      </ProForm.Item>
      <ProFormText
        // hasFeedback

        rules={[
          {
            pattern: /^2\d*$/,
            message: "Please enter a number starting with 2",
          },
        ]}
        label={`${t("Task Number")}`}
        name="taskNbr"
      ></ProFormText>
      <ProFormText
        // hasFeedback
        rules={[
          {
            pattern: /^3\d*$/,
            message: "Please enter a number starting with 3",
          },
        ]}
        label={`${t("NRC Number")}`}
        name="nrcTaskNumber"
      ></ProFormText>
      <ProFormText
        rules={[{ required: true }]}
        label={`${t("Description")}`}
        name="description"
        tooltip={`${t("Description")}`}
      >
        {/* <Input allowClear /> */}
      </ProFormText>{" "}
      <ProFormSelect
        name="zone"
        label={`${t("ZONE")}`}
        tooltip="A/C Zone"
        valueEnum={{
          "FUS LOWER HALF": "FUS LOWER HALF",
          "FUS UPPER HALF": "FUS UPPER HALF",
          TAIL: "TAIL",
          "POWER PLANT": "POWER PLANT",
          "LH WING": "LH WING",
          "RH WING": "RH WING",
          "LANDING GEAR": "LANDING GEAR",
          DOOR: "DOOR",
          "FUEL TANK": "FUEL TANK",
          TBD: "TBD",
          CABIN: "CABIN",
        }}
        placeholder="Please select zone"
        rules={[
          {
            required: true,
            message: "Please select ZONE!",
            type: "string",
          },
        ]}
        fieldProps={{
          onChange: handleAreaChange,
        }}
      />
      <ProFormSelect
        name="subZone"
        label={`${t("SUB ZONE")}`}
        width="sm"
        tooltip="Item sub zone"
        valueEnum={zones[subZone]?.reduce(
          (prev: any, curr: string) => ({ ...prev, [curr]: curr }),
          {}
        )}
        placeholder="Please select sub zone"
        rules={[
          {
            required: true,
            message: "Please select  SUB ZONE!",
            type: "string",
          },
        ]}
      />
      <ProFormSelect
        name="type"
        label={`${t("TYPE")}`}
        width="sm"
        tooltip="Item type"
        valueEnum={{
          "ACCESS PANEL": "ACCESS PANEL",
          "CEILING PANEL": "CEILING PANEL",
          "HARD ACCESS": "HARD ACCESS",
          COMPONENT: "COMPONENT",
        }}
        placeholder="Please select type"
        rules={[
          {
            required: true,
            message: "Please select  type!",
            type: "string",
          },
        ]}
      />
      <ProFormText
        label={`${t("Serial Number")}`}
        name="serialNbr"
        tooltip={`${t("Serial Number")}`}
      >
        <Input allowClear />
      </ProFormText>{" "}
    </ProForm>
  );
};

export default RemoveInstallAddForm;
