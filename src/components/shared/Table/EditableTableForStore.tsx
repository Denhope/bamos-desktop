import {
  ActionType,
  ColumnsState,
  EditableProTable,
  ProColumns,
} from "@ant-design/pro-components";
import { ConfigProvider, Row, Space, MenuProps, Input, Form } from "antd";

import ruRU from "antd/lib/locale/ru_RU"; // Для русского

import React, { FC, RefObject, useEffect, useRef, useState } from "react";
import NavigationPanel from "../NavigationPanel";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import { useTranslation } from "react-i18next";

type EditableTablerops = {
  data: any;
  initialColumns: ProColumns<any>[];
  isLoading: boolean;
  menuItems: MenuProps["items"] | [];
  recordCreatorProps: any;
  onRowClick: (record: any, rowIndex?: any) => void;
  onSave: (rowKey: any, data: any, row: any) => void;
  yScroll: number;
  xScroll?: number;
  onSelectRowIndex?: (rowIndex: number) => void;
  onSelectedRowKeysChange?: (selectedRowKeys: React.Key[]) => void;
  onVisibleColumnsChange?: (visibleColumns: string[]) => void;
  actionRenderDelete?: boolean;
  externalReload: () => any;
  onTableDataChange?: (data: any[]) => void;
  isSelectable?: (record: any) => any;
  recordSearchProps?: any;
  showSearchInput?: boolean;
  domDelete?: boolean;
  status?: any;
};
const EditableTableForStore: FC<EditableTablerops> = ({
  data,
  xScroll,
  isLoading,
  initialColumns,
  menuItems,
  onRowClick,
  onSave,
  yScroll,
  onSelectedRowKeysChange,
  onVisibleColumnsChange,
  onSelectRowIndex,
  recordCreatorProps,
  actionRenderDelete,
  externalReload,
  onTableDataChange,
  isSelectable = () => true,
  recordSearchProps,
  showSearchInput = false,
  domDelete = false,
  status,
}) => {
  const searchInputRef: RefObject<any> = React.createRef();

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);
  // useEffect(() => {
  //   if (
  //     status === 'completed' ||
  //     status === 'closed' ||
  //     status === 'canseled'
  //   ) {
  //     setEditableRowKeys([]);
  //   }
  // }, [status]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRowKey, setSelectedRowKey] = useState<string | null | number>(
    null
  );
  const [dataSource, setDataSource] = useState<readonly any[]>(data);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

  const actionRef = useRef<ActionType>();
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    initialColumns.map((column: any) => column.key)
  );

  useEffect(() => {
    if (actionRef.current) {
      actionRef.current.reload = externalReload;
    }
  }, [externalReload]);

  useEffect(() => {
    // setEditableRowKeys(dataSource.map((item) => item.id));
    onVisibleColumnsChange?.(visibleColumns);
    setDataSource(data);
  }, [data]);
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    onSelectedRowKeysChange?.(newSelectedRowKeys);
  };
  const tempRowSelection = { ...selectedRowKeys };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    ...tempRowSelection,
    getCheckboxProps: (record: any) => ({
      disabled: !isSelectable(record), // Отключает чекбокс, если isSelectable возвращает false
    }),
  };
  const handleColumnsStateChange = (
    columnsState: Record<string, ColumnsState>
  ) => {
    const visibleColumns = Object.entries(columnsState)
      .filter(([key, value]) => value.show)
      .map(([key, value]) => key);
    setVisibleColumns(visibleColumns);
    onVisibleColumnsChange?.(visibleColumns);
  };
  const handleMenuClick = (e: { key: React.Key }) => {
    // null;
  };
  useEffect(() => {
    // Создайте новый массив из dataSource перед передачей его в функцию
    onTableDataChange?.([...dataSource]);
  }, [dataSource]);

  const rowClassName = (record: any) => {
    if (record.id) {
      return record.id === selectedRowKey
        ? "cursor-pointer text-transform: uppercase bg-blue-100 py-0 my-0 "
        : "cursor-pointer  text-transform: uppercase  py-0 my-0";
    } else if (record._id) {
      return record._id === selectedRowKey
        ? "cursor-pointer text-transform: uppercase bg-blue-100 py-0 my-0"
        : "cursor-pointer  text-transform: uppercase py-0 my-0 ";
    } else if (record.actionNumber) {
      return record.actionNumber === selectedRowKey
        ? "cursor-pointer text-transform: uppercase bg-blue-100 py-0 my-0"
        : "cursor-pointer  text-transform: uppercase py-0 my-0";
    } else {
      return "cursor-pointer  text-transform: uppercase py-0 my-0";
    }
  };
  const { language } = useTypedSelector((state) => state.userPreferences);
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");

  const handleSearch = (e: { target: { value: any } }) => {
    const value = e.target.value;
    setSearchText(value);
    if (value === "") {
      setDataSource(data);
    } else {
      const filteredData = data.filter(
        (entry: { [s: string]: unknown } | ArrayLike<unknown>) =>
          Object.values(entry).some(
            (v: any) =>
              v !== null &&
              v.toString().toLowerCase().includes(value.toLowerCase())
          )
      );
      setDataSource(filteredData);
    }
  };

  return (
    <div className="">
      <EditableProTable
        bordered
        tableAlertRender={false}
        options={{
          density: false,
          search: false,
          fullScreen: false,
          reload: () => actionRef.current?.reload(),
        }}
        onRow={(record: any, rowIndex) => {
          return {
            onClick: async (event) => {
              setSelectedRowKey(
                record?.id || record?._id || record.actionNumber
              );
              // onSelectRowIndex(rowIndex);
              onRowClick(record, rowIndex);
            },
          };
        }}
        value={dataSource}
        onChange={setDataSource}
        search={false}
        actionRef={actionRef}
        cardBordered
        recordCreatorProps={recordCreatorProps}
        rowClassName={rowClassName}
        // rowSelection={rowSelection}
        rowKey={(record) =>
          record?.id ||
          record?._id ||
          record?.actionNumber ||
          record?.requirementID
        }
        size="small"
        columns={initialColumns}
        pagination={{ defaultPageSize: 100 }}
        onColumnsStateChange={handleColumnsStateChange}
        scroll={{ x: xScroll, y: `calc(${yScroll}vh)` }}
        editable={{
          actionRender: (row, config, dom) => {
            return [dom.save, dom.cancel, actionRenderDelete && dom.delete];
          },
          type: "multiple",
          editableKeys,

          onSave: async (rowKey, data, row) => {
            onSave(rowKey, data, row);
          },
          onChange: setEditableRowKeys,
        }}
        request={async () => ({
          data: data,
          // total: 3,
          // success: true,
        })}
        loading={isLoading}
        dataSource={data}
        toolBarRender={() => [
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Space>
              <Space>
                {showSearchInput && (
                  <Input.Search
                    ref={searchInputRef}
                    size="middle"
                    placeholder="Search"
                    value={searchText}
                    onChange={handleSearch}
                  />
                )}
              </Space>

              <Space>
                {t("Selected items")}: {selectedRowKeys?.length}
              </Space>
              <Space>
                {t("items")}: {data?.length}
              </Space>
            </Space>
          </div>,
        ]}
      ></EditableProTable>{" "}
    </div>
  );
};

export default EditableTableForStore;
