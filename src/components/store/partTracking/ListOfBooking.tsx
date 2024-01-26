import { ProColumns } from "@ant-design/pro-components";
import { TimePicker } from "antd";
import EditableTable from "@/components/shared/Table/EditableTable";
import React, { FC, useState } from "react";
import { useTranslation } from "react-i18next";
type ListOfBookingType = {
  scroll: number;
  data: any[];
  onSingleRowClick?: (record: any, rowIndex?: any) => void;
};
const ListOfBooking: FC<ListOfBookingType> = ({
  data,
  scroll,
  onSingleRowClick,
}) => {
  const { t } = useTranslation();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t("DATE")}`,
      dataIndex: "createDate",

      key: "createDate",
      //tip: 'ITEM EXPIRY DATE',
      ellipsis: true,
      valueType: "date",

      formItemProps: {
        name: "createDate",
      },
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
        return <TimePicker />;
      },

      // responsive: ['sm'],
    },
    {
      title: `${t("BOOKING")}`,
      dataIndex: "voucherModel",
      key: "voucherModel",
      // tip: 'LOCAL_ID',
      ellipsis: true,

      // responsive: ['sm'],
    },
    {
      title: `${t("PART No")}`,
      dataIndex: "partNumber",
      key: "partNumber",
      ellipsis: true,
      //tip: 'ITEM PART_NUMBER',
      // ellipsis: true,

      formItemProps: {
        name: "partNumber",
      },
    },
    {
      title: `${t("B/SERIAL")}`,
      dataIndex: "serialNumber",
      key: "serialNumber",
      ellipsis: true,
      render: (text: any, record: any) =>
        record.serialNumber || record.batchNumber,
    },
    {
      title: `${t("CONDITION")}`,
      dataIndex: "condition",
      key: "condition",
      //tip: 'CONDITION',
      ellipsis: true,

      formItemProps: {
        name: "condition",
      },
      render: (text: any, record: any) => {
        return <div onClick={() => {}}>{record.condition}</div>;
      },

      // responsive: ['sm'],
    },
    {
      title: `${t("A/C")}`,
      dataIndex: "registrationNumber",
      key: "registrationNumber",
      // tip: 'LOCAL_ID',
      ellipsis: true,

      // responsive: ['sm'],
    },
    {
      title: `${t("QTY")}`,
      dataIndex: "quantity",
      key: "quantity",
      width: "5%",
      responsive: ["sm"],
      search: false,

      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t("ORDER No")}`,
      dataIndex: "orderNumber",
      key: "orderNumber",
      // tip: 'ITEM STORE',
      ellipsis: true,
      // width: '8%',
      formItemProps: {
        name: "orderNumber",
      },

      // responsive: ['sm'],
    },
    {
      title: `${t("DESCRIPTION")}`,
      dataIndex: "description",
      key: "description",
      // tip: 'ITEM STORE',
      ellipsis: true,

      formItemProps: {
        name: "description",
      },

      // responsive: ['sm'],
    },
  ];
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  return (
    <div>
      <EditableTable
        data={data}
        isNoneRowSelection
        showSearchInput
        initialColumns={initialColumns}
        isLoading={false}
        menuItems={undefined}
        recordCreatorProps={false}
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        // onSelectedRowKeysChange={handleSelectedRowKeysChange}
        onRowClick={function (record: any, rowIndex?: any): void {
          onSingleRowClick &&
            onSingleRowClick((prevSelectedItems: (string | undefined)[]) =>
              prevSelectedItems && prevSelectedItems.includes(record._id)
                ? []
                : [record]
            );
        }}
        onSave={function (rowKey: any, data: any, row: any): void {}}
        yScroll={scroll}
        externalReload={function () {
          throw new Error("Function not implemented.");
        }}
      ></EditableTable>
    </div>
  );
};

export default ListOfBooking;
