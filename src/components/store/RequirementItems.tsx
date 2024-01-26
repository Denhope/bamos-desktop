import { ModalForm, ProColumns } from "@ant-design/pro-components";
import {
  Cascader,
  ConfigProvider,
  DatePicker,
  MenuProps,
  Tag,
  TimePicker,
  Tooltip,
  message,
} from "antd";
import { useColumnSearchProps } from "@/components/shared/Table/columnSearch";
import React, { FC, useEffect, useState } from "react";
import { exportToExcel } from "@/services/utilites";
import { IMatData } from "@/types/TypesData";

import {
  DownloadOutlined,
  PrinterOutlined,
  PlusOutlined,
  DeleteOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { AplicationResponce } from "@/store/reducers/WPGenerationSlise";
import {
  createRequirement,
  getFilteredRequirements,
  updateRequirementByID,
  updateRequirementsByIds,
  deleteRequirementsByIds,
  createSingleRequirement,
  updateRequirementsByBody,
  createProjectTaskMaterialAplication,
} from "@/utils/api/thunks";
import EditableTable from "@/components/shared/Table/EditableTable";
import Select, { DefaultOptionType } from "antd/es/select";
import { IProjectTask } from "@/models/IProjectTaskMTB";
import DrawerPanel from "@/components/shared/DrawerPanel";
import AddMatirialRequestList from "@/components/mantainance/base/wp/activeTask/requeriments/AddMatirialRequestForm";
import IssuedMatForm from "@/components/mantainance/base/wp/activeTask/requeriments/IssuedMatForm";
import { useTranslation } from "react-i18next";
import { USER_ID } from "@/utils/api/http";

type FilteredRequirementItemsListPropsType = {
  data: any;
  projectTaskData: IProjectTask | null;
  scroll: number;
  scrollX?: number;
  isLoading: boolean;
  onReqClick: (record: any) => void;
  onDoubleRowClick?: (record: any) => void;
  foForecast?: boolean;
};
const RequirementItems: FC<FilteredRequirementItemsListPropsType> = ({
  data,
  // isLoading,
  scroll,
  scrollX,
  projectTaskData,
  onReqClick,
  onDoubleRowClick,
  foForecast,
}) => {
  const optionsRewiew = [
    {
      label: "TO WAIT",
      value: "waiting",
    },
    {
      label: "IN PROGRESS",
      value: "inProgress",
    },
    {
      label: "COMPLETED",
      value: "completed",
    },
    {
      label: "CANCELED",
      value: "canceled",
    },
  ];
  const onChangeRewiew: any["props"]["onChange"] = async (
    value: any,
    selectedOptions: any
  ) => {
    const selectedCount = selectedRowKeys && selectedRowKeys.length;
    if (selectedCount < 1) {
      message.error("Please select Items.");
      return;
    }
    const companyID = localStorage.getItem("companyID");
    const result = await dispatch(
      updateRequirementsByIds({
        rewiewStatus: value,
        ids: selectedRowKeys,
        updateDate: new Date(),
        updateUserID: USER_ID || "",
        companyID: companyID || "",
      })
    );
    if (result.meta.requestStatus === "fulfilled") {
      const result = await dispatch(
        getFilteredRequirements({
          companyID: companyID || "",
          projectId: projectTaskData?.projectId || "",
          projectTaskID: projectTaskData?._id,
        })
      );
      setRequirements(result.payload);
    }
  };
  const { t } = useTranslation();
  const filter = (inputValue: string, path: DefaultOptionType[]) =>
    path.some(
      (option) =>
        (option.label as string)
          .toLowerCase()
          .indexOf(inputValue.toLowerCase()) > -1
    );
  interface Option {
    value: string;
    label: string;
    children?: Option[];
    disabled?: boolean;
  }

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [allRowKeys, setAllRowKeys] = useState<React.Key[]>([]);

  function extractIds(objects: ObjectType[]): string[] {
    return objects.map((object) => object._id);
  }

  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleVisibleColumnsChange = (newVisibleColumns: string[]) => {
    setVisibleColumns(newVisibleColumns);
  };
  type ObjectType = {
    _id: string;
    taskNumber: string;
    startOfWork: string;
    workInterval: string;
    amtoss: string;
    code: string;
    PN: string;
    alternative: string;
    nameOfMaterial: string;
    amout: number;
    unit: string;
  };

  const [materialsRequirements, setRequirements] = useState<any>([]);
  const [initialMaterialsRequirements, setInitialRequirements] = useState<any>(
    []
  );
  const { isLoading, filteredRequirementsForecast } = useTypedSelector(
    (state) => state.storesLogistic
  );
  const [issuedRecords, setIssuedRecords] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    setRequirements(filteredRequirementsForecast);
    setInitialRequirements(filteredRequirementsForecast);
  }, [filteredRequirementsForecast]);
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const dispatch = useAppDispatch();
  const [tableData, setTableData] = useState([]);

  const handleTableDataChange = (data: any) => {
    setTableData(data);
  };

  const initialColumns: ProColumns<any>[] = [
    {
      title: "",
      dataIndex: "readyStatus",
      key: "readyStatus",
      width: "3%",
      editable: (text, record, index) => {
        return false;
      },
      valueType: "select",

      filters: true,
      onFilter: true,
      valueEnum: {
        "not Ready": { text: t("NOT AVAILABLE") },
        Ready: { text: t("AVAILABLE") },
      },
      render: (text: any, record: any) => {
        let color =
          record?.availableQTY &&
          record.availableQTY >= (record?.amout - record?.issuedQuantity || 0)
            ? "green"
            : "red";
        return (
          <Tag
            color={color}
            style={{ borderRadius: "50%", width: "16px", height: "16px" }}
          />
        );
      },
    },
    {
      title: `${t("PART REQUEST NBR")}`,
      dataIndex: "partRequestNumber",
      // valueType: 'index',
      ellipsis: true,
      width: "4%",

      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return (
          <a
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              // setOpenRequirementDrawer(true);
              onReqClick(record);
            }}
          >
            {record?.partRequestNumber && record?.partRequestNumber}
          </a>
        );
      },
      // sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: `${t("Status")}`,
      key: "status",
      width: "7%",
      valueType: "select",
      filterSearch: true,
      filters: true,
      editable: (text, record, index) => {
        return false;
      },
      onFilter: true,
      valueEnum: {
        inStockReserve: { text: t("RESERVATION"), status: "Success" },
        //onPurchasing: { text: t('PURCHASING'), status: 'Processing' },
        onCheack: { text: t("CHECK"), status: "Warning" },
        open: { text: t("NEW"), status: "Error" },
        closed: { text: t("CLOSED"), status: "Default" },
        canceled: { text: t("CANCELLED"), status: "Error" },
        onOrder: { text: t("ISSUED"), status: "Processing" },
      },

      dataIndex: "status",
    },
    {
      title: `${t("EVENT")}`,
      dataIndex: "taskWO",
      key: "taskWO",
      width: "7%",
      editable: (text, record, index) => {
        return false;
      },
      sorter: (a, b) => (a.taskWO || 0) - (b.taskWO || 0),
      ...useColumnSearchProps({
        dataIndex: "taskWO",
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = materialsRequirements.filter((item: any) =>
              String(item.taskWO)
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setRequirements(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setRequirements(initialMaterialsRequirements);
          }
        },
        data: materialsRequirements,
      }),
    },
    {
      title: `${t("PROJECT")}`,
      dataIndex: "projectWO",
      key: "projectWO",
      width: "5%",
      // responsive: ['sm'],
      ...useColumnSearchProps({
        dataIndex: "projectWO",
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = materialsRequirements.filter((item: any) =>
              String(item.projectWO)
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setRequirements(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setRequirements(initialMaterialsRequirements);
          }
        },
        data: materialsRequirements,
      }),
    },
    {
      title: `${t("RECEIVER")}`,
      dataIndex: "planeNumber",
      width: "5%",
      key: "planeNumber",
      responsive: ["sm"],
      // sorter: (a, b) => a.unit.length - b.unit.length,
      ...useColumnSearchProps({
        dataIndex: "planeNumber",
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = materialsRequirements.filter((item: any) =>
              String(item.planeNumber)
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setRequirements(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setRequirements(initialMaterialsRequirements);
          }
        },
        data: materialsRequirements,
      }),
    },

    {
      title: `${t("PN")}`,
      dataIndex: "PN",
      key: "PN",
      width: "10%",
      ellipsis: true,
      ...useColumnSearchProps({
        dataIndex: "PN",
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = materialsRequirements.filter((item: any) =>
              String(item.PN)
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setRequirements(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setRequirements(initialMaterialsRequirements);
          }
        },
        data: materialsRequirements,
      }),
      // responsive: ['sm'],
    },

    {
      title: `${t("DESCRIPTION")}`,
      dataIndex: "nameOfMaterial",
      key: "nameOfMaterial",
      // responsive: ['sm'],

      ellipsis: true, //
      width: "10%",
    },
    {
      title: `${t("GROUP")}`,
      dataIndex: "group",
      key: "group",
      // responsive: ['sm'],

      ellipsis: true, //
      width: "6%",
    },
    {
      title: `${t("DUE DATE")}`,
      dataIndex: "dueDATE",
      key: "dueDATE",
      // responsive: ['sm'],

      ellipsis: true, //
      width: "6%",
    },
    {
      title: `${t("PLANNED DATE")}`,
      dataIndex: "plannedDate",
      key: "plannedDate",
      ellipsis: true,
      width: "6%",
      render(value: any, record: any) {
        // Преобразование даты в более читаемый формат
        const date = new Date(record.plannedDate);
        const formattedDate = record.plannedDate && date.toLocaleDateString();
        return formattedDate;
      },
      sorter: (a, b) => {
        if (a.plannedDate && b.plannedDate) {
          const aFinishDate = new Date(a.plannedDate);
          const bFinishDate = new Date(b.plannedDate);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
      },
      // renderFormItem: () => {
      //   return <DatePicker />;
      // },
    },

    {
      title: `${t("PRIO")}`,
      dataIndex: "prio",
      key: "prio",
      width: "3%",
      responsive: ["sm"],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: `${t("QTY")}`,
      dataIndex: "amout",
      key: "amout",
      width: "4%",
      // editable: (text, record, index) => {
      //   return false;
      // },
      // sorter: (a, b) => a.amout - b.amout,
      // responsive: ['sm'],
    },
    {
      title: `${t("UNIT")}`,
      dataIndex: "unit",
      key: "unit",
      width: "4%",
      responsive: ["sm"],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t("REQUESTED QTY")}`,
      dataIndex: "requestQuantity",
      width: "7%",
      key: "requestQuantity",
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        // Вычисляем разницу между record.amout и record.issuedQuantity
        const difference = record.amout - record.requestQuantity;
        // Определяем цвет фона в зависимости от условия
        const backgroundColor = difference > 0 ? "#f0be37" : "";
        return (
          <div
            style={{ backgroundColor }} // Применяем цвет фона
          >
            {record.requestQuantity && record.requestQuantity}
          </div>
        );
      },
    },

    // {
    //   title: `${t('ON SHORT')}`,
    //   dataIndex: 'shortQuantity',
    //   key: 'shortQuantity',
    //   editable: (text, record, index) =>s {
    //     return false;
    //   },
    //   render: (text: any, record: any) => {
    //     return (
    //       <a onClick={() => {}}>
    //         {record.shortQuantity && record.shortQuantity}
    //       </a>
    //     );
    //   },
    //   // responsive: ['sm'],
    // },
    {
      title: `${t(" BOOKED QTY")}`,
      width: "6%",
      dataIndex: "issuedQuantity",
      key: "issuedQuantity",
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        const difference = record.amout - record.issuedQuantity;
        // Определяем цвет фона в зависимости от условия
        const backgroundColor = difference > 0 ? "#f0be37" : "#62d156";
        return (
          <div
            style={{ backgroundColor }}
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              // setOpenRequirementDrawer(true);
              setIssuedRecords(record.issuedItems);
              setIsModalOpen(true);
            }}
          >
            {record.issuedQuantity && record.issuedQuantity}
          </div>
        );
      },
      // responsive: ['sm'],
    },
    {
      title: `${t("AVAIL QTY")}`,
      dataIndex: "availableQTY",
      key: "availableQTY",
      width: "4%",
      responsive: ["sm"],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t("LINK QTY")}`,
      dataIndex: "reservationQTY",
      key: "reservationQTY",
      width: "4%",
      responsive: ["sm"],
      // sorter: (a, b) => a.unit.length - b.unit.length,
      render: (text: any, record: any) => {
        const difference = record.amout - record.reservationQTY;
        // Определяем цвет фона в зависимости от условия
        const backgroundColor = difference > 0 ? "#f0be37" : "#62d156";
        return (
          <div
            style={{ backgroundColor }}
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              // setOpenRequirementDrawer(true);
              setIssuedRecords(record.issuedItems);
              setIsModalOpen(true);
            }}
          >
            {record.reservationQTY && record.reservationQTY}
          </div>
        );
      },
    },
    {
      title: `${t("MAT UNAV.")}`,
      dataIndex: "unAvailableQTY",
      key: "unAvailableQTY",
      width: "4%",
      responsive: ["sm"],
      render: (text: any, record: any) => {
        return (
          <div>
            {record.unAvailableQTY &&
            record.unAvailableQTY > 0 &&
            record.unAvailableQTY
              ? record.unAvailableQTY
              : "-"}
          </div>
        );
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t("NEEDED ON")}`,
      dataIndex: "neededOn",
      key: "neededOn",
      width: "4%",
      responsive: ["sm"],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t("DELIVERY DATE")}`,
      dataIndex: "deliveryDate",
      key: "deliveryDate",
      width: "5%",
      responsive: ["sm"],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
  ];
  const onChange: any["props"]["onChange"] = async (
    value: any,
    selectedOptions: any
  ) => {
    const selectedCount = selectedRowKeys && selectedRowKeys.length;
    if (selectedCount < 1) {
      message.error("Please select Items.");
      return;
    }
    const companyID = localStorage.getItem("companyID");
    const result = await dispatch(
      updateRequirementsByIds({
        cascader: value,
        ids: selectedRowKeys,
        companyID: companyID || "",
        updateDate: new Date(),
        updateUserID: USER_ID || "",
      })
    );
    if (result.meta.requestStatus === "fulfilled") {
      const result = await dispatch(
        getFilteredRequirements({
          companyID: companyID || "",
          projectId: projectTaskData?.projectId || "",
          projectTaskID: projectTaskData?._id,
        })
      );
      setRequirements(result.payload);
    }
  };

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
        getItem("Reservation", "sub54", <AppstoreOutlined />, [
          getItem(
            <div
              onClick={async () => {
                const selectedCount = selectedRowKeys && selectedRowKeys.length;
                if (selectedCount < 1) {
                  message.error("Please select Items.");
                  return;
                }
              }}
            >
              Selected Items
            </div>,
            "5.17"
          ),
          getItem(<div onClick={async () => {}}>All Items</div>, "5.172"),
        ]),
        getItem("Update Status selected items ", "subydd09", "", [
          getItem(
            <div
              onClick={async () => {
                const selectedCount = selectedRowKeys && selectedRowKeys.length;
                if (selectedCount < 1) {
                  message.error("Please select  Items.");
                  return;
                }
                const companyID = localStorage.getItem("companyID");
                // console.log(selectedRowKeys);

                const result = await dispatch(
                  updateRequirementsByIds({
                    status: "open",
                    cascader: ["logistic", "check"],
                    rewiewStatus: "waiting",
                    ids: selectedRowKeys,
                    companyID: companyID || "",
                    updateDate: new Date(),
                    updateUserID: USER_ID || "",
                  })
                );
                if (result.meta.requestStatus === "fulfilled") {
                  const result = await dispatch(
                    getFilteredRequirements({
                      companyID: companyID || "",
                      projectId: projectTaskData?.projectId || "",
                      projectTaskID: projectTaskData?._id,
                    })
                  );
                  setRequirements(result.payload);
                }
              }}
            >
              Open
            </div>,
            "9sasyhqss"
          ),
          getItem(
            <div
              onClick={async () => {
                const selectedCount = selectedRowKeys && selectedRowKeys.length;
                if (selectedCount < 1) {
                  message.error("Please select  Items.");
                  return;
                }
                const companyID = localStorage.getItem("companyID");
                // console.log(selectedRowKeys);

                const result = await dispatch(
                  updateRequirementsByIds({
                    status: "canceled",
                    rewiewStatus: "completed",
                    cascader: ["ed", "checking"],
                    ids: selectedRowKeys,
                    companyID: companyID || "",
                    updateDate: new Date(),
                    updateUserID: USER_ID || "",
                  })
                );
                if (result.meta.requestStatus === "fulfilled") {
                  const result = await dispatch(
                    getFilteredRequirements({
                      companyID: companyID || "",
                      projectId: projectTaskData?.projectId || "",
                      projectTaskID: projectTaskData?._id,
                    })
                  );
                  setRequirements(result.payload);
                }
              }}
            >
              Canceled
            </div>,
            "9sasddyhqss"
          ),
          getItem(
            <div
              onClick={async () => {
                const selectedCount = selectedRowKeys && selectedRowKeys.length;
                if (selectedCount < 1) {
                  message.error("Please select  Items.");
                  return;
                }
                const companyID = localStorage.getItem("companyID");
                // console.log(selectedRowKeys);

                const result = await dispatch(
                  updateRequirementsByIds({
                    status: "onCheack",
                    rewiewStatus: "inProgress",
                    cascader: ["ed", "check"],
                    ids: selectedRowKeys,
                    companyID: companyID || "",
                    updateDate: new Date(),
                    updateUserID: USER_ID || "",
                  })
                );
                if (result.meta.requestStatus === "fulfilled") {
                  const result = await dispatch(
                    getFilteredRequirements({
                      companyID: companyID || "",
                      projectId: projectTaskData?.projectId || "",
                      projectTaskID: projectTaskData?._id,
                    })
                  );
                  setRequirements(result.payload);
                }
              }}
            >
              Checking
            </div>,
            "9saysddyhqss"
          ),
          getItem(
            <div
              onClick={async () => {
                const selectedCount = selectedRowKeys && selectedRowKeys.length;
                if (selectedCount < 1) {
                  message.error("Please select  Items.");
                  return;
                }
                const companyID = localStorage.getItem("companyID");
                // console.log(selectedRowKeys);

                const result = await dispatch(
                  updateRequirementsByIds({
                    status: "inStockReserve",
                    rewiewStatus: "inProgress",
                    cascader: ["ed", "check"],
                    ids: selectedRowKeys,
                    companyID: companyID || "",
                    updateDate: new Date(),
                    updateUserID: USER_ID || "",
                  })
                );
                if (result.meta.requestStatus === "fulfilled") {
                  const result = await dispatch(
                    getFilteredRequirements({
                      companyID: companyID || "",
                      projectId: projectTaskData?.projectId || "",
                      projectTaskID: projectTaskData?._id,
                    })
                  );
                  setRequirements(result.payload);
                }
              }}
            >
              Reservation
            </div>,
            "9saysddyццhqss"
          ),
        ]),
        // getItem(<div>Update Skill selected Item</div>, 'updateSkill', '', [
        //   getItem(
        //     <div
        //       onClick={(e) => {
        //         e.stopPropagation();
        //       }}
        //     >
        //       <Cascader
        //         options={options}
        //         onChange={onChange}
        //         placeholder="Please select"
        //         showSearch={{ filter }}
        //         onSearch={(value) => {}}
        //       />
        //     </div>
        //   ),
        // ]),
        // getItem(
        //   <div
        //   // onClick={(e) => {
        //   //   e.stopPropagation();
        //   //   // setOpenAddAppForm(true);
        //   // }}
        //   >
        //     Update Skill/Wait Rewiew
        //   </div>,
        //   'updateSkill/Wait',
        //   '',
        //   [
        //     getItem(
        //       <div
        //         onClick={(e) => {
        //           e.stopPropagation();
        //         }}
        //       >
        //         <Select
        //           options={optionsRewiew}
        //           onChange={onChangeRewiew}
        //           placeholder="Please select"
        //           showSearch
        //           onSearch={(value) => {}}
        //         />
        //       </div>
        //     ),
        //   ]
        // ),
        getItem("Delete Items ", "sub85", <DeleteOutlined />, [
          getItem(
            <div
              onClick={async () => {
                const selectedCount = selectedRowKeys && selectedRowKeys.length;
                if (selectedCount < 1) {
                  message.error("Please select Items.");
                  return;
                }
                const companyID = localStorage.getItem("companyID");
                const result = await dispatch(
                  deleteRequirementsByIds({
                    ids: selectedRowKeys,
                    companyID: companyID || "",
                    projectID: projectTaskData?.projectId || "",
                  })
                );
                if (result.meta.requestStatus === "fulfilled") {
                  setSelectedRowKeys([]);
                  const result = await dispatch(
                    getFilteredRequirements({
                      companyID: companyID || "",
                      projectId: projectTaskData?.projectId || "",
                      projectTaskID: projectTaskData?._id,
                    })
                  );
                  setRequirements(result.payload);
                }
              }}
            >
              Selected Items
            </div>,
            "5.18"
          ),
          getItem(
            <div
              onClick={async () => {
                const companyID = localStorage.getItem("companyID");
                const result = await dispatch(
                  deleteRequirementsByIds({
                    ids: extractIds(materialsRequirements),
                    companyID: companyID || "",
                    projectID: projectTaskData?.projectId || "",
                  })
                );
                if (result.meta.requestStatus === "fulfilled") {
                  setSelectedRowKeys([]);
                  const result = await dispatch(
                    getFilteredRequirements({
                      companyID: companyID || "",
                      projectId: projectTaskData?.projectId || "",
                      projectTaskID: projectTaskData?._id,
                    })
                  );
                  setRequirements(result.payload);
                }
              }}
            >
              All Items
            </div>,
            "5.1827"
          ),
        ]),
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
                  materialsRequirements,
                  `Filtred-RequirementItems-${data.aplicationName}`
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
                materialsRequirements.length &&
                exportToExcel(
                  true,
                  selectedRowKeys,
                  visibleColumns,
                  materialsRequirements,
                  `All RequirementItems-${data.aplicationName}`
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
  const [position, setPosition] = useState<"top" | "bottom" | "hidden">(
    "bottom"
  );
  const {} = useTypedSelector((state) => state.mtbase);
  const [issuedFormData, setIssuedFormData] = useState({
    getFrom: "",
    neededOn: "",
    remarks: "",
    plannedDate: null,
  });
  const handleFieldsChange = (fields: any) => {
    // Обрабатываем изменение полей здесь
    console.log(fields);
    setIssuedFormData(fields);
  };

  const [openNewMatRequestDrawer, setOpenNewMatRequestDrawer] = useState(false);
  return (
    <div className="flex my-0 mx-auto  h-[78vh] flex-col relative overflow-hidden">
      {" "}
      <ModalForm
        title={`PART REQUEST`}
        // size={'large'}
        width={"70vw"}
        // placement={'bottom'}
        open={openNewMatRequestDrawer}
        // submitter={false}
        onOpenChange={setOpenNewMatRequestDrawer}
        onFinish={async () => {
          const updatedTableData = tableData.map((item: any) => {
            if (typeof item === "object" && item !== null) {
              return {
                ...(item as object), // Явно указываем, что item является объектом
                updateDate: new Date(),
                updateUserID: USER_ID || "",
                // requestQuantity: item?.amout,
              };
            }
            return item;
          });
          const result = await dispatch(
            createProjectTaskMaterialAplication({
              materials: updatedTableData,
              createDate: new Date(),
              createUserId: USER_ID || "",
              projectTaskId: projectTaskData?._id,
              projectId: projectTaskData?.projectId || "",
              projectWO: projectTaskData?.projectWO,
              planeType: projectTaskData?.plane.type,
              registrationNumber: projectTaskData?.plane.registrationNumber,
              status: "issued",
            })
          );
          if (result.meta.requestStatus === "fulfilled") {
            console.log(result.payload.materials);
            const updatedTableData = result.payload.materials.map(
              (item: any) => {
                if (typeof item === "object" && item !== null) {
                  return {
                    ...(item as object), // Явно указываем, что item является объектом
                    materialOrderID: result.payload.id,

                    // requestQuantity: item?.amout,
                  };
                }
                return item;
              }
            );
            // console.log(updatedTableData);
            const result1 = await dispatch(
              updateRequirementsByBody({
                companyID: projectTaskData?.companyID || "",
                newData: {
                  updatedTableData,
                },
              })
            );
          }

          if (result.meta.requestStatus === "fulfilled") {
            const result = await dispatch(
              getFilteredRequirements({
                companyID: projectTaskData?.companyID || "",
                projectId: projectTaskData?.projectId || "",
                projectTaskID: projectTaskData?._id,
              })
            );
            setRequirements(result.payload);
            setInitialRequirements(result.payload);
          }

          message.success("PARTS IISUED SUCCESSFULLY ");

          return true;
        }}
        // getContainer={false}
      >
        <AddMatirialRequestList
          onFieldsChange={handleFieldsChange}
          handleTableDataChange={handleTableDataChange}
          projectTaskData={projectTaskData || null}
          scroll={43}
          isLoading={isLoading}
          ids={selectedRowKeys}
          onReqClick={function (record: any): void {
            throw new Error("Function not implemented.");
          }}
        ></AddMatirialRequestList>
      </ModalForm>
      {/* <div className="flex my-0 mx-auto relative overflow-hidden"> */}
      <EditableTable
        recordCreatorProps={false}
        showSearchInput={true}
        data={materialsRequirements}
        initialColumns={initialColumns}
        isLoading={isLoading}
        menuItems={items}
        onDoubleRowClick={function (record: any, rowIndex?: any): void {
          onDoubleRowClick && onDoubleRowClick(record);
        }}
        onRowClick={function (record: any): void {
          console.log(record);
        }}
        isSelectable={(record) => {
          return !(
            // record.status === 'onCheack' ||
            (record.status === "closed" || record.amount <= 0)
          );
        }}
        onSave={async function (
          rowKey: any,
          data: any,
          row: any
        ): Promise<void> {
          if (data.isNew) {
            const companyID = localStorage.getItem("companyID");
            const result = await dispatch(
              createSingleRequirement({
                rewiewStatus: data.rewiewStatus,
                cascader: data.cascader,
                status: data.status,
                companyID: companyID || "",
                createUserID: USER_ID || "",
                projectID: projectTaskData?.projectId || "",
                quantity: data.amout,
                alternative: data.alternative,
                unit: data.unit,
                description: data.nameOfMaterial,
                partNumber: data.PN,
                isNewAdded: false,
                createDate: new Date(),
                taskNumber: projectTaskData?.taskNumber || "",
                issuedQuantity: 0,
                registrationNumber: projectTaskData?.plane.registrationNumber,
              })
            );
            if (result.meta.requestStatus === "fulfilled") {
              const result = await dispatch(
                getFilteredRequirements({
                  companyID: companyID || "",
                  projectId: projectTaskData?.projectId || "",
                  projectTaskID: projectTaskData?._id,
                })
              );
              setRequirements(result.payload);
              setInitialRequirements(result.payload);
            }
          } else {
            const companyID = localStorage.getItem("companyID");
            const result = await dispatch(
              updateRequirementByID({
                id: rowKey,
                rewiewStatus: data.rewiewStatus,
                cascader: data.cascader,
                note: data.note,
                status: data.status,
                companyID: companyID || "",
                updateUserID: USER_ID || "",
                projectID: projectTaskData?.projectId || "",
                updateDate: new Date(),
                amout: data.amout,
                alternative: data.alternative,
                unit: data.unit,
                nameOfMaterial: data.nameOfMaterial,
                PN: data.PN,
              })
            );
          }
        }}
        yScroll={scroll}
        xScroll={scrollX}
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        onVisibleColumnsChange={handleVisibleColumnsChange}
        externalReload={async function (): Promise<void> {
          try {
            const companyID = localStorage.getItem("companyID");
            const result = await dispatch(
              getFilteredRequirements({
                companyID: companyID || "",
                projectId: projectTaskData?.projectId || "",
                projectTaskID: projectTaskData?._id,
              })
            );
          } catch (error) {
            console.error(error);
          }
        }}
      ></EditableTable>
      {
        <IssuedMatForm
          open={isModalOpen}
          onClose={handleCloseModal}
          issuedRecord={issuedRecords}
          isLoading={false}
          menuItems={[]}
          yScroll={26}
        />
      }
      {/* </div>{' '} */}
    </div>
  );
};

export default RequirementItems;
