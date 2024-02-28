import { USER_ID } from '@/utils/api/http';
import type { ActionType, ProColumns } from '@ant-design/pro-components';

import { EditableProTable } from '@ant-design/pro-components';
import { Button, Input } from 'antd';
import React, { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';

type EditableTablerops = {
  data: any;
  isLoading: boolean;
  onRowClick: (record: any, rowIndex?: any) => void;
  onDoubleRowClick?: (record: any, rowIndex?: any) => void;
  onSave: (rowKey: any, data: any, row: any) => void;
  yScroll: number;
  xScroll?: number;
  onSelectRowIndex?: (rowIndex: number) => void;
  isNoneRowSelection?: boolean;
};

const PickSlipRequestPartList: FC<EditableTablerops> = ({
  yScroll,
  xScroll,
  onSave,
  data,
}) => {
  const { t } = useTranslation();
  const columns: ProColumns<any>[] = [
    {
      title: `${t('PART NUMBER')}`,
      dataIndex: 'PN',
      key: 'PN',
      tip: ' Click open Store search',
      ellipsis: true,
      width: '15%',
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
      width: '14%',
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
      title: `${t('Type')}`,
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
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          EDIT
        </a>,
        <a
          key="delete"
          onClick={() => {
            setDataSource(dataSource.filter((item) => item?.id !== record?.id));
          }}
        >
          DELETE
        </a>,
      ],
    },
  ];

  const actionRef = useRef<ActionType>();

  const defaultData: DataSourceType[] = new Array(1).fill(1).map((_, index) => {
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
  const [dataSource, setDataSource] = useState<readonly DataSourceType[]>(
    () => data || defaultData
  );

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
    // setDataSource((prevDataSource) =>
    //   prevDataSource.map((item) =>
    //     item.id === rowKey ? { ...item, ...newData } : item
    //   )
    // );
    const index = dataSource.findIndex((item) => item.id === rowKey);
    if (index !== -1) {
      // Создайте новый массив с обновленной записью
      const newDataSource = [...dataSource];
      // Обновите только измененное поле 'amout'
      newDataSource[index] = { ...newDataSource[index], ...newData };
      // Установите новый массив в состояние
      setDataSource(newDataSource);
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
  return (
    <>
      <EditableProTable<any>
        actionRef={actionRef}
        rowKey={(record) => record?.id || record?._id}
        maxLength={5}
        scroll={{ x: xScroll, y: `calc(${yScroll}vh)` }}
        value={dataSource}
        recordCreatorProps={{
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
        }}
        loading={false}
        columns={columns}
        toolBarRender={() => {
          return [
            <Button
              type="primary"
              key="save"
              onClick={() => {
                console.log(dataSource);
              }}
            >
              SAVE
            </Button>,
          ];
        }}
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
    </>
  );
};
export default PickSlipRequestPartList;
