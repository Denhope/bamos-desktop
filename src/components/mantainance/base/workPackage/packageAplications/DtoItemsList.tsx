import { ProColumns } from "@ant-design/pro-components";
import React, { FC, useEffect, useState } from "react";
import { ITaskDTO } from "./AddAplicationForm";

import { Empty, MenuProps, Spin, Tag, Tooltip } from "antd";
import {
  DownloadOutlined,
  PlusOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { exportToExcel } from "@/services/utilites";

import DrawerPanel from "@/components/shared/DrawerPanel";
import EditableTable from "@/components/shared/Table/EditableTable";
import { useColumnSearchProps } from "@/components/shared/Table/columnSearch";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import { useTranslation } from "react-i18next";
type DtoItemsListProps = {
  data: ITaskDTO[];
  aplicationName: string;
  isLoading: boolean;
};
const DtoItemsList: FC<DtoItemsListProps> = ({ data, aplicationName }) => {
  const [filteredTaskNumberData, setFilteredTaskNumberData] = useState(data);
  const { t } = useTranslation();
  useEffect(() => {
    setFilteredTaskNumberData(data);
  }, [data.length]);
  const { isLoading } = useTypedSelector((state) => state.planning);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleVisibleColumnsChange = (newVisibleColumns: string[]) => {
    setVisibleColumns(newVisibleColumns);
  };

  const initialColumns: ProColumns<ITaskDTO>[] = [
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
      //

      title: "Task Nbr",
      key: "taskNumber",
      width: "10%",
      ...useColumnSearchProps({
        dataIndex: "Task Nbr",
        onSearch: (value) => {
          // Обработайте поисковый запрос
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filtered = data.filter((item) =>
              Object.values(item).some((val) =>
                val.toString().toLowerCase().includes(value.toLowerCase())
              )
            );
            setFilteredTaskNumberData(filtered);
            // console.log(filtered);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setFilteredTaskNumberData(data);
          }
        },
        data,
      }),
      dataIndex: "taskNumber",
    },

    {
      title: `${t("DESCRIPTIONS")}`,

      key: "taskDescription",
      ellipsis: true,
      ...useColumnSearchProps({
        dataIndex: "Descriptions",
        onSearch: (value) => {
          // Обработайте поисковый запрос
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filtered = data.filter((item) =>
              Object.values(item).some((val) =>
                val.toString().toLowerCase().includes(value.toLowerCase())
              )
            );
            setFilteredTaskNumberData(filtered);
            // console.log(filtered);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setFilteredTaskNumberData(data);
          }
        },
        data,
      }),
      dataIndex: "taskDescription",

      tip: "Text Show",
      width: "30%",

      // responsive: ['lg'],

      // ...useColumnSearchProps('taskDescription'),
    },
    {
      title: "AMM",
      ...useColumnSearchProps({
        dataIndex: "AMM",
        onSearch: (value) => {
          // Обработайте поисковый запрос
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filtered = data.filter((item) =>
              Object.values(item).some((val) =>
                val.toString().toLowerCase().includes(value.toLowerCase())
              )
            );
            setFilteredTaskNumberData(filtered);
            // console.log(filtered);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setFilteredTaskNumberData(data);
          }
        },
        data,
      }),
      dataIndex: "amtoss",
      tip: "Text Show",
      ellipsis: true,
      key: "amtoss",
      // responsive: ['lg'],
      width: "15%",
    },
    {
      title: "WOCustomer",

      dataIndex: "WOCustomer",
      tip: "Text Show",
      // ellipsis: true,
      key: "WOCustomer",
      // responsive: ['lg'],
      width: "12%",
    },
    {
      title: "WOPackageType",

      dataIndex: "WOPackageType",
      tip: "Text Show",
      // ellipsis: true,
      key: "WOPackageType",
      // responsive: ['lg'],
      width: "12%",
    },
    {
      title: "Position",
      ...useColumnSearchProps({
        dataIndex: "Position",
        onSearch: (value) => {
          // Обработайте поисковый запрос
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filtered = data.filter((item) =>
              Object.values(item).some((val) =>
                val.toString().toLowerCase().includes(value.toLowerCase())
              )
            );
            setFilteredTaskNumberData(filtered);
            // console.log(filtered);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setFilteredTaskNumberData(data);
          }
        },
        data,
      }),
      dataIndex: "position",
      tip: "number Item position on A/C",
      // ellipsis: true,
      key: "position",
      // responsive: ['lg'],
      width: "8%",
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
      title: `${t("OPTION")}`,
      valueType: "option",
      key: "option",
      width: "14%",
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
      label: `Info`,
      key: "info",
      icon: null,
      onClick: () => {
        setOpenAPINFOForm(true);
      },
    },
    {
      label: `${t("Add New Item")}`,
      key: "add",
      icon: <PlusOutlined />,
      // onClick: () => {
      //   setOpenAddWOForm(true);
      // },
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
                  data,
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
                data.length &&
                exportToExcel(
                  true,
                  selectedRowKeys,
                  visibleColumns,
                  data,
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
      icon: null,
      children: [
        getItem(
          <div onClick={() => {}}>Delete selected Items</div>,
          "9sshstsssishhxs"
        ),
      ],
    },
  ];

  const [openAPINFOForm, setOpenAPINFOForm] = useState(false);
  return (
    <div className="flex my-0 mx-auto flex-col h-[74vh] relative overflow-hidden">
      {/* {isLoading && (
        <Spin
          style={{ height: '74vh' }}
          className="flex  flex-col items-center justify-center"
          tip="Loading"
          size="large"
        ></Spin>
      )} */}
      {/* {!isLoading && ( */}
      <EditableTable
        recordCreatorProps={false}
        data={filteredTaskNumberData}
        initialColumns={initialColumns}
        isLoading={isLoading}
        menuItems={items}
        onRowClick={function (record: any): void {
          console.log(record);
        }}
        onSave={function (rowKey: any, data: any, row: any): void {
          console.log(data);
        }}
        yScroll={48}
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        onVisibleColumnsChange={handleVisibleColumnsChange}
        externalReload={function (): Promise<void> {
          throw new Error("Function not implemented.");
        }}
      ></EditableTable>
      {/* )} */}

      <DrawerPanel
        title={`INFO:${aplicationName}`}
        size={"small"}
        placement={"top"}
        open={openAPINFOForm}
        onClose={setOpenAPINFOForm}
        getContainer={false}
      >
        <>INFO PANEL</>
      </DrawerPanel>
    </div>
  );
};

export default DtoItemsList;
