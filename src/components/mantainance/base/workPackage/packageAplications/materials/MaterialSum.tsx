import { ProColumns } from "@ant-design/pro-components";
import { MenuProps } from "antd";
import { useColumnSearchProps } from "@/components/shared/Table/columnSearch";
import React, { FC, useEffect, useState } from "react";
import { exportToExcel } from "@/services/utilites";
import { IMatData } from "@/types/TypesData";
import { DownloadOutlined, PrinterOutlined } from "@ant-design/icons";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import { AplicationResponce } from "@/store/reducers/WPGenerationSlise";
import { findMaterialsByTaskNumbers } from "@/utils/api/thunks";
import EditableTable from "@/components/shared/Table/EditableTable";
import { useTranslation } from "react-i18next";

type FilteredTasksListPropsType = {
  data: any;

  scroll: string;
  isLoading: boolean;
};
const MaterialSum: FC<FilteredTasksListPropsType> = ({
  data,
  isLoading,
  scroll,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const { t } = useTranslation();
  const handleVisibleColumnsChange = (newVisibleColumns: string[]) => {
    setVisibleColumns(newVisibleColumns);
  };
  // const [filteredTaskNumberData, setFilteredTaskNumberData] = useState(data);
  const [materials, setMaterials] = useState<any>([]);
  const dispatch = useAppDispatch();
  useEffect(() => {
    const fetchData = async () => {
      const companyID = localStorage.getItem("companyID");

      if (companyID) {
        const result = await dispatch(
          findMaterialsByTaskNumbers({
            taskDTO: data.tasks || data || [],
          })
        );
        if (result.meta.requestStatus === "fulfilled") {
          // console.log(result.payload);

          setMaterials(result.payload.result);
        }
      }
    };
    fetchData();
  }, [dispatch]);
  const initialColumns: ProColumns<IMatData>[] = [
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
      title: `${t("CODE")}`,
      dataIndex: "code",
      key: "code",

      responsive: ["sm"],
    },
    { title: `${t("PN")}`, dataIndex: "PN", key: "PN", responsive: ["sm"] },

    {
      title: `${t("DESCRIPTION")}`,
      dataIndex: "nameOfMaterial",
      tip: "Text Show",
      ellipsis: true,
      key: "nameOfMaterial",
      responsive: ["sm"],
    },
    {
      title: `${t("ALTERNATIVE")}`,
      dataIndex: "alternative",
      key: "alternative",
      responsive: ["sm"],
    },
    {
      title: `${t("QUANTITY")}`,
      dataIndex: "amoutSum",
      key: "amoutSum",

      responsive: ["sm"],
    },
    {
      title: `${t("UNIT")}`,
      dataIndex: "unit",
      key: "unit",
      responsive: ["sm"],
      // sorter: (a, b) => a.unit.length - b.unit.length,
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
                  materials,
                  `Filtred-MaterialsTask-${data.aplicationName}`
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
                materials.length &&
                exportToExcel(
                  true,
                  selectedRowKeys,
                  visibleColumns,
                  materials,
                  `All MaterialsTask-${data.aplicationName}`
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
      {/* {isLoading && (
        <Spin
          style={{ height: '65vh' }}
          className="flex  flex-col items-center justify-center"
          tip="Loading"
          size="large"
        ></Spin>
      )} */}

      {/* {!isLoading && ( */}
      <EditableTable
        recordCreatorProps={false}
        data={materials}
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
      {/* )} */}
    </div>
  );
};

export default MaterialSum;
