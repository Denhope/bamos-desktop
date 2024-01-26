import type { ProFormInstance } from "@ant-design/pro-components";
import { v4 as originalUuidv4 } from "uuid"; // Импортируйте библиотеку uuid
import {
  ProCard,
  ProForm,
  ProFormCheckbox,
  ProFormDigit,
  ProFormList,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  StepsForm,
} from "@ant-design/pro-components";
import { Checkbox, Col, ConfigProvider, Form, Row, Spin, message } from "antd";
import React, { FC, useEffect, useState } from "react";
import { useRef } from "react";
import UserSearchForm from "@/components/shared/form/UserSearchForm";
import { IProjectTask } from "@/models/IProjectTaskMTB";

import WOActionDescriptionList from "../steps/WOActionDescriptionList ";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import {
  createNRCMTB,
  getFilteredAditionalTasks,
  updateProjectTask,
} from "@/utils/api/thunks";
import { setUpdatedProjectTask } from "@/store/reducers/MtbSlice";
import { tagInfo } from "@/services/utilites";
import { useTranslation } from "react-i18next";
import { USER_ID } from "@/utils/api/http";
const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};
let nextId = 1;

export interface INRCStepFormProps {
  task: IProjectTask | null;
  projectTasks: any[];
  disabled?: boolean;
}
const NRCStepForm: FC<INRCStepFormProps> = ({
  task,
  projectTasks,
  disabled,
}) => {
  const uuidv4: () => string = originalUuidv4;
  const formRef = useRef<ProFormInstance>();
  const [form] = Form.useForm();
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [isDoubleInspectionRequired, setIsDoubleInspectionRequired] =
    useState(false);
  const { t } = useTranslation();
  const { isLoading } = useTypedSelector((state) => state.mtbase);
  const [taskState, setTaskState] = useState({
    ata: "",
    zone: "",
    area: "",
    access: "",
    companyName: "",
    createUserName: "",
    createUserSing: "",
    isDoubleInspectionRequired: true,
    location: "",
    materials: [],
    nrcType: "",
    position: "f",
    registrationNumber: "",
    skill: [],
    taskDescription: "'",
    taskHeadLine: "",
    type: "",
    zoneNbr: "",

    ТResources: [] as any[],
  });
  const [formValues, setFormValues] = useState({});

  const options = Object.keys(tagInfo).map((key) => ({
    label: key,
    value: key, // Используем исходное значение тега вместо tagShort
  }));

  useEffect(() => {
    let nrcCount = 0;
    if (task && task?.workStepReferencesLinks) {
      nrcCount =
        task.workStepReferencesLinks.filter(
          (item) => item.description === "NRC W/O"
        ).length + 1;
    }
    setFormValues({
      registrationNumber: task && task.plane.registrationNumber,
      type: task && task.plane.type,
      companyName: task && task.plane.companyName,
      location: "MSQ",
      createUserSing: localStorage.getItem("singNumber"),
      createUserName: localStorage.getItem("name"),

      area: task && task?.zonesArr[0]?.majoreZone,
      ata: task && task?.ata,
      zone: task && task?.zonesArr[0]?.subZone,
      zoneNbr: task && task.zonesArr[0]?.zoneNbr,
      position: task && task?.position ? task?.position : "N/A",
      // nrcType: 'N/A',
      // skill: 'N/A',
      taskDescription: "ПРИ ВЫПОЛНЕНИИ РАБОТ",
      taskHeadLine: `NRC-${task?.taskNumber}/${nrcCount}`,
    });
  }, [task, formRef.current, taskState.registrationNumber]);

  useEffect(() => {
    formRef.current?.setFieldsValue(formValues);
  }, [formValues]);

  const dispatch = useAppDispatch();
  const [area, setArea] = useState("");

  const handleAreaChange = (value: string) => {
    setZone(value);
  };
  const [subZone, setZone] = useState("");
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
  return (
    <ProCard>
      {isLoading ? (
        <Spin></Spin>
      ) : (
        <StepsForm<{
          name: string;
        }>
          submitter={{
            searchConfig: {
              submitText: "Next",
              resetText: "Back",
            },
            render: (_, dom: React.ReactNode[]) => (disabled ? [] : dom),
          }}
          formRef={formRef}
          onFinish={async () => {
            const result = await dispatch(
              createNRCMTB({
                taskDescription: taskState.taskDescription,
                taskHeadLine: taskState.taskHeadLine,
                taskType: "MAINT",
                status: "open",
                steps: [
                  {
                    id: uuidv4(),
                    stepDescription: taskState.taskDescription,
                    stepHeadLine: taskState.taskHeadLine,
                    actions: [],
                    createDate: new Date().toISOString(),
                    createById: USER_ID || "",
                    createUser: {
                      createName: localStorage.getItem("name"),
                      createSing: localStorage.getItem("singNumber"),
                    },
                  },
                ],
                resourcesRequests: taskState.ТResources,
                isDoubleInspectionRequired: isDoubleInspectionRequired,
                workStepReferencesLinks: [
                  {
                    type: "WO",
                    reference: String(task?.projectTaskWO || ""),
                    description: "TaskCard W/O",
                  },
                  {
                    type: "WO",
                    reference: String(task?.projectWO || ""),
                    description: "Local WO",
                  },
                ],
                ata: taskState.ata,
                zone: taskState.zone,
                area: taskState.area,
                zoneNbr: taskState.zoneNbr,
                position: taskState.position,
                access: taskState.access,
                ТResources: taskState.ТResources,
                nrcType: taskState.nrcType,
                skill: taskState.skill,

                optional: {
                  // NRCInfo: {
                  //   ata: taskState.ata,
                  //   zone: taskState.zone,
                  //   area: taskState.area,
                  //   position: taskState.position,
                  //   access: taskState.access,
                  //   ТResources: taskState.ТResources,
                  //   nrcType: taskState.nrcType,
                  //   skill: taskState.skill,
                  // },
                  isDone: false,
                  isActive: false,
                  isClose: false,
                  sing: taskState.createUserSing,
                  name: taskState.createUserName,
                },
                projectWO: task?.projectWO,
                plane: {
                  registrationNumber: taskState.registrationNumber,
                  fuctoryNumber: task?.plane.fuctoryNumber,
                  companyName: taskState.companyName,
                  type: taskState.type,
                },
                createDate: new Date().toISOString(),
                ownerId: USER_ID || "",
                location: taskState.location,
                material: taskState.materials,
                projectId: task?.projectId,
                projectTaskID: task?._id,
                companyID: task?.companyID,
                actions: [],
              })
            );
            if (result.meta.requestStatus === "fulfilled") {
              const resultTask = await dispatch(
                updateProjectTask({
                  id: task && task._id,
                  workStepReferencesLinks: [
                    {
                      type: "WO",
                      reference: String(result.payload.additionalNumberId),
                      description: "NRC W/O",
                    },
                    task && task.workStepReferencesLinks,
                  ].flat(10),
                })
              );
              if (resultTask.meta.requestStatus === "fulfilled") {
                const companyID = localStorage.getItem("companyID");
                const index = projectTasks.findIndex(
                  (task1) => task1._id === task?._id
                );
                if (index !== -1) {
                  dispatch(
                    setUpdatedProjectTask({
                      index: index,
                      task: resultTask.payload,
                    })
                  );
                }
                const result = await dispatch(
                  getFilteredAditionalTasks({
                    projectId: task?.projectId || "",
                    companyID: companyID || "",
                  })
                );
                message.success("NRC successfully created ");
              } else {
                message.error("NRC not created");
              }
            }

            return true;
          }}
          formProps={{
            validateMessages: {
              required: "Please enter values",
            },
          }}
        >
          <StepsForm.StepForm<{
            name: string;
          }>
            disabled={true}
            name="header"
            title="Header information"
            stepProps={{
              description: "A/C, TASK INFO",
            }}
            onFinish={async () => {
              setTaskState((prevState) => ({
                ...prevState,
                registrationNumber:
                  formRef.current?.getFieldValue("registrationNumber"),
                type: formRef.current?.getFieldValue("type"),
                companyName: formRef.current?.getFieldValue("companyName"),
                location: formRef.current?.getFieldValue("location"),
                createUserSing:
                  formRef.current?.getFieldValue("createUserSing"),
                createUserName:
                  formRef.current?.getFieldValue("createUserName"),
              }));
              return true;
            }}
          >
            <ProForm.Group>
              <ProFormText
                name="registrationNumber"
                label=" A/C Registration Number"
                width="sm"
                tooltip="A/C Registration Number"
                placeholder="A/C "
                rules={[{ required: true }]}
              />
              <ProFormText
                name="type"
                label=" A/C Type"
                width="sm"
                tooltip="A/C type"
                placeholder="type"
                rules={[{ required: true }]}
              />
              <ProFormText
                name="companyName"
                label="Company"
                width="sm"
                tooltip="Custumer Company name"
                placeholder="company"
                rules={[{ required: true }]}
              />{" "}
              <ProFormText
                name="location"
                label="Location"
                width="xs"
                tooltip="Location"
                placeholder="Location"
                rules={[{ required: true }]}
              />
            </ProForm.Group>
            {/* <ProForm.Group></ProForm.Group> */}
            <ProForm.Group>
              <ProFormText
                name="createUserSing"
                label="Sing"
                width="xs"
                tooltip="Sing"
                placeholder="sing"
                rules={[{ required: true }]}
              />
              <ProFormText
                name="createUserName"
                label="Name"
                width="sm"
                tooltip="Name"
                placeholder="Name"
                rules={[{ required: true }]}
              />
            </ProForm.Group>
          </StepsForm.StepForm>
          <StepsForm.StepForm<{
            checkbox: string;
          }>
            name="checkbox"
            title="Description"
            stepProps={{
              description: "TASK HEADLINE, NRC INFO",
            }}
            onFinish={async () => {
              // console.log(formRef.current?.getFieldsValue());
              setTaskState((prevState) => ({
                ...prevState,
                ata: formRef.current?.getFieldValue("ata")?.value,
                position: formRef.current?.getFieldValue("position"),
                zone: formRef.current?.getFieldValue("zone"),
                area: formRef.current?.getFieldValue("area"),
                taskHeadLine: formRef.current?.getFieldValue("taskHeadLine"),
                taskDescription:
                  formRef.current?.getFieldValue("taskDescription"),
                skill: formRef.current?.getFieldValue("skill"),
                nrcType: formRef.current?.getFieldValue("nrcType"),
                zoneNbr: formRef.current?.getFieldValue("zoneNbr"),
                isDoubleInspectionRequired,
              }));
              return true;
            }}
          >
            <ProForm.Group>
              <ProFormSelect
                width="md"
                rules={[
                  {
                    required: true,
                    message: "Please select ATA!",
                    // type: 'array',
                  },
                ]}
                showSearch
                fieldProps={{
                  labelInValue: true,
                }}
                request={async () => [
                  { value: "00", label: "00 - INFORMATION" },
                  { value: "01", label: "01 - MAINTENANCE POLICY" },
                  { value: "02", label: "02 - OPERATIONS" },
                  { value: "03", label: "03 - SUPPORT" },
                  { value: "04", label: "04 - AIRWORTHINESS LIMITATIONS" },
                  { value: "05", label: "05 - TIME LIMITS/MAINTENANCE CHECKS" },
                  { value: "06", label: "06 - DIMENSIONS AND AREAS" },
                  { value: "07", label: "07 - LIFTING AND SHORING" },
                  { value: "08", label: "08 - LEVELING AND WEIGHING" },
                  { value: "09", label: "09 - TOWING AND TAXIING" },
                  {
                    value: "10",
                    label:
                      "10 - PARKING, MOORING, STORAGE AND RETURN TO SERVICE",
                  },
                  { value: "11", label: "11 - PLACARDS AND MARKINGS" },
                  { value: "12", label: "12 - SERVICING" },
                  { value: "13", label: "13 - HARDWARE AND GENERAL TOOLS" },

                  { value: "15", label: "15 - AIRCREW INFORMATION" },
                  { value: "16", label: "16 - CHANGE OF ROLE" },

                  {
                    value: "18",
                    label:
                      "18 - VIBRATION AND NOISE ANALYSIS (HELICOPTER ONLY)",
                  },

                  { value: "20", label: "20 - STANDARD PRACTICES - AIRFRAME" },
                  { value: "21", label: "21 - AIR CONDITIONING" },
                  { value: "22", label: "22 - AUTO FLIGHT" },
                  { value: "23", label: "23 - COMMUNICATIONS" },
                  { value: "24", label: "24 - ELECTRICAL POWER" },
                  { value: "25", label: "25 - EQUIPMENT/FURNISHINGS" },
                  { value: "26", label: "26 - FIRE PROTECTION" },
                  { value: "27", label: "27 - FLIGHT CONTROLS" },
                  { value: "28", label: "28 - FUEL" },
                  { value: "29", label: "29 - HYDRAULIC POWER" },
                  { value: "30", label: "30 - ICE AND RAIN PROTECTION" },
                  { value: "31", label: "31 - INDICATING/RECORDING SYSTEMS" },
                  { value: "32", label: "32 - LANDING GEAR" },
                  { value: "33", label: "33 - LIGHTS" },
                  { value: "34", label: "34 - NAVIGATION" },
                  { value: "35", label: "35 - OXYGEN" },
                  { value: "36", label: "36 - PNEUMATIC" },
                  { value: "37", label: "36 - VACUUM" },
                  { value: "38", label: "38 - WATER/WASTE" },
                  {
                    value: "39",
                    label:
                      "39 - ELECTRICAL - ELECTRONIC PANELS AND MULTIPURPOSE COMPONENTS",
                  },
                  { value: "40", label: "40 - MULTISYSTEM" },
                  { value: "41", label: "41 - WATER BALLAST" },
                  { value: "42", label: "42 - INTEGRATED MODULAR AVIONICS" },
                  {
                    value: "43",
                    label: "43 - EMERGENCY SOLAR PANEL SYSTEM (ESPS)",
                  },

                  {
                    value: "44",
                    label: "44 - CABIN SYSTEMS",
                  },
                  { value: "45", label: "45 - CENTRAL MAINT SYSTEM" },
                  { value: "46", label: "46 - INFORMATION SYSTEMS" },
                  { value: "47", label: "47 - INERT GAS SYSTEM" },
                  {
                    value: "48",
                    label: "48 - (AIRBORNE) AUXILIARY POWER UNIT",
                  },
                  { value: "49", label: "49 - AIRBORNE AUXILIARY POWER" },
                  { value: "50", label: "50 - CARGO COMPARTMENTS" },
                  { value: "52", label: "52 - DOORS" },
                  { value: "53", label: "53 - FUSELAGE" },
                  { value: "54", label: "54 - NACELLES/PYLONS" },
                  { value: "55", label: "55 - STABILIZERS" },
                  { value: "56", label: "56 - WINDOWS" },
                  { value: "57", label: "57 - WINGS" },
                  {
                    value: "60",
                    label: "60 - STANDARD PRACTICES - PROP./ROTOR",
                  },
                  { value: "61", label: "61 - PROPELLER / PROPULSORS" },
                  { value: "62", label: "62 - MAIN ROTOR(S)" },
                  { value: "63", label: "63 - MAIN ROTOR DRIVE(S)" },
                  { value: "64", label: "64 - TAIL ROTOR" },
                  { value: "65", label: "65 - TAIL ROTOR DRIVE" },
                  { value: "66", label: "66 - FOLDING BLADES/PYLON" },
                  { value: "67", label: "67 - ROTORS AND FLIGHT CONTROLS" },
                  { value: "70", label: "70 - STANDARD PRACTICES - ENGINE" },
                  { value: "71", label: "71 - POWER PLANT" },
                  { value: "72", label: "72 - ENGINE" },
                  { value: "73", label: "73 - ENGINE FUEL AND CONTROL" },
                  { value: "74", label: "74 - IGNITION" },
                  { value: "75", label: "75 - AIR" },
                  { value: "76", label: "76 - ENGINE CONTROLS" },
                  { value: "77", label: "77 - ENGINE INDICATING" },
                  { value: "78", label: "78 - EXHAUST" },
                  { value: "79", label: "79 - OIL" },
                  { value: "80", label: "80 - STARTING" },
                  { value: "81", label: "81 - TURBINES" },
                  { value: "82", label: "82 - WATER INJECTION" },
                  { value: "84", label: "84 - TURBINES" },
                  { value: "91", label: "91 - CHARTS" },
                  { value: "92", label: "92 - ELECTRICAL POWER MULTIPLEXING" },
                  { value: "93", label: "93 - SURVEILLANCE" },
                  { value: "94", label: "94 - WEAPON SYSTEM" },
                  { value: "95", label: "95 - CREW ESCAPE AND SAFETY" },
                  { value: "96", label: "96 - MISSILES, DRONES AND TELEMETRY" },
                  { value: "97", label: "97 - WIRING REPORTING" },

                  {
                    value: "98",
                    label: "98 - METEOROLOGICAL AND ATMOSPHERIC RESEARCH",
                  },
                  { value: "99", label: "99 - ELECTRONIC WARFARE SYSTEM" },
                  { value: "115", label: "115 - FLIGHT SIMULATOR SYSTEMS" },
                  {
                    value: "116",
                    label: "116 - FLIGHT SIMULATOR CUEING SYSTEM",
                  },
                ]}
                name="ata"
                label="ATA"
                tooltip="ATA-Chapter"
              />
              <ProFormText
                name="position"
                label="POSITION"
                width="sm"
                tooltip="Item position"
                rules={[
                  {
                    required: true,
                    message: "Please select POSITION!",
                    type: "string",
                  },
                ]}
              />{" "}
              <ProFormSelect
                name="area"
                label={`${t("ZONE")}`}
                tooltip="A/C Zone"
                showSearch
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
                showSearch
                name="zone"
                label={`${t("SUB ZONE")}`}
                width="sm"
                tooltip="Item sub zone"
                valueEnum={zones[subZone]?.reduce(
                  (prev: any, curr: string) => ({ ...prev, [curr]: curr }),
                  {}
                )}
                rules={[
                  {
                    required: true,
                    message: "Please select  SUB ZONE!",
                    type: "string",
                  },
                ]}
              />
              <ProFormText
                name="zoneNbr"
                label="ZONE ID"
                width="sm"
                tooltip="Item ZONE ID"
                placeholder="Please select  ZONE ID"
              />
            </ProForm.Group>
            <ProForm.Group>
              <ProFormSelect
                showSearch
                name="skill"
                label="SKILL"
                valueEnum={{
                  AF: { text: "AF" },
                  AV: { text: "AV" },
                  CA: { text: "CA" },
                  EL: { text: "EL" },
                  EN: { text: "EN" },
                  RA: { text: "RA" },
                  UT: { text: "UT" },
                  SRC: { text: "SRC" },
                  NDT: { text: "NDT" },
                  PNT: { text: "PNT" },
                  ED: { text: "ED" },
                  QI: { text: "QI" },
                  OUT: { text: "QUT A/C" },
                }}
                fieldProps={{
                  mode: "multiple",
                }}
                rules={[
                  {
                    required: true,
                    message: "Please select Skill!",
                    type: "array",
                  },
                ]}
              />
              <ProFormSelect
                showSearch
                name="nrcType"
                label="NRC TYPE"
                tooltip="NRC TYPE"
                valueEnum={{
                  PNT: "PNT-PAINTING",
                  CORR: "CORR-CORROSION",
                  STICK: "STICK-STIKER DAMAGE",
                }}
                rules={[
                  {
                    required: true,
                    message: "Please select TYPE!",
                    type: "string",
                  },
                ]}
              />
            </ProForm.Group>
            <ProForm.Group>
              <ProFormText
                name="taskHeadLine"
                label="HEADLINE"
                width="sm"
                tooltip="NRC HeadLine"
                rules={[{ required: true }]}
              />
              <ProFormTextArea
                rules={[
                  {
                    required: true,
                    message: "Please select DESCRIPTION!",
                    type: "string",
                  },
                ]}
                name="taskDescription"
                label={`${t("Description")}`}
                width="xl"
              />
              <Form.Item
                name="isDoubleInspectionRequired"
                valuePropName="checked"
              >
                <Checkbox
                  onChange={(e) =>
                    setIsDoubleInspectionRequired(e.target.checked)
                  }
                >
                  Is Double Inspection required?
                </Checkbox>
              </Form.Item>
            </ProForm.Group>
          </StepsForm.StepForm>
          <StepsForm.StepForm<{
            checkbox: string;
          }>
            name="resources"
            title="ТResources, Requests"
            stepProps={{
              description: "TECH RESOURSES, ACCESS",
            }}
            onFinish={async () => {
              // console.log(formRef.current?.getFieldsValue());
              setTaskState((prevState) => ({
                ...prevState,
                ТResources: [
                  ...(Array.isArray(
                    formRef.current?.getFieldValue("ТResources")
                  )
                    ? formRef.current?.getFieldValue("ТResources")
                    : []),
                  ...(Array.isArray(
                    formRef.current?.getFieldValue("ТResources1")
                  )
                    ? formRef.current?.getFieldValue("ТResources1")
                    : []),
                ],
                access: formRef.current?.getFieldValue("access"),
              }));

              return true;
            }}
          >
            <ProFormCheckbox.Group
              name="ТResources"
              label="ТResources"
              options={options}
              className="flex flex-wrap"
            />
          </StepsForm.StepForm>
          <StepsForm.StepForm
            name="Requests"
            title="Part, Material Requests"
            stepProps={{
              description: "Part, Material Requests",
            }}
            onFinish={async () => {
              setTaskState((prevState) => ({
                ...prevState,
                materials: formRef.current?.getFieldValue("materials"),
              }));
              return true;
            }}
          ></StepsForm.StepForm>

          <StepsForm.StepForm<{
            name: string;
          }>
            name="finish"
            title="Save NRC"
            stepProps={{
              description: "FINISH CREATE NRC",
            }}
            onFinish={async () => {
              return true;
            }}
          >
            <p>Are you sure that you want save NRC?</p>
            <Form.Item
              name="checkbox"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error("Please check the checkbox")),
                },
              ]}
            >
              <Checkbox
                onChange={(e) => setIsCheckboxChecked(e.target.checked)}
              >
                Yes, I am sure
              </Checkbox>
            </Form.Item>
          </StepsForm.StepForm>
        </StepsForm>
      )}
    </ProCard>
  );
};

export default NRCStepForm;
