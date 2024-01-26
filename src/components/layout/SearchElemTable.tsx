import { ProTable } from "@ant-design/pro-components";
import { Empty, Form, Input, Space, Table } from "antd";
import EditableTable from "@/components/shared/Table/EditableTable";
import React, { FC, RefObject, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RouteNames } from "@/router";

interface APNT {
  APNNBR: string;
  description: string;
  companyID?: string;
  route?: string;
  title1?: string;
  title2?: string;
  title3?: string;
}
type APNTableProps = {
  data: any[];
  onRowClick: (record: any, rowIndex?: any) => void;
  onRowSingleClick: (record: any, rowIndex?: any) => void;
  scroll?: any;
};
const SearchTable: FC<APNTableProps> = ({
  data,
  onRowClick,
  onRowSingleClick,
  scroll,
}) => {
  const { t } = useTranslation();
  const columns = [
    {
      title: `${t(`CODE`)}`,
      dataIndex: "APNNBR",
      key: "APNNBR",

      width: "22%",
      className: "rounded-tl-none",
    },
    {
      title: `${t(`DESCRIPTIONS`)}`,
      dataIndex: "description",
      key: "description",

      // width: '17%',
      className: "rounded-tl-none",
    },
  ];
  const searchInputRef: RefObject<any> = React.createRef();

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

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
    if (record.APNNBR) {
      return record.APNNBR === selectedRowKey
        ? "cursor-pointer text-xs text-transform: uppercase bg-blue-100 py-0 my-0 "
        : "cursor-pointer  text-xs text-transform: uppercase  py-0 my-0";
    } else {
      return "cursor-pointer  text-xs text-transform: uppercase py-0 my-0";
    }
  };
  const [searchText, setSearchText] = useState("");
  const [dataSource, setDataSource] = useState<readonly any[]>(data);
  const handleSearch = (e: { target: { value: any } }) => {
    const value = e.target.value;
    setSearchText(value);

    if (value === "") {
      setDataSource(data);
    } else {
      const filteredData = data.filter((entry: any) =>
        Object.values(entry).some((v: any) =>
          v.toString().toLowerCase().includes(value.toLowerCase())
        )
      );
      setDataSource(filteredData);
    }
  };
  useEffect(() => {
    setDataSource(data);
  }, [data]);
  return (
    <div>
      <Space>
        <div className=" flex w-100% align-middle ml-auto my-0 py-0 ">
          <Form.Item className="py-0 my-0">
            <Input.Search
              ref={searchInputRef}
              autoFocus
              size="middle"
              placeholder="Search"
              value={searchText}
              onChange={handleSearch}
              style={{ width: "100%", marginBottom: "1em" }}
            />
          </Form.Item>
        </div>
      </Space>
      <ProTable
        cardBordered
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
              setSelectedRowKey(record?.APNNBR);
              onRowSingleClick(record);
            },
            onDoubleClick: async (event) => {
              setSelectedRowKey(record?.APNNBR);
              onRowClick(record);
            },
          };
        }}
        scroll={scroll ? { y: `calc(${scroll}vh)` } : { y: "calc(49vh)" }}
        dataSource={dataSource}
        loading={false}
      ></ProTable>
    </div>
  );
};

export default SearchTable;
