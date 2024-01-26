import { ProColumns } from "@ant-design/pro-components";
import { DatePicker } from "antd";
import EditableTable from "@/components/shared/Table/EditableTable";
import React, { FC } from "react";
import { useTranslation } from "react-i18next";
type showOrderListType = {
  order?: any;

  scroll: number;
  onSelectedPart?: (record: any, rowIndex: any) => void;
  onSelectedIds?: (record: any) => void;
  selectedOrder?: any;
  parts?: any[];
};
//
const { RangePicker } = DatePicker;

const BookingOrderPartsList: FC<showOrderListType> = ({
  scroll,
  onSelectedIds,
  onSelectedPart,
  order,
  selectedOrder,
  parts,
}) => {
  const { t } = useTranslation();
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t("POSITION")}`,
      dataIndex: "POSITION",
      key: "POSITION",
      // tip: 'LOCAL_ID',
      ellipsis: true,
      width: "10%",
      render: (text, record, index) => index + 1,
    },

    {
      title: `${t("STATE")}`,
      dataIndex: "state",
      key: "state",
      width: "13%",
      valueType: "select",
      // filterSearch: true,
      // filters: true,
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        // Определяем цвет фона в зависимости от условия
        let backgroundColor;
        if (record.state === "RECEIVED") {
          backgroundColor = "#62d156";
        } else if (record.state === "OPEN" || record.state === "open") {
          backgroundColor = "red";
        } else {
          backgroundColor = "#f0be37";
        }
        return (
          <div style={{ backgroundColor }}>{record.state && record.state}</div>
        );
      },
    },
    {
      title: `${t("PN")}`,
      dataIndex: "PN",
      key: "PN",
      ellipsis: true,
      formItemProps: {
        name: "PART_NUMBER",
      },
      editable: (text, record, index) => {
        return false;
      },
      width: "12%",

      // responsive: ['sm'],
    },
    {
      title: `${t("DESCRIPTION")}`,
      dataIndex: "nameOfMaterial",
      key: "nameOfMaterial",
      // responsive: ['sm'],
      tip: "Text Show",
      ellipsis: true, //
      width: "13%",
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: `${t("M.CLASS")}`,
      dataIndex: "group",
      key: "group",
      responsive: ["sm"],
      search: false,
      editable: (text, record, index) => {
        return false;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t("B/SERIAL")}`,
      dataIndex: "SERIAL_NUMBER",
      width: "9%",
      editable: (text, record, index) => {
        return false;
      },
      key: "SERIAL_NUMBER",
      render: (text: any, record: any) =>
        record?.SERIAL_NUMBER || record?.SUPPLIER_BATCH_NUMBER,
      // остальные свойства...
    },
    {
      title: `${t("QTY")}`,
      dataIndex: "quantity",
      key: "quantity",
      responsive: ["sm"],
      search: false,
      editable: (text, record, index) => {
        return false;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t("BACKORDER")}`,
      dataIndex: "backorder",
      key: "backorder",
      responsive: ["sm"],
      search: false,
      editable: (text, record, index) => {
        return false;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t("UNIT")}`,
      dataIndex: "unit",
      key: "unit",
      responsive: ["sm"],
      search: false,
      editable: (text, record, index) => {
        return false;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t("PRICE")}`,
      dataIndex: "PRICE",
      key: "PRICE",
      responsive: ["sm"],
      search: false,
      editable: (text, record, index) => {
        return false;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
  ];
  return (
    <div className="flex w-[100%]  my-0 mx-auto flex-col  relative overflow-hidden">
      <EditableTable
        isNoneRowSelection={true}
        showSearchInput={false}
        data={parts}
        initialColumns={initialColumns}
        // isLoading={isLoading}
        menuItems={undefined}
        recordCreatorProps={false}
        xScroll={650}
        onDoubleRowClick={function (record: any, rowIndex?: any): void {}}
        onRowClick={function (record: any, rowIndex?: any): void {
          onSelectedPart && onSelectedPart(record, rowIndex);
        }}
        onSave={function (rowKey: any, data: any, row: any): void {
          throw new Error("Function not implemented.");
        }}
        yScroll={scroll}
        externalReload={function (): Promise<void> {
          throw new Error("Function not implemented.");
        }}
        isLoading={false}
      />
    </div>
  );
};

export default BookingOrderPartsList;
