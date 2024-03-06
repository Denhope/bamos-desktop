import {
  ActionType,
  ColumnsState,
  EditableProTable,
  ProColumns,
} from '@ant-design/pro-components';
import { ConfigProvider, Row, Space, MenuProps, Input, Form } from 'antd';

import ruRU from 'antd/lib/locale/ru_RU'; // Для русского

import React, { FC, RefObject, useEffect, useRef, useState } from 'react';
import NavigationPanel from '../NavigationPanel';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import { useTranslation } from 'react-i18next';

type EditableTablerops = {
  data: any;
  onMultiSelect?: (selectedRows: (string | undefined)[]) => void;
  initialColumns: ProColumns<any>[];
  isLoading: boolean;
  menuItems: MenuProps['items'] | [];
  recordCreatorProps: any;
  onRowClick: (record: any, rowIndex?: any) => void;
  onDoubleRowClick?: (record: any, rowIndex?: any) => void;

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
  isOptionsNone?: boolean;
  isNoneRowSelection?: boolean;
};
const EditableTable: FC<EditableTablerops> = ({
  data,
  xScroll,
  isLoading,
  initialColumns,
  menuItems,
  onRowClick,
  onDoubleRowClick,
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
  onMultiSelect,
  isNoneRowSelection,
  isOptionsNone,
}) => {
  const searchInputRef: RefObject<any> = React.createRef();

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRowKey, setSelectedRowKey] = useState<any[] | any>(null);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedRowKeys([]);
        setSelectedMultiItems([]);
        setSelectedRowKey(null);
        onSelectedRowKeysChange && onSelectedRowKeysChange([]);
        onRowClick([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
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
    onVisibleColumnsChange?.(visibleColumns);
    setDataSource(data);
  }, [data]);
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedMultiItems(
      newSelectedRowKeys.map((key) =>
        data.find(
          (item: { id?: any; _id?: any }) => item.id === key || item._id === key
        )
      )
    );
    onSelectedRowKeysChange?.(newSelectedRowKeys);
    onMultiSelect?.(
      newSelectedRowKeys.map((key) =>
        data.find(
          (item: { id?: any; _id?: any }) => item.id === key || item._id === key
        )
      )
    );
    console.log(
      newSelectedRowKeys.map((key) =>
        data.find(
          (item: { id?: any; _id?: any }) => item.id === key || item._id === key
        )
      )
    );
    setSelectedRowKey(null);
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
    if (selectedMultiItems.includes(record)) {
      return 'cursor-pointer text-transform: uppercase bg-blue-100 py-0 my-0';
    } else if (
      record.id === selectedRowKey ||
      record._id === selectedRowKey ||
      record.actionNumber === selectedRowKey
    ) {
      return 'cursor-pointer text-transform: uppercase bg-blue-100 py-0 my-0';
    } else {
      return 'cursor-pointer  text-transform: uppercase  py-0 my-0';
    }
  };
  const { language } = useTypedSelector((state) => state.userPreferences);
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');

  const handleSearch = (e: { target: { value: any } }) => {
    const value = e.target.value;
    setSearchText(value);
    if (value === '') {
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
  const [selectedMultiItems, setSelectedMultiItems] = useState<
    (string | undefined)[]
  >([]);

  const tableRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={tableRef}>
      {/* <ConfigProvider locale={language === 'ru' ? ruRU : enUS}> */}
      <EditableProTable
        tableAlertRender={false}
        // headerTitle="dddd"

        options={
          isOptionsNone && isOptionsNone
            ? {
                density: false,
                search: false,
                fullScreen: false,
                reload: () => actionRef.current?.reload(),
              }
            : false
        }
        onRow={(record: any, rowIndex) => {
          return {
            onClick: async (event) => {
              if (event.ctrlKey) {
                setSelectedMultiItems(
                  (prevSelectedItems: (string | undefined)[]) => {
                    const newSelectedItems = prevSelectedItems.includes(
                      record.id || record._id
                    )
                      ? prevSelectedItems.filter((id) => id !== record.id)
                      : [...prevSelectedItems, record];
                    // Вызов функции onMultiSelect с новым списком выбранных элементов
                    onMultiSelect?.(newSelectedItems);
                    setSelectedRowKey([
                      record?.id || record?._id || record.actionNumber,
                    ]);

                    onSelectChange(
                      newSelectedItems.map((item) => item.id || item._id)
                    );
                    return newSelectedItems;
                  }
                );
              } else {
                setSelectedRowKey(
                  record?.id || record?._id || record.actionNumber
                );
                onRowClick(record, rowIndex);
                setSelectedMultiItems([]);
              }
            },
            onDoubleClick: async (event) => {
              setSelectedRowKey(
                record?.id || record?._id || record.actionNumber
              );
              onDoubleRowClick && onDoubleRowClick(record);
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
        rowSelection={!isNoneRowSelection ? rowSelection : false}
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
          type: 'multiple',
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
        // locale={{
        //   emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
        // }}
        headerTitle={
          <Row className="flex">
            <div className="w-[45vh]">
              <NavigationPanel
                onMenuClick={handleMenuClick}
                columns={[]}
                selectedColumns={visibleColumns}
                menuItems={menuItems || []}
                selectedRows={selectedRowKeys}
                data={isLoading ? [] : []}
                isSorting={false}
                isView={false}
                sortOptions={[]}
              />
            </div>
          </Row>
        }
        toolBarRender={() => [
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Space>
              <Space>
                {showSearchInput && (
                  // <div className=" align-middle ml-auto my-0 py-0 ">
                  // <Form.Item label="All Columns" className="py-0 my-0">
                  <Input.Search
                    ref={searchInputRef}
                    size="middle"
                    placeholder="Search"
                    value={searchText}
                    onChange={handleSearch}
                    // style={{ width: '100%', marginBottom: '1em' }}
                  />
                  // </Form.Item>
                  // </div>
                )}
              </Space>

              <Space>
                {t('Selected items')}: {selectedRowKeys?.length}
              </Space>
              <Space>
                {t('items')}: {data?.length}
              </Space>
            </Space>
          </div>,
        ]}
      ></EditableProTable>{' '}
    </div>
  );
};

export default EditableTable;
