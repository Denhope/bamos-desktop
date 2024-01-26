import { Button, Empty, Form, Input, InputRef, Skeleton, Space } from "antd";
import Table, { ColumnType, ColumnsType } from "antd/es/table";
import { FilterConfirmProps } from "antd/es/table/interface";
// import { get } from 'http';
import { IPickSlipResponse } from "@/models/IPickSlip";
import { IRequiredItemMaterialResponse } from "@/models/IStatistics";
import moment from "moment";
import React, { FC, useRef, useState } from "react";
import { saveExls } from "@/services/utilites";
import get from "lodash.get";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import MaterialReportsNavigationPanel from "./MaterialReportsNavigationPanel";
import { useTranslation } from "react-i18next";
type RequiredItemMaterialListPropsType = {
  data: IRequiredItemMaterialResponse[];
  isLoading: boolean;
};

const MaterialRequestList: FC<RequiredItemMaterialListPropsType> = ({
  data,
  isLoading,
}) => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const { t } = useTranslation();
  const getColumnSearchProps = (dataIndex: any): ColumnType<any> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          // placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);
            confirm({ closeDropdown: false });
          }}
          onPressEnter={() => {
            handleSearch(selectedKeys as string[], confirm, dataIndex);
          }}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            поиск
          </Button>
          <Button
            onClick={() => {
              clearFilters && handleReset(clearFilters);
              confirm({ closeDropdown: false });
            }}
            size="small"
            style={{ width: 90 }}
          >
            сброс
          </Button>

          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            закрыть
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      get(record, dataIndex)
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        // text
        text
      ),
  });
  const initialColumns: ColumnsType<IRequiredItemMaterialResponse> = [
    {
      title: "№ п/п",
      dataIndex: "id",
      key: "id",
      width: "4%",

      render: (item, record, index) => <>{`${index + 1}`}</>,
    },
    {
      title: `${t("PN")}`,
      dataIndex: "PN",
      key: "PN",
      responsive: ["sm"],
      width: "15%",
      sorter: (a: any, b: any) => a.PN.length - b.PN.length,
      ...getColumnSearchProps("PN"),
    },
    {
      title: "Серийный номер",
      dataIndex: "serialNumber",
      key: "serialNumber",
      responsive: ["sm"],
      width: "12%",
      // sorter: (a: any, b: any) => a.PN.length - b.PN.length,
    },
    {
      title: "Описание",
      dataIndex: "description",
      key: "projectWO",
      responsive: ["sm"],
      ...getColumnSearchProps("description"),
    },
    {
      title: "Номер карты",
      dataIndex: "taskWO",
      key: "taskWO",
      responsive: ["sm"],
      width: "8%",
      ...getColumnSearchProps("taskWO"),
    },
    {
      title: "Номер работы",
      dataIndex: "taskNumber",
      key: "taskNumber",
      responsive: ["sm"],
      width: "12%",
      ...getColumnSearchProps("taskNumber"),
    },

    {
      title: "Кол-во",
      dataIndex: "quantity",
      key: "quantity",
      responsive: ["sm"],
      width: "4%",
    },
    {
      title: "Ед.изм",
      dataIndex: "unit",
      key: "unit",
      responsive: ["sm"],
      width: "4%",
    },
    {
      title: `${t("W/O")}`,
      dataIndex: "projectWO",
      key: "projectWO",
      responsive: ["sm"],
      width: "7%",
    },

    {
      title: "Номер ВС",
      dataIndex: "registrationNumber",
      key: "registrationNumber",
      responsive: ["sm"],
      width: "8%",
    },
  ];
  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: any
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };
  const searchInput = useRef<InputRef>(null);

  const dataEmpty: readonly IRequiredItemMaterialResponse[] | undefined = [];
  const [columns, setColumns] = useState(initialColumns);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const toggleColumn = (columnKey: any) => {
    setColumns((prevColumns: any) =>
      prevColumns.some((column: any) => column.key === columnKey)
        ? prevColumns.filter((column: any) => column.key !== columnKey)
        : [
            ...prevColumns,
            initialColumns.find((column) => column.key === columnKey),
          ]
    );
  };

  const onSelectChange = (selectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <div className=" ">
      <MaterialReportsNavigationPanel
        data={data}
        toggleColumn={toggleColumn}
        columns={columns}
        initialColumns={initialColumns}
        selectedACID={selectedRowKeys[0]}
      ></MaterialReportsNavigationPanel>

      <Table
        className="py-0 my-0"
        rowClassName="cursor-pointer  text-xs text-transform: uppercase"
        columns={columns}
        dataSource={data.length > 0 ? data : dataEmpty}
        bordered
        pagination={false}
        size="small"
        scroll={{ y: "calc(70vh)" }}
        locale={{
          emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
        }}
      ></Table>
    </div>
  );
};

export default MaterialRequestList;
