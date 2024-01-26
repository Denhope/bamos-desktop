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
export interface VendorSearchFormProps {
  initialParams: any;
  scroll: number;
  onRowClick: (record: any, rowIndex?: any) => void;
  isLoading: boolean;
  onRowSingleClick: (record: any, rowIndex?: any) => void;
}
const VendorSearchForm: FC<VendorSearchFormProps> = ({
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
      title: `${t("CODE")}`,
      dataIndex: "CODE",
      key: "CODE",

      ellipsis: true,
      formItemProps: {
        name: "code",
      },
    },

    {
      title: `${t("NAME")}`,
      dataIndex: "NAME",
      key: "NAME",
      ellipsis: true, //

      formItemProps: {
        name: "name",
      },
    },

    {
      title: `${t("CITY")}`,
      dataIndex: "CITY",
      key: "CITY",

      // responsive: ['sm'],

      ellipsis: true, //
      // width: '20%',
      formItemProps: {
        name: "city",
      },
    },
    {
      title: `${t("COUNTRY")}`,
      dataIndex: "COUNTRY",
      key: "COUNTRY",

      // responsive: ['sm'],

      ellipsis: true, //
      // width: '20%',
      formItemProps: {
        name: "country",
      },
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
                  `/vendors/getFilteredVendors/company/${companyID}`,
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

export default VendorSearchForm;
