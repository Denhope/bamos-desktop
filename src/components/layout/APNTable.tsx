import { ProTable } from "@ant-design/pro-components";
import { Empty, Form, Input, Space, Table } from "antd";
import EditableTable from "@/components/shared/Table/EditableTable";
import React, { FC, RefObject, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RouteNames } from "@/router";

interface APNT {
  APNNBR: string;
  descriptions: string;
  route: string;
}
type APNTableProps = {
  data: any[];
  onRowClick: (record: any, rowIndex?: any) => void;
  onRowSingleClick: (record: any, rowIndex?: any) => void;
};
const APNTable: FC<APNTableProps> = ({
  data,
  onRowClick,
  onRowSingleClick,
}) => {
  const { t } = useTranslation();
  const columns = [
    {
      title: `${t(`BAN`)}`,
      dataIndex: "APNNBR",
      key: "APNNBR",

      width: "15%",
      className: "rounded-tl-none",
    },
    {
      title: `${t(`DESCRIPTIONS`)}`,
      dataIndex: "descriptions",
      key: "descriptions",

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
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "ArrowUp") {
        setSelectedRowIndex((oldIndex) => Math.max(0, oldIndex - 1));
      } else if (event.key === "ArrowDown") {
        setSelectedRowIndex((oldIndex) =>
          Math.min(data.length - 1, oldIndex + 1)
        );
      } else if (event.key === "Enter") {
        const selectedRecord = data[selectedRowIndex];
        setSelectedRowKey(selectedRecord?.APNNBR);
        onRowClick(selectedRecord);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [data, selectedRowIndex]);

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
      const filteredData = data.filter(
        (entry: { [s: string]: unknown } | ArrayLike<unknown>) =>
          Object.values(entry).some((v: any) =>
            v.toString().toLowerCase().includes(value.toLowerCase())
          )
      );
      setDataSource(filteredData);
    }
  };
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);
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
        // rowClassName={rowClassName}
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
        onRow={(record: any, rowIndex?: any) => {
          return {
            onClick: async (event) => {
              setSelectedRowIndex(rowIndex);
              setSelectedRowKey(record?.APNNBR);
              onRowSingleClick(record);
            },
            onDoubleClick: async (event) => {
              setSelectedRowIndex(rowIndex);
              setSelectedRowKey(record?.APNNBR);
              onRowClick(record);
            },
          };
        }}
        rowClassName={(record, rowIndex) =>
          rowIndex === selectedRowIndex
            ? "cursor-pointer text-xs text-transform: uppercase bg-blue-100 py-0 my-0 "
            : "cursor-pointer  text-xs text-transform: uppercase  py-0 my-0"
        }
        scroll={
          { y: "calc(49vh)" }
          // !isProjectTAskListFull ? { y: 'calc(55vh)' } : { y: 'calc(25vh)' }
        }
        dataSource={dataSource}
        loading={false}
      ></ProTable>
    </div>
  );
};

export default APNTable;
