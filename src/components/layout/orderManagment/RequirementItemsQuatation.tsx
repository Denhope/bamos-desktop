import { ProColumns, ProTable } from "@ant-design/pro-components";
import EditableTable from "@/components/shared/Table/EditableTable";
import React, { FC, useState } from "react";
import { useTranslation } from "react-i18next";

type FilteredRequirementItemsQuatationPropsType = {
  data: any;
  scroll: number;
  scrollX?: number;
  onReqClick: (record: any) => void;
  onDoubleRowClick?: (record: any) => void;
};
const RequirementItemsQuatation: FC<
  FilteredRequirementItemsQuatationPropsType
> = ({ scroll, data, scrollX }) => {
  const { t } = useTranslation();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [allRowKeys, setAllRowKeys] = useState<React.Key[]>([]);

  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleVisibleColumnsChange = (newVisibleColumns: string[]) => {
    setVisibleColumns(newVisibleColumns);
  };
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t("PART REQUEST No")}`,
      dataIndex: "partRequestNumber",
      // valueType: 'index',
      ellipsis: true,

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
            {record?.partRequestNumber && record?.partRequestNumber}
          </a>
        );
      },
      // sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: `${t("Status")}`,
      key: "status",

      valueType: "select",
      filterSearch: true,
      filters: true,
      editable: (text, record, index) => {
        return false;
      },
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
      title: `${t("PROJECT")}`,
      dataIndex: "projectWO",
      key: "projectWO",

      // responsive: ['sm'],
    },
    {
      title: `${t("PART No")}`,
      dataIndex: "PN",
      key: "PN",

      ellipsis: true,

      // responsive: ['sm'],
    },
    {
      title: `${t("DESCRIPTION")}`,
      dataIndex: "nameOfMaterial",
      key: "nameOfMaterial",
      // responsive: ['sm'],

      ellipsis: true, //
    },
    {
      title: `${t("QUANTITY")}`,
      dataIndex: "requestQuantity",

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
            {record.amout - record.issuedQuantity - record.availableQTY < 0
              ? 0
              : record.amout - record.issuedQuantity - record.availableQTY}
          </div>
        );
      },
    },
  ];
  const [selectedRowKey, setSelectedRowKey] = useState<string | null | number>(
    null
  );
  const rowClassName = (record: any) => {
    if (record?._id) {
      return record?._id === selectedRowKey
        ? "cursor-pointer text-xs text-transform: uppercase bg-blue-100 py-0 my-0 "
        : "cursor-pointer  text-xs text-transform: uppercase  py-0 my-0";
    } else {
      return "cursor-pointer  text-xs text-transform: uppercase py-0 my-0";
    }
  };

  return (
    <div>
      <ProTable
        className="m-0 p-0"
        rowClassName={rowClassName}
        columns={initialColumns}
        size="small"
        bordered
        search={false}
        options={{
          density: false,
          search: false,
          fullScreen: false,
          reload: false,
          setting: false,
        }}
        onRow={(record: any, rowIndex) => {
          return {
            onClick: async (event) => {
              setSelectedRowKey(record?._id);
            },
            // onDoubleClick: async (event) => {
            //   setSelectedRowKey(record?._id);
            //   onRowClick(record);
            // },
          };
        }}
        scroll={{ y: `calc(${scroll}vh)` }}
        dataSource={data}
      ></ProTable>
    </div>
  );
};

export default RequirementItemsQuatation;
