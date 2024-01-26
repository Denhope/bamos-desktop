import { ProColumns, ProTable } from "@ant-design/pro-components";
import { DatePicker, Empty, Table, TimePicker } from "antd";
import moment from "moment";
import React, { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { RouteNames } from "@/router";

export interface Aternative {
  alternative: string;
  alternativeDescriptions: string;
}
type APNTableProps = {
  data: Aternative[];
  onRowClick?: (record: any, rowIndex?: any) => void;
  onRowSingleClick: (record: any, rowIndex?: any) => void;
  scrolly: number;
};
const AlternativeTable: FC<APNTableProps> = ({
  data,
  onRowClick,
  onRowSingleClick,
  scrolly,
}) => {
  const { t } = useTranslation();
  const columns: ProColumns<any>[] = [
    {
      title: `${t("ALTERNATE-PART")}`,
      dataIndex: "ALTERNATIVE",
      key: "ALTERNATIVE",

      // width: '9%',
      className: "rounded-tl-none",
    },
    {
      title: `${t("DESCRIPTION")}`,
      dataIndex: "ALTERNATIVE_DESCRIPTION",
      key: "ALTERNATIVE_DESCRIPTION",

      // width: '25%',
      className: "rounded-tl-none",
    },
    {
      title: `${t("APPROVED BY")}`,
      dataIndex: "createUserSing",
      key: "createUserSing",

      // width: '25%',
      className: "rounded-tl-none",
      render: (text: any, record: any) => {
        return <>{record?.AUTORY || record?.createUserSing}</>;
      },
    },
    {
      title: `${t("APPROVED DATE")}`,
      dataIndex: "ALTERNATIVE_ADD_DATE",
      key: "ALTERNATIVE_ADD_DATE",
      valueType: "date",
      // width: '25%',
      className: "rounded-tl-none",
      render: (text: any, record: any) => {
        const date = record?.DATE_ENTERED || record?.createDate;
        const formattedDate = moment(date).format("DD-MM-YYYY");
        return <>{formattedDate}</>;
      },

      renderFormItem: () => {
        return <DatePicker />;
      },
    },
  ];
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
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
        columns={columns}
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
              onRowSingleClick(record);
            },
            // onDoubleClick: async (event) => {
            //   setSelectedRowKey(record?._id);
            //   onRowClick(record);
            // },
          };
        }}
        scroll={{ y: `calc(${scrolly}vh)`, x: "calc(59vh)" }}
        dataSource={data}
        loading={false}
      ></ProTable>
    </div>
  );
};

export default AlternativeTable;
