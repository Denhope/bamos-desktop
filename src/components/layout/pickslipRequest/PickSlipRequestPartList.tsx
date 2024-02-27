// import EditableTable from '@/components/shared/Table/EditableTable';
// import { USER_ID } from '@/utils/api/http';
// import { EditableProTable, ProColumns } from '@ant-design/pro-components';
// import React, { FC, useCallback, useRef, useState } from 'react';

// type EditableTablerops = {
//   data: any;
//   isLoading: boolean;
//   onRowClick: (record: any, rowIndex?: any) => void;
//   onDoubleRowClick?: (record: any, rowIndex?: any) => void;
//   onSave: (rowKey: any, data: any, row: any) => void;
//   yScroll: number;
//   xScroll?: number;
//   onSelectRowIndex?: (rowIndex: number) => void;
//   isNoneRowSelection?: boolean;
//   initialColumns: ProColumns<any>[];
// };

// const PickSlipRequestPartList: FC<EditableTablerops> = ({
//   yScroll,
//   xScroll,
//   initialColumns,
//   data,
// }) => {
//   const [dataSource, setDataSource] = useState<readonly any[]>([]);
//   const [selectedRowKey, setSelectedRowKey] = useState<any[] | any>(null);
//   const rowClassName = (record: any) => {
//     if (
//       record.id === selectedRowKey ||
//       record._id === selectedRowKey ||
//       record.actionNumber === selectedRowKey
//     ) {
//       return 'cursor-pointer text-transform: uppercase bg-blue-100 py-0 my-0';
//     } else {
//       return 'cursor-pointer  text-transform: uppercase  py-0 my-0';
//     }
//   };

//   return (
//     <div>
//       {/* <EditableProTable
//         columns={initialColumns}
//         scroll={{ x: xScroll, y: `calc(${yScroll}vh)` }}
//         options={false}
//         tableAlertRender={false}
//         onRow={(record: any, rowIndex) => {
//           return {
//             onClick: async (event) => {
//               console.log(record);
//               setSelectedRowKey([record?.id || record?._id]);
//             },
//           };
//         }}
//         rowClassName={rowClassName}
//         recordCreatorProps={{
//           position: 'bottom',
//           record: createNewRecord,
//           creatorButtonText: 'ADD NEW PART',
//         }}
//         editable={{
//           actionRender: (row, config, dom) => {
//             return [dom.save, dom.cancel, dom.delete];
//           },
//           type: 'multiple',
//           onSave: async (rowKey, data, row) => {
//             console.log(data);
//             // onSave(rowKey, data, row);
//           },
//         }}
//         dataSource={dataSource}
//       ></EditableProTable> */}
//       <EditableProTable
//         columns={initialColumns}
//         scroll={{ x: xScroll, y: `calc(${yScroll}vh)` }}
//         options={false}
//         tableAlertRender={false}
//         rowClassName={rowClassName}
//         onRow={(record: any, rowIndex) => {
//           return {
//             onClick: async (event) => {
//               console.log(record);
//               setSelectedRowKey([record?.id || record?._id]);
//             },
//           };
//         }}
//         recordCreatorProps={{
//           position: 'bottom',
//           record: () => {
//             const id = Date.now(); // Generate a unique key using the current timestamp
//             return {
//               key: id, // Use 'key' as the unique key for the record
//               id: id, // You can also include other properties as needed
//               createDate: new Date(),
//               createUserID: USER_ID || '',
//               status: 'open',
//               isNew: true,
//             };
//           },
//           creatorButtonText: 'ADD NEW PART',
//         }}
//         editable={{
//           actionRender: (row, config, dom) => {
//             return [dom.save, dom.cancel, dom.delete];
//           },
//           type: 'multiple',
//           onSave: async (rowKey, data, row) => {
//             console.log(data);

//             // onSave(rowKey, data, row);
//           },
//         }}
//         // dataSource={dataSource}
//         request={async () => ({
//           data: data,
//           total: 3,
//           success: true,
//         })}
//         value={dataSource}
//         onChange={setDataSource}
//       />
//     </div>
//   );
// };

// export default PickSlipRequestPartList;

import DoubleClickPopover from '@/components/shared/form/DoubleClickProper';
import PartNumberSearch from '@/components/store/search/PartNumberSearch';
import { USER_ID } from '@/utils/api/http';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { v4 as originalUuidv4 } from 'uuid';
import {
  EditableProTable,
  ProCard,
  ProFormField,
  ProFormRadio,
} from '@ant-design/pro-components';
import { Input } from 'antd';
import React, { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RecordKey } from '@ant-design/pro-utils/es/useEditableArray';

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};
const uuidv4: () => string = originalUuidv4;
type DataSourceType = {
  id: React.Key;
  title?: string;
  readonly?: string;
  decs?: string;
  state?: string;
  created_at?: number;
  update_at?: number;
  children?: DataSourceType[];
};

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
  const [selectedPN, setSelectedPN] = React.useState<any>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<readonly any[]>([]);
  const [position, setPosition] = useState<'top' | 'bottom' | 'hidden'>(
    'bottom'
  );

  const { t } = useTranslation();
  const columns: ProColumns<any>[] = [
    {
      title: `${t('PART NUMBER')}`,
      dataIndex: 'PN',
      key: 'PN',
      tip: ' Click open Store search',
      ellipsis: true,

      formItemProps: (form, { rowIndex }) => {
        return {
          rules: rowIndex > 1 ? [{ required: true }] : [],
        };
      },

      editable: (text, record, index) => {
        return true;
      },
      width: '15%',
      renderFormItem: (item2, { onChange, record }) => {
        return (
          <DoubleClickPopover
            content={
              <div className="flex my-0 mx-auto  h-[44vh] flex-col relative overflow-hidden">
                <PartNumberSearch
                  initialParams={{ partNumber: '' }}
                  scroll={18}
                  onRowClick={(record1) => {
                    setSelectedPN(record1);
                  }}
                  isLoading={false}
                  onRowSingleClick={(record1) => {
                    setSelectedPN(record1);
                    setDataSource((prevDataSource) =>
                      prevDataSource.map((item) =>
                        item.id === record?.id
                          ? { ...item, PN: record1.PART_NUMBER } // Assuming record1.PART_NUMBER contains the correct part number
                          : item
                      )
                    );
                    console.log(dataSource);
                  }}
                />
              </div>
            }
            overlayStyle={{ width: '70%' }}
          >
            <Input
              value={selectedPN?.PART_NUMBER}
              onChange={(e) => {
                setSelectedPN({
                  ...selectedPN,
                  PART_NUMBER: e.target.value,
                });
                if (onChange) {
                  onChange(e.target.value);
                }
              }}
            />
          </DoubleClickPopover>
        );
      },
    },
    {
      title: `${t('QTY REQ ')}`,
      dataIndex: 'amout',
      key: 'amout',
      width: '7%',
    },
    {
      title: `${t('REQUESTED SERIAL')}`,
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: '10%',
    },
    {
      title: `${t('AVAIL QTY')}`,
      dataIndex: 'availableQTY',
      key: 'availableQTY',
      width: '7%',
      responsive: ['sm'],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'nameOfMaterial',
      key: 'nameOfMaterial',
      // responsive: ['sm'],

      ellipsis: true, //
      width: '14%',
    },
    {
      title: `${t('UNIT')}`,
      dataIndex: 'unit',
      key: 'unit',
      width: '4%',
      responsive: ['sm'],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('GROUP')}`,
      dataIndex: 'group',
      key: 'group',
      // responsive: ['sm'],

      ellipsis: true, //
      width: '6%',
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
            setDataSource(dataSource.filter((item) => item.id !== record.id));
          }}
        >
          DELETE
        </a>,
      ],
    },
  ];
  const handleSave = (rowKey: RecordKey, newData: any, row: any) => {
    // Update the dataSource with the new data
    setDataSource((prevDataSource) =>
      prevDataSource.map((item) =>
        item.id === rowKey ? { ...item, ...newData } : item
      )
    );

    // Call the onSave prop if it exists
    if (onSave) {
      onSave(rowKey, newData, row);
    }
  };

  const actionRef = useRef<ActionType>();
  return (
    <>
      <EditableProTable<any>
        actionRef={actionRef}
        rowKey={(record) => record?.id || record?._id}
        maxLength={5}
        scroll={{ x: xScroll, y: `calc(${yScroll}vh)` }}
        recordCreatorProps={
          position !== 'hidden'
            ? {
                position: position as 'top',
                record: () => {
                  const id = Date.now(); // Generate a unique key using the current timestamp
                  return {
                    key: uuidv4(), // Use 'key' as the unique key for the record
                    id: uuidv4(),
                    createDate: new Date(),
                    createUserID: USER_ID || '',
                    status: 'open',
                    isNew: true,
                  };
                },
                creatorButtonText: 'ADD NEW PART',
              }
            : false
        }
        loading={false}
        columns={columns}
        request={async () => ({
          data: data,
          // total: 3,
          success: true,
        })}
        value={dataSource}
        onChange={setDataSource}
        editable={{
          type: 'multiple',
          editableKeys,
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
