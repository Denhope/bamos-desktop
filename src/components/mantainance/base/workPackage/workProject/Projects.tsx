import React, { FC, useEffect, useState } from "react";

import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { DatePicker, MenuProps, Tag, Tooltip } from "antd";

import { getFilteredProjects } from "@/utils/api/thunks";
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

import NavigationPanel from "@/components/shared/NavigationPanel";
import { exportToExcel } from "@/services/utilites";
import moment from "moment";
import { AplicationResponce } from "@/store/reducers/WPGenerationSlise";
import EditableTable from "@/components/shared/Table/EditableTable";
import { ProColumns } from "@ant-design/pro-components";
import { useTranslation } from "react-i18next";
type ProjectsPropsType = {
  data: any[];
  columns?: any;
  height: string;
  scroll: string;
  isLoading: boolean;
  onRowClick: (record: any) => void;
};

const Projects: FC<ProjectsPropsType> = ({
  data,
  height,
  // isLoading,
  onRowClick,
}) => {
  // const dispatch = useAppDispatch();

  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  useEffect(() => {
    const companyID = localStorage.getItem("companyID");

    if (companyID) {
      dispatch(
        getFilteredProjects({
          companyID: companyID,
        })
      );
    }
  }, [dispatch]);
  const { filteredProjects, isLoading } = useTypedSelector(
    (state) => state.planning
  );

  const { RangePicker } = DatePicker;

  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t("WP NAME")}`,
      dataIndex: "aplicationName",
      key: "aplicationName",
      // responsive: ['sm'],
      // filteredValue: [searchedText],
      render: (text: any, record: any) => (
        <a style={{ cursor: "pointer" }} onClick={() => onRowClick(record)}>
          {record.projectName}{" "}
        </a>
      ),
    },
    {
      title: "COMPANY",
      dataIndex: "companyName",
      key: "companyName",

      // responsive: ['sm'],
      className: "rounded-tl-none",
    },
    {
      title: `${t("A/C TYPE")}`,
      dataIndex: "planeType",
      key: "planeType",
    },
    {
      title: "REG. NBR",
      dataIndex: "planeNumber",
      key: "planeNumber",
    },
    {
      title: "CREATE DATE",
      editable: (text, record, index) => {
        return false;
      },

      dataIndex: "createDate",
      key: "createDate",
      // width: '7%',
      responsive: ["lg"],
      valueType: "date",
      sorter: (a, b) => {
        if (a.createDate && b.createDate) {
          const aFinishDate = new Date(a.createDate);
          const bFinishDate = new Date(b.createDate);
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
      title: "START DATE",
      editable: (text, record, index) => {
        return false;
      },

      dataIndex: "startDate",
      key: "startDate",
      // width: '7%',
      responsive: ["lg"],
      valueType: "date",
      sorter: (a, b) => {
        if (a.startDate && b.startDate) {
          const aFinishDate = new Date(a.startDate);
          const bFinishDate = new Date(b.startDate);
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
      title: "FINISH DATE",
      editable: (text, record, index) => {
        return false;
      },

      dataIndex: "finishDate",
      key: "finishDate",
      // width: '7%',
      responsive: ["lg"],
      valueType: "date",
      sorter: (a, b) => {
        if (a.finishDate && b.finishDate) {
          const aFinishDate = new Date(a.finishDate);
          const bFinishDate = new Date(b.finishDate);
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
      title: `${t("NOTE")}`,
      dataIndex: "note",
      key: "note",
      render: (text) => {
        if (typeof text === "string" && text.length > 1) {
          return (
            <Tooltip placement="top" title={text}>
              <Tag color={"red"}>{"note"}</Tag>
            </Tooltip>
          );
        } else {
          return "-";
        }
      },
      width: "6%",
      filters: [{ text: "Note", value: true }],
      onFilter: (value, record) => {
        if (value) {
          return !!record.note;
        } else {
          return true;
        }
      },
    },
    {
      title: `${t("Status")}`,
      dataIndex: "status",

      key: "status",
      width: "9%",
      editable: (text, record, index) => {
        return false;
      },

      filters: true,
      onFilter: true,
      valueType: "select",
      filterSearch: true,
      valueEnum: {
        отложен: { text: t("OPEN"), status: "Default" },
        inProgress: { text: t("IN_PROGRESS"), status: "Processing" },
        closed: { text: t("CLOSED"), status: "Success" },
        canceled: { text: t("CANCELED"), status: "Error" },
      },
    },
    {
      title: `${t("REWIEW")}`,
      dataIndex: "rewiewStatus",
      key: "rewiewStatus",
      width: "10%",
      valueType: "select",
      tip: "Text Show",
      ellipsis: true,
      // initialValue: 'all',
      filters: true,
      filterSearch: true,
      onFilter: true,
      valueEnum: {
        waiting: { text: "TO WAIT", status: "Warning" },
        inProgress: { text: "IN PROGRESS", status: "Processing" },
        completed: { text: "COMPLETED", status: "Success" },
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
                  filteredProjects,
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
                filteredProjects.length &&
                exportToExcel(
                  true,
                  selectedRowKeys,
                  selectedColumns,
                  filteredProjects,
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
            <PlusOutlined /> ADD New Work Pacage
          </div>,
          "9ssxs"
        ),
        // getItem(
        //   <div
        //     onClick={() =>
        //       selectedACID && selectedACID.length && setOpenEdit(true)
        //     }
        //   >
        //     <EditOutlined /> Edit Selected Aplication
        //   </div>,
        //   '9sxs'
        // ),
      ],
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
          <EditableTable
            data={filteredProjects}
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
            yScroll={51}
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
  );
};

export default Projects;
