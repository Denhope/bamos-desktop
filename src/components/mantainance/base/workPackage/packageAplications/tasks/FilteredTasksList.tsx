import { ProColumns } from "@ant-design/pro-components";
import { useColumnSearchProps } from "@/components/shared/Table/columnSearch";
import React, { FC, useEffect, useState } from "react";

import {
  createProjectTask,
  featchAllTasksByProjectId,
} from "@/utils/api/thunks";
import {
  DownloadOutlined,
  PlusOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { Empty, MenuProps, Spin } from "antd";
import { exportToExcel } from "@/services/utilites";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import EditableTable from "@/components/shared/Table/EditableTable";
import { ITaskDTO } from "../AddAplicationForm";
import { findTasksAndCalculateTotalTime } from "@/utils/api/thunks";
import { ITaskType } from "@/types/TypesData";
import { IReferencesLinkType } from "@/models/IAdditionalTask";
import toast from "react-hot-toast";
import { AplicationResponce } from "@/store/reducers/WPGenerationSlise";
import { useTranslation } from "react-i18next";
import { USER_ID } from "@/utils/api/http";
type FilteredTasksListPropsType = {
  data: AplicationResponce;
  aplicationName: string;
  scroll: string;
  isLoading: boolean;
  onRowClick?: (record: any) => void;
  onResult?: (result: any) => void;
};
const FilteredTasksList: FC<FilteredTasksListPropsType> = ({
  data,
  aplicationName,
  onResult,
  onRowClick,
}) => {
  const dispatch = useAppDispatch();
  const [notFoundTaskDTOs, setNotFoundTaskDTOs] = useState<any>([]);
  const [foundTasks, setFoundTasks] = useState<any>([]);
  useEffect(() => {
    const fetchData = async () => {
      const companyID = localStorage.getItem("companyID");

      if (companyID) {
        const result = await dispatch(
          findTasksAndCalculateTotalTime({
            taskDTO: data.tasks || [],
          })
        );
        if (result.meta.requestStatus === "fulfilled") {
          // console.log(result.payload);
          if (onResult) {
            onResult(result.payload);
          }
          setFoundTasks(result.payload.foundTasks);
          setNotFoundTaskDTOs(result.payload.notFoundTaskDTOs);
        }
      }
    };
    fetchData();
  }, [dispatch]);

  const { isLoading } = useTypedSelector((state) => state.planning);
  const [filteredTaskNumberData, setFilteredTaskNumberData] =
    useState(foundTasks);
  const { t } = useTranslation();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleVisibleColumnsChange = (newVisibleColumns: string[]) => {
    setVisibleColumns(newVisibleColumns);
  };

  const initialColumns: ProColumns<ITaskType>[] = [
    {
      title: "Index",
      dataIndex: "id",
      valueType: "index",
      width: "5%",

      editable: (text, record, index) => {
        return false;
      },
      // sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: "Task Nbr",
      key: "taskNumber",
      tip: "Text Show",
      ellipsis: true,
      width: "10%",

      dataIndex: "taskNumber",
    },
    {
      title: `${t("DESCRIPTIONS")}`,

      dataIndex: "taskDescription",
      key: "taskDescription",
      ellipsis: true,

      tip: "Text Show",
      width: "20%",

      // responsive: ['lg'],

      // ...useColumnSearchProps('taskDescription'),
    },
    {
      title: "AMM",
      dataIndex: "amtossNewRev",
      tip: "Text Show",
      ellipsis: true,
      key: "amtossNewRev",
      // responsive: ['lg'],
      width: "15%",
    },
    {
      title: `${t("CODE")}`,
      dataIndex: "code",
      key: "code",
      width: "6%",
      responsive: ["lg"],
      editable: (text, record, index) => {
        return false;
      },

      onFilter: true,
      valueType: "select",
      filters: [
        { text: "FC", value: "FC" },
        { text: "RS", value: "RS" },
        { text: "GVI", value: "GVI" },
        { text: "DET", value: "DET" },
        { text: "VC", value: "VC" },
        { text: "LU", value: "LU" },
        { text: "OP", value: "OP" },
        { text: "SDI", value: "SDI" },
        { text: "OP", value: "OP" },
        { text: "NDT", value: "NDT" },
      ],

      filterSearch: true,
    },
    {
      title: `${t("ZONE")}`,
      dataIndex: "area",

      key: "area",
      width: "5%",
      tip: "Text Show",
      ellipsis: true,
      responsive: ["lg"],
      editable: (text, record, index) => {
        return false;
      },
      // ...useColumnSearchProps(['taskId', 'area']),
    },
    {
      title: "Спец.",
      dataIndex: "specialization",
      key: "specialization",
      responsive: ["sm"],
      width: "6%",
      filters: [
        {
          text: "AF/AV",
          value: "AF/AV",
        },
        {
          text: "AF",
          value: "AF",
        },
        {
          text: "AV",
          value: "AV",
        },
        {
          text: "EN",
          value: "EN",
        },
        {
          text: "EN/AV",
          value: "EN/AV",
        },
        {
          text: "NDT",
          value: "NDT",
        },
      ],

      onFilter: (value: any, record: any) => {
        return value && record.specialization.indexOf(value as string) === 0;
      },
    },
    {
      title: "Man",
      dataIndex: "workerNumber",
      key: "workerNumber",
      responsive: ["sm"],
      width: "6%",
    },

    {
      title: "T m.Work",
      ellipsis: true,
      dataIndex: "mainWorkTime",
      key: "mainWorkTime",
      width: "7%",
      sorter: (a: any, b: any) => {
        return a.mainWorkTime - b.mainWorkTime;
      },

      responsive: ["sm"],
    },
    {
      title: "T add.Work",
      dataIndex: "prepareTaskTime",
      key: "prepareTaskTime",
      width: "8%",
      sorter: (a: any, b: any) => {
        return Number(a.mainWorkTime - b.mainWorkTime);
      },

      responsive: ["sm"],
    },
    {
      title: "Time",
      dataIndex: "allTaskTime",
      key: "allTaskTime",
      ellipsis: true,
      width: "6%",
      sorter: (a: any, b: any) => {
        return Number(a.mainWorkTime - b.mainWorkTime);
      },

      responsive: ["sm"],
    },
    {
      title: `${t("OPTION")}`,
      valueType: "option",
      key: "option",
      width: "10%",
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          Edit
        </a>,
      ],
    },
  ];
  type MenuItem = Required<MenuProps>["items"][number];
  function getItem(
    label: React.ReactNode,
    key?: React.Key | null,
    icon?: React.ReactNode,
    children?: any[],
    type?: "group"
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      type,
    } as MenuItem;
  }
  const items: MenuProps["items"] = [
    {
      label: `${t("Actions")}`,
      key: "actions",
      icon: null,
      children: [
        getItem(
          <div
            onClick={() => {
              foundTasks &&
                foundTasks.forEach(async (task: ITaskType) => {
                  let refArr = task.ammtossArrNew?.map(
                    (item: string): IReferencesLinkType =>
                      ({
                        type: "AMM",
                        reference: item,
                        description: "",
                      } || [])
                  );

                  const result = await dispatch(
                    createProjectTask({
                      taskId: task._id,
                      companyID: localStorage.getItem("companyID"),
                      projectId: data.projectId || "",
                      taskType: "sheduled",
                      createDate: new Date(),
                      ownerId: USER_ID,
                      optional: {
                        amtoss: task.amtossDTO,
                        MJSSNumber: task.dtoIndex,
                        WOCustomer: task.WOCustomer,
                        WOPackageType: task.WOPackageType,
                        position: task.positionDTO,
                        taskNumber: task.taskNumberDTO,
                        taskDescription: task.taskDescriptionDTO,
                        isActive: false,
                        isDone: false,
                        isFavorite: false,
                        isStarting: false,
                      },
                      status: "open",
                      _id: "",
                      name: String(localStorage.getItem("name")),
                      sing: String(localStorage.getItem("singNumber")),
                      actions: [
                        {
                          actionDescription: `ВЫПОЛНЕНО: \r\n ${
                            task.taskDescription
                          }\nв соответствии с:${task.ammtossArrNew?.map(
                            (item: string) => `\n${item.toUpperCase()}`
                          )}`,

                          actionNumber: 1,
                        },
                      ],
                      projectTaskNRSs: [],

                      workStepReferencesLinks: [
                        ...(refArr || []),
                        {
                          type: "WO",
                          reference: task.WOCustomer || "",
                          description: "Customer WO / WO Заказчика",
                        },
                        {
                          type: "WO",
                          reference: String(data.projectWO) || "",
                          description: "Local WO / Внутренний WO",
                        },
                      ],
                      materialReuest: [],
                      materialReuestAplications: [],
                      plane: {
                        registrationNumber: data.planeNumber,
                        type: data.planeType || "",
                        companyName: data.companyName,
                      },
                      projectWO: data.projectWO,
                      newMaterial: [],
                      cascader:
                        task.accessArr && task.accessArr.length
                          ? ["mec", "accessOpen"]
                          : null,
                      rewiewStatus:
                        task.accessArr && task.accessArr.length
                          ? "waiting"
                          : null,
                    })
                  );

                  if (
                    foundTasks[foundTasks.length - 1] === task &&
                    result.meta.requestStatus === "fulfilled"
                  ) {
                    notFoundTaskDTOs &&
                      notFoundTaskDTOs.forEach(async (task: ITaskDTO) => {
                        const resultNotFounded = await dispatch(
                          createProjectTask({
                            // taskId: task.id,
                            companyID: localStorage.getItem("companyID"),
                            projectId: data.projectId || "",
                            taskType: "sheduled",
                            createDate: new Date(),
                            ownerId: USER_ID,
                            optional: {
                              amtoss: task.amtoss,
                              MJSSNumber: task.id,
                              WOCustomer: task.WOCustomer,
                              WOPackageType: task.WOPackageType,
                              taskNumber: task.taskNumber,
                              position: task.position,
                              taskDescription: task.taskDescription,
                              isActive: false,
                              isDone: false,
                              isFavorite: false,
                              isStarting: false,
                            },
                            status: "open",
                            _id: "",
                            actions: [
                              {
                                actionDescription: `ВЫПОЛНЕНО: \r\n ${
                                  task.taskDescription
                                  //   ?.replace(
                                  //   /ДОСТУП ПРИМЕЧАНИЕ:.+/,
                                  //   ''.replace(/ДОСТУП:.+/, '')
                                  // )
                                  // }\nв соответствии с:\nAMM-${task.amtoss}`,
                                }\nв соответствии с:${task.amtoss}`,
                                cteateDate: new Date(),
                                actionCteateUserID: USER_ID,
                              },
                            ],
                            projectTaskNRSs: [],

                            workStepReferencesLinks: [
                              {
                                type: "WO",
                                reference: task.WOCustomer || "",
                                description: "Customer WO / WO Заказчика",
                              },
                              {
                                type: "WO",
                                reference: String(data.projectWO) || "",
                                description: "Local WO / Внутренний WO",
                              },
                            ],
                            materialReuest: [],
                            materialReuestAplications: [],
                            plane: {
                              registrationNumber: data.planeNumber,
                              type: data.planeType || "",
                              companyName: data.companyName,
                            },
                            projectWO: data.projectWO,
                            newMaterial: [],
                          })
                        );
                      });

                    toast.success("Tasks add to Work Package successfully ");
                  } else if (result.meta.requestStatus === "rejected") {
                    toast.error("Tasks not add to Work Package");
                  }
                });
            }}
          >
            Add Items to Work Package
          </div>,
          "9sshstsssishhxs"
        ),
      ],
    },

    {
      label: `${t("Report")}`,
      key: "print",
      icon: null,
      children: [
        getItem("Print", "sub4.1", null, [
          getItem("Selected Items", "sub4.1.1", <PrinterOutlined />),
          getItem(
            <div
            // onClick={() => setOpenAddAppForm(true)}
            >
              <PrinterOutlined /> All Items
            </div>,
            "9ssxs"
          ),
        ]),

        getItem("Export to Exel", "sub5", "", [
          getItem(
            <div
              onClick={() =>
                selectedRowKeys &&
                selectedRowKeys.length > 0 &&
                exportToExcel(
                  false,
                  selectedRowKeys,
                  visibleColumns,
                  foundTasks,
                  `Filtred-WOTasks-${aplicationName}`
                )
              }
            >
              <DownloadOutlined /> Selected Items
            </div>,
            "5.1"
          ),
          getItem(
            <div
              onClick={() =>
                foundTasks.length &&
                exportToExcel(
                  true,
                  selectedRowKeys,
                  visibleColumns,
                  foundTasks,
                  "All Data"
                )
              }
            >
              <PrinterOutlined /> All Items
            </div>,
            "5.2"
          ),
        ]),
        // ]),
      ],
    },
  ];
  return (
    <div className="flex my-0 mx-auto flex-col h-[67vh] relative overflow-hidden">
      <EditableTable
        recordCreatorProps={false}
        data={foundTasks}
        initialColumns={initialColumns}
        isLoading={isLoading}
        menuItems={items}
        onRowClick={function (record: any): void {
          console.log(record);
        }}
        onSave={function (rowKey: any, data: any, row: any): void {
          console.log(data);
        }}
        yScroll={42}
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        onVisibleColumnsChange={handleVisibleColumnsChange}
        externalReload={function (): Promise<void> {
          throw new Error("Function not implemented.");
        }}
      ></EditableTable>
    </div>
  );
};

export default FilteredTasksList;
