import { ProColumns } from "@ant-design/pro-components";
import { Cascader, MenuProps, Tag, message } from "antd";
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
import { useAppDispatch } from "@/hooks/useTypedSelector";
import { AplicationResponce } from "@/store/reducers/WPGenerationSlise";
import {
  createRequirement,
  getFilteredRequirements,
  updateRequirementByID,
  updateRequirementsByIds,
  deleteRequirementsByIds,
  createSingleRequirement,
} from "@/utils/api/thunks";
import EditableTable from "@/components/shared/Table/EditableTable";
import Select, { DefaultOptionType } from "antd/es/select";
import { useTranslation } from "react-i18next";
import { USER_ID } from "@/utils/api/http";
type FilteredRequirementItemsListPropsType = {
  data: any;
  projectData: any;
  scroll: number;
  isLoading: boolean;
};
const RequirementItems: FC<FilteredRequirementItemsListPropsType> = ({
  data,
  isLoading,
  scroll,
  projectData,
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
          projectId: projectData._id,
        })
      );
      setRequirements(result.payload);
    }
  };
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
  const options: Option[] = [
    {
      value: "ed",
      label: "ED",
      children: [
        {
          value: "checking",
          label: "CHECK",
        },
        {
          value: "alternative",
          label: "ALTERNATIVE",
        },
        {
          value: "canceled",
          label: "CANCELED",
        },
      ],
    },
    {
      value: "logistic",
      label: "LOGISTIC",
      children: [
        {
          value: "checking",
          label: "CHECK",
        },
        {
          value: "purchaising",
          label: "PURCHAICING",
        },
        {
          value: "delivery",
          label: "DELIVERY",
        },
        {
          label: "AGREEMENT ON CUSTOMER",
          value: "agreement",
        },
      ],
    },
  ];
  const cascaderOptions = [
    {
      field: "ED",
      value: "ed",
      language: [
        {
          field: "CHECK",
          value: "checking",
        },
        {
          field: "ALTERNATIVE",
          value: "alternative",
        },
        {
          field: "CANCELED",
          value: "canceled",
        },
      ],
    },

    {
      field: "LOG",
      value: "logistic",
      language: [
        {
          field: "CHECK",
          value: "checking",
        },
        {
          field: "PURCHAICING",
          value: "purchaising",
        },
        {
          field: "DELIVERY",
          value: "delivery",
        },
        {
          field: "AGREEMENT ON CUSTOMER",
          value: "agreement",
        },
      ],
    },
  ];
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
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  useEffect(() => {
    const fetchData = async () => {
      const companyID = localStorage.getItem("companyID");

      if (companyID) {
        const result = await dispatch(
          getFilteredRequirements({
            companyID: companyID,
            projectId: projectData._id,
          })
        );
        if (result.meta.requestStatus === "fulfilled") {
          // console.log(result.payload);

          result.payload.length
            ? setRequirements(result.payload)
            : setRequirements([]);
          setInitialRequirements(result.payload);
        }
      }
    };
    fetchData();
  }, [dispatch]);
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
        "not Ready": { text: "NOT AVAILABLE" },
        Ready: { text: "AVAILABLE" },
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
      title: `${t("Status")}`,
      key: "status",
      width: "10%",
      valueType: "select",
      filterSearch: true,
      filters: true,
      onFilter: true,
      valueEnum: {
        inStockReserve: { text: "RESERVATION", status: "Success" },
        // onPurchasing: { text: 'PURCHASING', status: 'Processing' },
        onCheack: { text: "CHECK", status: "Warning" },
        open: { text: "OPEN", status: "Error" },
        closed: { text: "CLOSED", status: "Default" },
        canceled: { text: "CANCELED", status: "Error" },
        onOrder: { text: "ISSUED", status: "Processing" },
      },

      dataIndex: "status",
    },
    {
      title: `${t("REQUIREMENT NUMBER")}`,
      dataIndex: "partRequestNumber",
      // valueType: 'index',
      ellipsis: true,
      width: "5%",

      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return (
          <a
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              // setOpenRequirementDrawer(true);
              // onReqClick(record);
            }}
          >
            {record.partRequestNumber && record.partRequestNumber}
          </a>
        );
      },
      // sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: "TASK W/O",
      dataIndex: "projectTaskWO",
      key: "projectTaskWO",
      // width: '7%',
      editable: (text, record, index) => {
        return false;
      },
      sorter: (a, b) => (a.projectTaskWO || 0) - (b.projectTaskWO || 0),
      ...useColumnSearchProps({
        dataIndex: "projectTaskWO",
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = materialsRequirements.filter((item: any) =>
              item.projectTaskWO
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
      title: `${t("TASK NBR")}`,
      key: "taskNumber",
      // width: '10%',

      dataIndex: "taskNumber",
      ...useColumnSearchProps({
        dataIndex: "taskNumber",
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = materialsRequirements.filter((item: any) =>
              item.taskNumber
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
      ellipsis: true,
      ...useColumnSearchProps({
        dataIndex: "PN",
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = materialsRequirements.filter((item: any) =>
              item.PN.toString().toLowerCase().includes(value.toLowerCase())
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
      responsive: ["sm"],
      tip: "Text Show",
      ellipsis: true,
    },
    {
      title: `${t("ALTERNATIVE")}`,
      dataIndex: "alternative",
      key: "alternative",
      responsive: ["sm"],
    },
    {
      title: `${t("QUANTITY")}`,
      dataIndex: "amout",
      key: "amout",
      // sorter: (a, b) => a.amout - b.amout,
      responsive: ["sm"],
    },
    {
      title: `${t("UNIT")}`,
      dataIndex: "unit",
      key: "unit",
      responsive: ["sm"],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: "Skill/Wait",
      key: "cascader",
      dataIndex: "cascader",
      tip: "Text Show",
      ellipsis: true,

      fieldProps: {
        options: cascaderOptions,
        fieldNames: {
          children: "language",
          label: "field",
        },
      },
      valueType: "cascader",
      ...useColumnSearchProps({
        dataIndex: "cascader",
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = materialsRequirements.filter((item: any) =>
              item.cascader
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
      width: "12%",
    },
    {
      title: `${t("REWIEW")}`,
      dataIndex: "rewiewStatus",
      key: "rewiewStatus",
      // width: '10%',
      valueType: "select",
      tip: "Text Show",
      ellipsis: true,
      // initialValue: 'all',
      filters: true,
      filterSearch: true,
      onFilter: true,
      valueEnum: {
        // all: { text: 'all', status: 'Default' },
        waiting: { text: "TO WAIT", status: "Warning" },
        inProgress: { text: "IN PROGRESS", status: "Processing" },
        completed: { text: "COMPLETED", status: "Success" },
        canceled: { text: "CANCELED", status: "Error" },
      },
    },
    {
      title: `${t("OPTION")}`,
      valueType: "option",
      key: "option",
      // width: '9%',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record._id);
          }}
        >
          Edit
        </a>,
      ],
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
          projectId: projectData._id,
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
                      projectId: projectData._id,
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
                      projectId: projectData._id,
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
                      projectId: projectData._id,
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
        ]),
        getItem(<div>Update Skill selected Item</div>, "updateSkill", "", [
          getItem(
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Cascader
                options={options}
                onChange={onChange}
                placeholder="Please select"
                showSearch={{ filter }}
                onSearch={(value) => {}}
              />
            </div>
          ),
        ]),
        getItem(
          <div
          // onClick={(e) => {
          //   e.stopPropagation();
          //   // setOpenAddAppForm(true);
          // }}
          >
            Update Skill/Wait Rewiew
          </div>,
          "updateSkill/Wait",
          "",
          [
            getItem(
              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Select
                  options={optionsRewiew}
                  onChange={onChangeRewiew}
                  placeholder="Please select"
                  showSearch
                  onSearch={(value) => {}}
                />
              </div>
            ),
          ]
        ),
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
                    projectID: projectData._id,
                  })
                );
                if (result.meta.requestStatus === "fulfilled") {
                  setSelectedRowKeys([]);
                  const result = await dispatch(
                    getFilteredRequirements({
                      companyID: companyID || "",
                      projectId: projectData._id,
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
                    projectID: projectData._id,
                  })
                );
                if (result.meta.requestStatus === "fulfilled") {
                  setSelectedRowKeys([]);
                  const result = await dispatch(
                    getFilteredRequirements({
                      companyID: companyID || "",
                      projectId: projectData._id,
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
  return (
    <div className="flex my-0 mx-auto flex-col  relative overflow-hidden">
      <EditableTable
        recordCreatorProps={
          position !== "hidden"
            ? {
                position: position as "top",

                record: () => ({
                  id: Date.now(),
                  projectID: projectData._id,
                  companyID: projectData.companyID,
                  createDate: new Date(),
                  createUserID: USER_ID || "",
                  status: "onCheack",
                  cascader: ["ed", "check"],
                  rewiewStatus: "waiting",
                  isNew: true,
                }),
                creatorButtonText: "ADD NEW REQUIREMENT",
              }
            : false
        }
        data={materialsRequirements}
        initialColumns={initialColumns}
        isLoading={isLoading}
        menuItems={items}
        onRowClick={function (record: any): void {
          console.log(record);
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
                projectID: projectData._id,
                quantity: data.amout,
                alternative: data.alternative,
                unit: data.unit,
                description: data.nameOfMaterial,
                partNumber: data.PN,
                isNewAdded: false,
                createDate: new Date(),
                taskNumber: data.taskNumber,
                issuedQuantity: 0,
                // registrationNumber: projectTaskData?.plane.registrationNumber,
              })
            );
            if (result.meta.requestStatus === "fulfilled") {
              const result = await dispatch(
                getFilteredRequirements({
                  companyID: companyID || "",
                  projectId: projectData._id,
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
                projectID: projectData._id,
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
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        onVisibleColumnsChange={handleVisibleColumnsChange}
        externalReload={async function (): Promise<void> {
          try {
            const companyID = localStorage.getItem("companyID");
            const result = await dispatch(
              getFilteredRequirements({
                companyID: companyID || "",
                projectId: projectData._id,
              })
            );
          } catch (error) {
            console.error(error);
          }
        }}
      ></EditableTable>
      {/* )} */}
    </div>
  );
};

export default RequirementItems;
