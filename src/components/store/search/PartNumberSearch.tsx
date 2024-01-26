import {
  ActionType,
  EditableProTable,
  ProColumns,
  ProTable,
} from "@ant-design/pro-components";
import { Row, Space } from "antd";
import NavigationPanel from "@/components/shared/NavigationPanel";
import EditableSearchTable from "@/components/shared/Table/EditableSearchTable";
import React, { FC, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import request from "umi-request";
import { API_URL } from "@/utils/api/http";
export interface MaterialItemStoreSearchNewProps {
  initialParams: any;
  scroll: number;
  onRowClick: (record: any, rowIndex?: any) => void;
  isLoading: boolean;
  onRowSingleClick: (record: any, rowIndex?: any) => void;
}
const PartNumberSearch: FC<MaterialItemStoreSearchNewProps> = ({
  isLoading,
  scroll,
  initialParams,
  onRowClick,
  onRowSingleClick,
}) => {
  const { t } = useTranslation();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t("PN")}`,
      dataIndex: "PART_NUMBER",
      key: "PART_NUMBER",
      tip: "ITEM PART_NUMBER",
      ellipsis: true,
      formItemProps: {
        name: "partNumber",
      },

      // responsive: ['sm'],
    },

    {
      title: `${t("DESCRIPTION")}`,
      dataIndex: "DESCRIPTION",
      key: "DESCRIPTION",

      // responsive: ['sm'],
      tip: "ITEM DESCRIPTION",
      ellipsis: true, //
      // width: '20%',
      formItemProps: {
        name: "description",
      },
    },

    {
      title: `${t("A/C TYPE")}`,
      dataIndex: "AC_TYPE",
      key: "AC_TYPE",

      // responsive: ['sm'],
      tip: "AC_TYPE",
      ellipsis: true, //
      // width: '20%',
      formItemProps: {
        name: "acType",
      },
    },
    {
      title: `${t("GROUP")}`,
      dataIndex: "GROUP",
      key: "GROUP",

      // responsive: ['sm'],
      tip: "ITEM GROUP",
      ellipsis: true, //
      // width: '20%',
      formItemProps: {
        name: "group",
      },
    },

    {
      title: `${t("UNIT")}`,
      dataIndex: "UNIT_OF_MEASURE",
      key: "UNIT_OF_MEASURE",
      responsive: ["sm"],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
  ];
  const [dataSource, setDataSource] = useState<readonly any[]>([]);
  const [selectedRowKey, setSelectedRowKey] = useState<string | null | number>(
    null
  );
  const actionRef = useRef<ActionType>();
  const rowClassName = (record: any) => {
    if (record.id) {
      return record.id === selectedRowKey
        ? "cursor-pointer text-sm text-transform: uppercase bg-blue-100 "
        : "cursor-pointer  text-sm text-transform: uppercase ";
    } else if (record._id) {
      return record._id === selectedRowKey
        ? "cursor-pointer text-sm text-transform: uppercase bg-blue-100 "
        : "cursor-pointer  text-sm text-transform: uppercase ";
    } else if (record.actionNumber) {
      return record.actionNumber === selectedRowKey
        ? "cursor-pointer text-sm text-transform: uppercase bg-blue-100 "
        : "cursor-pointer  text-sm text-transform: uppercase ";
    } else {
      return "cursor-pointer  text-sm text-transform: uppercase ";
    }
  };
  const companyID = localStorage.getItem("companyID");
  const [shouldRequest, setShouldRequest] = useState(false);
  return (
    <div className="flex my-0 mx-auto  h-[78vh] flex-col relative overflow-hidden">
      <ProTable
        // form={form}
        tableAlertRender={false}
        // headerTitle="dddd"

        options={{
          density: false,
          search: false,
          fullScreen: true,
          reload: () => actionRef.current?.reload(),
        }}
        onRow={(record: any, rowIndex) => {
          return {
            onClick: async (event) => {
              setSelectedRowKey(record?._id);
              // onSelectRowIndex(rowIndex);
              onRowSingleClick(record, rowIndex);
            },
            onDoubleClick: async (event) => {
              setSelectedRowKey(record?._id);
              onRowClick(record);
            },
          };
        }}
        //value={dataSource}
        //onChange={setDataSource}
        onSubmit={() => setShouldRequest(true)}
        search={{
          labelWidth: "auto",
        }}
        actionRef={actionRef}
        cardBordered
        rowClassName={rowClassName}
        rowSelection={false}
        rowKey={(record) =>
          record?._id ||
          record?.id ||
          record?.actionNumber ||
          record?.requirementID
        }
        size="small"
        columns={initialColumns}
        pagination={{ defaultPageSize: 100 }}
        scroll={{ y: `calc(${scroll}vh)` }}
        // scroll={{ y: `calc(${yScroll}px)` }}

        request={
          shouldRequest
            ? async (params = {}, sort, filter) => {
                // проверяем shouldRequest перед выполнением запроса
                const config = {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                };
                const url = new URL(
                  `/partNumbers/getFilteredPartNumber/company/${companyID}`,
                  API_URL
                );
                const response = await request<any[]>(url.toString(), {
                  params: { ...initialParams, ...params },

                  ...config,
                });

                // Оберните данные в объект с полем `data`
                return {
                  data: response,
                  success: true,
                };
              }
            : undefined
        } // если shouldRequest равно false, не выполняем запрос
        //loading={isLoading}
      ></ProTable>{" "}
    </div>
  );
};

export default PartNumberSearch;
