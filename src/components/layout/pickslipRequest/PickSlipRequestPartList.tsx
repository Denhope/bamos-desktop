import { USER_ID } from '@/utils/api/http';
import type { ActionType, ProColumns } from '@ant-design/pro-components';

import { EditableProTable } from '@ant-design/pro-components';
import { Button, Input } from 'antd';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';

type EditableTablerops = {
  data: any;
  isLoading: boolean;
  onRowClick: (record: any, rowIndex?: any) => void;
  onDoubleRowClick?: (record: any, rowIndex?: any) => void;
  onSave: (data: any) => void;
  yScroll: number;
  xScroll?: number;
  onSelectRowIndex?: (rowIndex: number) => void;
  isNoneRowSelection?: boolean;
  setCancel: boolean;
  setCreating: boolean;
};

const PickSlipRequestPartList: FC<EditableTablerops> = ({
  yScroll,
  xScroll,
  onSave,
  data,
  setCancel,
  setCreating,
}) => {
  const { t } = useTranslation();
  const columns: ProColumns<any>[] = [
    {
      title: `${t('PART No')}`,
      dataIndex: 'PN',
      key: 'PN',
      tip: ' Click open Store search',
      ellipsis: true,
      // width: '15%',
      renderFormItem: (item, { onChange, record }) => {
        return (
          <ContextMenuPNSearchSelect
            rules={[{ required: true }]}
            name="PN"
            initialFormPN={record.PN}
            width="lg"
            onSelectedPN={(selectedPN) => {
              setSelectedPN(selectedPN);
              // Обновляем значение PN в dataSource
              handlePNChange(
                record.id,
                selectedPN.PART_NUMBER,
                selectedPN.DESCRIPTION,
                selectedPN.GROUP,
                selectedPN.TYPE,
                selectedPN.UNIT_OF_MEASURE
              );
              // Вызываем onSave для сохранения изменений
              handleSave(
                record.id,
                {
                  PN: selectedPN.PART_NUMBER,
                  description: selectedPN.DESCRIPTION,
                  group: selectedPN.GROUP,
                  type: selectedPN.TYPE,
                  unit: selectedPN.UNIT_OF_MEASURE,
                  amout: record.amout,
                  serialNumber: record?.serialNumber,
                },
                record
              );
            }}
            label={`PN`}
          />
        );
      },
    },
    {
      title: `${t('QTY REQ ')}`,
      dataIndex: 'amout',
      valueType: 'digit',
      key: 'amout',
      width: '7%',
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
      render: (text: any, record: any) => {
        return <a>{isCreating ? record?.amout : record?.required}</a>;
      },
    },
    {
      title: `${t('REQUESTED SERIAL')}`,
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: '10%',
    },
    {
      editable: (text, record, index) => {
        return false;
      },
      title: `${t('AVAIL QTY')}`,
      dataIndex: 'availableQTY',
      key: 'availableQTY',
      width: '7%',
      responsive: ['sm'],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'description',
      key: 'description',
      // responsive: ['sm'],

      ellipsis: true, //
      // width: '14%',
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: `${t('UNIT')}`,
      dataIndex: 'unit',
      key: 'unit',
      width: '4%',
      responsive: ['sm'],
      // sorter: (a, b) => a.unit.length - b.unit.length,
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: `${t('GROUP')}`,
      dataIndex: 'group',
      key: 'group',
      // responsive: ['sm'],
      editable: (text, record, index) => {
        return false;
      },

      ellipsis: true, //
      width: '6%',
    },
    {
      title: `${t('TYPE')}`,
      dataIndex: 'type',
      key: 'type',
      // responsive: ['sm'],

      ellipsis: true, //
      width: '6%',
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: 'OPTION',
      valueType: 'option',
      width: 200,
      render: (text, record, _, action) => [
        isCreating && (
          <a
            key="editable"
            onClick={() => {
              action?.startEditable?.(record.id);
            }}
          >
            EDIT
          </a>
        ),
        isCreating && (
          <a
            key="delete"
            onClick={() => {
              setDataSource(
                dataSource.filter((item) => item?.id !== record?.id)
              );
            }}
          >
            DELETE
          </a>
        ),
      ],
    },
  ];

  const actionRef = useRef<ActionType>();

  const defaultData: DataSourceType[] = new Array(0).fill(1).map((_, index) => {
    return {
      id: (Date.now() + index).toString(),
      createUserID: USER_ID || '',
      status: 'open',
      createDate: new Date(),
      isNew: true,
      issuedQuantity: 0,
    };
  });
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() =>
    defaultData.map((item) => item?.id)
  );

  const [isCreating, setIsCreating] = useState(false);
  const [dataSource, setDataSource] = useState<
    readonly DataSourceType[] | any[]
  >(() => data || defaultData);
  useEffect(() => {
    if (setCancel) {
      setDataSource([]);
      setTimeout(() => {
        setIsCreating(false);
      }, 0);
    }
  }, [setCancel]);

  useEffect(() => {
    if (data) {
      setDataSource(data);
      console.log(data);
    }
  }, [data]);
  useEffect(() => {
    if (setCreating) {
      setIsCreating(true);
      setDataSource([]);
    }
  }, [setCreating]);

  type DataSourceType = {
    id: React.Key;
    PN?: string;
    status: 'open';
    projectID?: string;
    unit?: string;
    projectTaskID?: string;
    description?: string;
    issuedQuantity: number;
    plannedDate?: any;
    registrationNumber?: string;
    taskNumber?: string;
    createDate?: any;
    type?: string;
    group?: string;
    alternative?: any;
    quantity?: number;
    companyID?: string;
    isNew?: boolean;
  };

  const handlePNChange = (
    recordId: any,
    newPN: any,
    description: string,
    group: string,
    type: string,
    unit: string
  ) => {
    setDataSource((prevDataSource) =>
      prevDataSource.map((item: DataSourceType) =>
        item.id === recordId
          ? {
              ...item,
              PN: newPN,
              description: description,
              group: group,
              type: type,
              unit: unit,
            }
          : item
      )
    );
  };

  const handleSave = (rowKey: any, newData: any, row: any) => {
    const index = dataSource.findIndex((item) => item.id === rowKey);
    if (index !== -1) {
      // Создайте новый массив с обновленной записью
      const newDataSource = [...dataSource];
      // Обновите только измененное поле 'amout'
      newDataSource[index] = { ...newDataSource[index], ...newData };
      // Установите новый массив в состояние
      setDataSource(newDataSource);
      onSave(newDataSource);
      console.log(newDataSource);
    }
  };

  const [selectedPN, setSelectedPN] = useState<DataSourceType>();
  const onValuesChange = (
    changedValues: Record<string, any>,
    allValues: Record<string, any>
  ) => {
    setDataSource((prevDataSource) =>
      prevDataSource.map((item: any) => {
        if (changedValues[item?.id]) {
          return {
            ...item,
            ...changedValues[item?.id],
            description: selectedPN?.description,
          };
        }
        return item;
      })
    );
  };
  const [selectedRowKey, setSelectedRowKey] = useState<string | null | number>(
    null
  );
  const rowClassName = (record: any) => {
    if (record?._id) {
      return record?._id === selectedRowKey
        ? 'cursor-pointer text-xs text-transform: uppercase bg-blue-100 py-0 my-0 '
        : 'cursor-pointer  text-xs text-transform: uppercase  py-0 my-0';
    } else {
      return 'cursor-pointer  text-xs text-transform: uppercase py-0 my-0';
    }
  };
  return (
    <div className="">
      <EditableProTable<any>
        rowClassName={rowClassName}
        // request={async () => ({
        //   data: data,
        //   // total: 3,
        //   // success: true,
        // })}
        actionRef={actionRef}
        rowKey={(record) => record?.id || record?._id}
        maxLength={6}
        scroll={{ x: xScroll, y: `calc(${yScroll}vh)` }}
        value={dataSource}
        recordCreatorProps={
          isCreating && {
            creatorButtonText: 'ADD NEW PART',
            newRecordType: 'dataSource',
            record: (record: any) => ({
              id: Date.now().toString(),
              createUserID: USER_ID || '',
              status: 'open',
              createDate: new Date(),
              isNew: true,
              issuedQuantity: 0,
            }),
          }
        }
        loading={false}
        columns={columns}
        // toolBarRender={() => {
        //   return [
        //     <Button
        //       type="primary"
        //       key="save"
        //       onClick={() => {
        //         console.log(dataSource);
        //       }}
        //     >
        //       SAVE
        //     </Button>,
        //   ];
        // }}
        onChange={setDataSource}
        editable={{
          type: 'multiple',
          editableKeys,
          actionRender: (row, config, dom) => [dom.save, dom.cancel],

          onSave: async (rowKey, data, row) => {
            handleSave(rowKey, data, row);
          },

          onChange: setEditableRowKeys,
        }}
      />
    </div>
  );
};
export default PickSlipRequestPartList;
