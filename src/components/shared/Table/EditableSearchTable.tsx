import {
  ActionType,
  ColumnsState,
  EditableProTable,
  ProColumns,
  ProFormCheckbox,
} from '@ant-design/pro-components';
import { ConfigProvider, Row, Space, MenuProps, Button, Form } from 'antd';

import React, { FC, useEffect, useRef, useState } from 'react';
import NavigationPanel from '../NavigationPanel';
import { $authHost, API_URL } from '../../../utils/api/http';
import request from 'umi-request';
import { useTranslation } from 'react-i18next';
type EditableTablerops = {
  initialParams?: any;
  data: any;
  initialColumns: ProColumns<any>[];
  isLoading: boolean;
  menuItems: MenuProps['items'] | [];
  recordCreatorProps: any;
  onRowClick: (record: any, rowIndex?: any) => void;
  setQyon?: (record: any, rowIndex?: any) => void;
  onSave: (rowKey: any, data: any, row: any) => void;
  yScroll: number;
  onSelectRowIndex?: (rowIndex: number) => void;
  onSelectedRowKeysChange?: (selectedRowKeys: React.Key[]) => void;
  onVisibleColumnsChange?: (visibleColumns: string[]) => void;
  actionRenderDelete?: boolean;
  externalReload?: () => Promise<void>;
  onTableDataChange?: (data: any[]) => void;
  isSelectable?: (record: any) => any;
  toolbarSearchForm?: React.ReactNode; // Добавьте этот пропс для формы поиска
  showDefaultToolbarContent?: boolean; // Добавьте этот пропс для отображения текущего контента тулбара
};

const EditableSearchTable: FC<EditableTablerops> = ({
  setQyon,
  initialParams,
  data,
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
  showDefaultToolbarContent, // Добавьте этот пропс для отображения текущего контента тулбара
  toolbarSearchForm,
}) => {
  const companyID = localStorage.getItem('companyID');
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

  // useEffect(() => {
  //   if (actionRef.current) {
  //     actionRef.current.reload = externalReload;
  //   }
  // }, [externalReload]);

  useEffect(() => {
    onVisibleColumnsChange?.(visibleColumns);
    setDataSource(data);
  }, [data]);
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
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
  const [isAllDate, setIsAllDAte] = useState<any>();
  const rowClassName = (record: any) => {
    if (record.id) {
      return record.id === selectedRowKey
        ? 'cursor-pointer text-sm text-transform: uppercase bg-blue-100  py-0'
        : 'cursor-pointer  text-sm text-transform: uppercase py-0';
    } else if (record._id) {
      return record._id === selectedRowKey
        ? 'cursor-pointer text-sm text-transform: uppercase bg-blue-100 py-0 '
        : 'cursor-pointer  text-sm text-transform: uppercase py-0 ';
    } else if (record.actionNumber) {
      return record.actionNumber === selectedRowKey
        ? 'cursor-pointer text-sm text-transform: uppercase bg-blue-100 py-0 '
        : 'cursor-pointer  text-sm text-transform: uppercase  py-0';
    } else {
      return 'cursor-pointer  text-sm text-transform: uppercase  py-0';
    }
  };
  const [isFullScreen, setIsFullScreen] = useState(false);
  const handleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    return true;
  };
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [yScrolly, setYScroll] = useState(0);
  const { t } = useTranslation();
  useEffect(() => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      setYScroll(containerHeight);
    }
  }, [containerRef.current]);
  // const [params, setParams] = useState(initialParams);
  useEffect(() => {
    if (actionRef && actionRef.current) {
      actionRef.current.reload();
    }
  }, [initialParams]);
  const [form] = Form.useForm();
  const searchValue = form.getFieldValue('PART_NUMBER'); // Замените 'fieldName'

  useEffect(() => {
    form.setFieldsValue({
      // Здесь укажите начальные значения для полей поиска
      PART_NUMBER: 'initialValue',
    });
  }, []);

  const [availQty, setAvailQty] = useState(0);
  return (
    <div className="" ref={containerRef}>
      <EditableProTable
        bordered
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
              setSelectedRowKey(
                record?.id || record?._id || record.actionNumber
              );
              // onSelectRowIndex(rowIndex);
              onRowClick(record, rowIndex);
            },
          };
        }}
        // value={dataSource}
        onChange={setDataSource}
        search={{
          labelWidth: 'auto',
        }}
        actionRef={actionRef}
        cardBordered
        recordCreatorProps={recordCreatorProps}
        rowClassName={rowClassName}
        // rowSelection={rowSelection}
        rowKey={(record) =>
          record?._id ||
          record?.id ||
          record?.actionNumber ||
          record?.requirementID
        }
        size="small"
        columns={initialColumns}
        pagination={{ defaultPageSize: 100 }}
        onColumnsStateChange={handleColumnsStateChange}
        scroll={{ y: `calc(${yScroll}vh)` }}
        // scroll={{ y: `calc(${yScroll}px)` }}
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
        request={
          initialParams
            ? async (params = {}, sort, filter) => {
                const config = {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                  },
                };
                const url = new URL(
                  `/materialStore/getFilteredItems/company/${companyID}`,
                  API_URL
                );
                const response = await request<any[]>(url.toString(), {
                  params: {
                    isAllExpDate: isAllDate,
                    isAlternative: true,
                    ...initialParams,
                    ...params,
                  },

                  ...config,
                });
                let totalQty = response.reduce(
                  (total: any, item: { QUANTITY: any }) =>
                    total + item.QUANTITY,
                  0
                );
                setQyon?.(totalQty);
                setAvailQty(totalQty); // Обновите состояние availQty

                // Оберните данные в объект с полем `data`
                return {
                  data: response,
                  success: true,
                };
              }
            : undefined
        }
        loading={isLoading}
        dataSource={data}
        headerTitle={
          <div className="">
            <Space className="my-0 py-0">
              <ProFormCheckbox.Group
                className="mt-0 py-0 align-middle"
                // initialValue={['true']}
                labelAlign="left"
                name="isAllDAte"
                fieldProps={{
                  onChange: (value) => setIsAllDAte(value),
                }}
                options={[
                  { label: `${t('LOAD ALL EXP. DATE')}`, value: 'true' },
                ].map((option) => ({
                  ...option,
                  // Добавьте эту строку
                }))}
              />
            </Space>
            <Space className="ml-5 mt-0 py-0 align-middle">
              {t('AVAILABLE QTY')}:<a>{availQty}</a>
            </Space>
          </div>
        }
        toolBarRender={() => [
          showDefaultToolbarContent && ( // Если showDefaultToolbarContent равно true, отобразить текущий контент тулбара
            <div
              style={{
                display: '',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Space>
                <Space className="mt-0 py-0 align-middle">
                  {t('Selected items')}: {selectedRowKeys.length}
                </Space>
                <Space className="mt-0 py-0 align-middle">
                  {t('items')}: {data.length}
                </Space>
              </Space>
            </div>
          ),
        ]}
      ></EditableProTable>{' '}
    </div>
  );
};

export default EditableSearchTable;
