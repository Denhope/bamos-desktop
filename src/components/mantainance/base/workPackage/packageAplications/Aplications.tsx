import React, { FC, useEffect, useState } from "react";

import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import {
  Button,
  DatePicker,
  Empty,
  Input,
  MenuProps,
  Skeleton,
  Spin,
} from "antd";
import toast, { Toaster } from "react-hot-toast";

import { IAplicationInfo } from "@/types/TypesData";
import {
  createProject,
  fetchAllProjects,
  getFilteredAplications,
  getFilteredProjects,
  updateProjectAplicationByID,
} from "@/utils/api/thunks";
import Table, { ColumnsType } from "antd/es/table";

import {
  AppstoreOutlined,
  FilterOutlined,
  SettingOutlined,
  PlusOutlined,
  PrinterOutlined,
  EditOutlined,
} from "@ant-design/icons";

import DrawerPanel from "@/components/shared/DrawerPanel";
import AddAplicationForm from "./AddAplicationForm";
import NavigationPanel from "@/components/shared/NavigationPanel";
import { exportToExcel } from "@/services/utilites";
import moment from "moment";
import { AplicationResponce } from "@/store/reducers/WPGenerationSlise";
import { useTranslation } from "react-i18next";
import EditableTable from "@/components/shared/Table/EditableTable";
import { ProColumns } from "@ant-design/pro-components";
import { USER_ID } from "@/utils/api/http";
type AplicationsPropsType = {
  data: any[];
  columns?: any;
  height: string;
  scroll: string;
  isLoading: boolean;
  onRowClick: (record: any) => void;
};

const Aplications: FC<AplicationsPropsType> = ({
  data,
  height,
  // isLoading,
  onRowClick,
}) => {
  // const dispatch = useAppDispatch();

  const dispatch = useAppDispatch();
  useEffect(() => {
    const companyID = localStorage.getItem("companyID");

    if (companyID) {
      dispatch(
        getFilteredAplications({
          companyID: companyID,
        })
      );
    }
  }, [dispatch]);
  const { filteredAplications, isLoading } = useTypedSelector(
    (state) => state.planning
  );
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const rowClassName = (record: AplicationResponce) => {
    return record._id === selectedRowKey
      ? "cursor-po text-sm text-transform: uppercase bg-blue-100 "
      : "cursor-pointer  text-sm text-transform: uppercase ";
  };
  const [searchedCompany, setSerchedCompany] = useState("");
  const [searchedType, setSerchedType] = useState("");
  const [searchedNumber, setSerchedNumber] = useState("");
  const [searchedText, setSerchedText] = useState("");
  const { t } = useTranslation();
  const { RangePicker } = DatePicker;
  const initialColumns: ProColumns<any>[] = [
    {
      title: "APLICATION",
      dataIndex: "aplicationName",
      key: "aplicationName",
      responsive: ["sm"],
      // filteredValue: [searchedText],
      render: (text: any, record: any) => (
        <a style={{ cursor: "pointer" }} onClick={() => onRowClick(record)}>
          {record.aplicationName}{" "}
        </a>
      ),
    },
    {
      title: "COMPANY",
      dataIndex: "companyName",
      key: "companyName",
      filteredValue: [searchedCompany],
      responsive: ["sm"],
      className: "rounded-tl-none",
      onFilter: (value, record) => {
        return record.companyName?.includes(value);
      },
    },
    {
      title: `${t("A/C TYPE")}`,
      dataIndex: "planeType",
      key: "planeType",
      filteredValue: [searchedType],
      responsive: ["sm"],
      onFilter: (value, record) => {
        return record.planeType?.includes(value);
      },
    },
    {
      title: "REG. NBR",
      dataIndex: "planeNumber",
      key: "planeNumber",
      filteredValue: [searchedNumber],
      responsive: ["sm"],
      onFilter: (value, record) => {
        return record.planeNumber?.includes(value);
      },
    },
    {
      editable: (text, record, index) => {
        return false;
      },

      title: "DATE",
      dataIndex: "dateOfAplication",
      key: "dateOfAplication",
      // width: '7%',
      responsive: ["lg"],
      valueType: "date",
      sorter: (a, b) => {
        if (a.finishDate && b.finishDate) {
          const aFinishDate = new Date(a.dateOfAplication);
          const bFinishDate = new Date(b.dateOfAplication);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
      },
      renderFormItem: () => {
        return <RangePicker />;
      },
    },

    {
      key: "action",
      title: "ACTION",
      render: (text, record: IAplicationInfo) => {
        return (
          <div className="flex gap-1 flex-wrap">
            <Button
              size="small"
              type="primary"
              onClick={async () => {
                const result = await dispatch(
                  createProject({
                    aplicationId: record._id,
                    companyID: localStorage.getItem("companyID"),
                    projectName: record.aplicationName,
                    ownerId: USER_ID,
                    createDate: new Date(),
                    startDate: null,
                    finishDate: null,
                    optional: {
                      isTasksCreated: false,

                      isStarting: false,
                      isFavorite: false,
                      isDone: false,
                      isActive: false,
                    },
                    isEdited: false,

                    status: "open",
                  })
                );
                if (result.meta.requestStatus === "fulfilled") {
                  await dispatch(
                    updateProjectAplicationByID({
                      aplicationID: record._id,
                      newData: {
                        projectId: result.payload.id,
                        projectWO: result.payload.projectWO,
                      },
                      companyID: record.companyID,
                    })
                  );
                  toast.success("Work package created successfully");
                  const currentCompanyID = localStorage.getItem("companyID");
                  if (currentCompanyID) {
                    dispatch(
                      getFilteredProjects({ companyID: currentCompanyID })
                    );
                  }
                  dispatch(fetchAllProjects());
                  console.log();
                } else {
                  toast.error("Work package not create");
                }
              }}
            >
              create work package
            </Button>
          </div>
        );
      },
    },
  ];

  const [openAddAppForm, setOpenAddAppForm] = useState(false);
  const [openFilterppForm, setOpenFilterAppForm] = useState(false);
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const [columns, setColumns] = useState(initialColumns);

  const [selectedColumns, setSelectedColumns] = useState(
    columns.map((column: any) => column.key)
  );
  const handleMenuClick = (e: { key: React.Key }) => {
    if (selectedColumns.includes(e.key)) {
      setSelectedColumns(selectedColumns.filter((key: any) => key !== e.key));
    } else {
      setSelectedColumns([...selectedColumns, e.key]);
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
      label: "REPORT",
      key: "print",
      icon: <AppstoreOutlined />,
      children: [
        getItem("Print", "sub4.1", <PrinterOutlined />, [
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

        getItem("Export to Exel", "sub5", <PrinterOutlined />, [
          getItem(
            <div
              onClick={() =>
                selectedRowKeys &&
                selectedRowKeys.length > 0 &&
                exportToExcel(
                  false,
                  selectedRowKeys,
                  selectedColumns,
                  filteredAplications,
                  "Selected Aplications"
                )
              }
            >
              <PrinterOutlined /> Selected Items
            </div>,
            "5.1"
          ),
          getItem(
            <div
              onClick={() =>
                filteredAplications.length &&
                exportToExcel(
                  true,
                  selectedRowKeys,
                  selectedColumns,
                  filteredAplications,
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

    {
      label: `${t("Actions")}`,
      key: "actions",
      icon: <SettingOutlined />,
      children: [
        getItem(
          <div onClick={() => setOpenAddAppForm(true)}>
            <PlusOutlined /> {t("ADD New Aplication")},
          </div>,
          "9ssxs"
        ),
      ],
    },
  ];
  const sortOptions = [
    {
      label: "Sort by date create",
      value: "date-asc",
    },
  ];
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleVisibleColumnsChange = (newVisibleColumns: string[]) => {
    setVisibleColumns(newVisibleColumns);
  };
  return (
    <div
      className="flex my-0 mx-auto flex-col h-[81vh]"
      // style={{
      //   width: '95%',
      // }}
    >
      <div className={`${height}`}>
        {/* <div className="h-1/3"> */}{" "}
        <div>
          <div>
            <EditableTable
              data={filteredAplications}
              initialColumns={initialColumns}
              isLoading={isLoading}
              menuItems={items}
              onRowClick={function (record: any): void {
                // console.log(record);
              }}
              onSave={async function (
                rowKey: any,
                data: any,
                row: any
              ): Promise<void> {}}
              yScroll={53}
              onSelectedRowKeysChange={handleSelectedRowKeysChange}
              onVisibleColumnsChange={handleVisibleColumnsChange}
              recordCreatorProps={false}
              externalReload={function (): Promise<void> {
                throw new Error("Function not implemented.");
              }}
            ></EditableTable>
          </div>
        </div>
      </div>
      <DrawerPanel
        title={"ADD NEW APLICATION"}
        size={"medium"}
        placement={"right"}
        open={openAddAppForm}
        onClose={setOpenAddAppForm}
      >
        <AddAplicationForm></AddAplicationForm>
      </DrawerPanel>
      <DrawerPanel
        title={"FILTER APLICATIONS"}
        size={"small"}
        placement={"left"}
        open={openFilterppForm}
        onClose={setOpenFilterAppForm}
      >
        <>FILTERED FORM</>
      </DrawerPanel>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default Aplications;
