import { ProColumns } from '@ant-design/pro-components';
import React, { FC, useState } from 'react';
import { ITaskDTO } from '../AddAplicationForm';

import { Empty, MenuProps, Spin, Tag, Tooltip } from 'antd';
import {
  DownloadOutlined,
  PlusOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { exportToExcel } from '@/services/utilites';

import DrawerPanel from '@/components/shared/DrawerPanel';
import EditableTable from '@/components/shared/Table/EditableTable';
import {} from '@/components/shared/Table/columnSearch';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import { useTranslation } from 'react-i18next';

type DtoItemsListProps = {
  data: ITaskDTO[] | [];
  aplicationName: string;
  isLoading: boolean;
};
const UnFoundedItems: FC<DtoItemsListProps> = ({ data, aplicationName }) => {
  const { isLoading } = useTypedSelector((state) => state.planning);
  const [filteredTaskNumberData, setFilteredTaskNumberData] = useState(data);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const { t } = useTranslation();
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleVisibleColumnsChange = (newVisibleColumns: string[]) => {
    setVisibleColumns(newVisibleColumns);
  };

  const initialColumns: ProColumns<ITaskDTO>[] = [
    {
      title: 'Index',
      dataIndex: 'id',
      valueType: 'index',
      width: '5%',

      editable: (text, record, index) => {
        return false;
      },
      // sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      //

      title: 'Task Nbr',
      key: 'taskNumber',
      tooltip: 'Text Show',
      ellipsis: true,
      width: '10%',

      dataIndex: 'taskNumber',
    },

    {
      title: `${t('DESCRIPTIONS')}`,
      dataIndex: 'taskDescription',
      key: 'taskDescription',
      ellipsis: true,

      tooltip: 'Text Show',
      width: '30%',

      // responsive: ['lg'],

      // ...useColumnSearchProps('taskDescription'),
    },
    {
      title: 'AMM',
      dataIndex: 'amtoss',
      tooltip: 'Text Show',
      ellipsis: true,
      key: 'amtoss',
      // responsive: ['lg'],
      width: '15%',
    },
    {
      title: 'WOCustomer',
      dataIndex: 'WOCustomer',
      tooltip: 'Text Show',
      // ellipsis: true,
      key: 'WOCustomer',
      // responsive: ['lg'],
      // width: '12%',
    },
    {
      title: 'WOPackageType',
      dataIndex: 'WOPackageType',
      tooltip: 'Text Show',
      // ellipsis: true,
      key: 'WOPackageType',
      // responsive: ['lg'],
      // width: '12%',
    },
    {
      title: 'Position',
      dataIndex: 'position',
      tooltip: 'number Item position on A/C',
      // ellipsis: true,
      key: 'position',
      // responsive: ['lg'],
      // width: '12%',
    },
    {
      title: `${t('NOTE')}`,
      dataIndex: 'note',
      key: 'note',
      render: (text) => {
        if (typeof text === 'string' && text.length > 1) {
          return (
            <Tooltip placement="top" title={text}>
              <Tag color={'red'}>{'note'}</Tag>
            </Tooltip>
          );
        } else {
          return '-';
        }
      },
      width: '6%',
      filters: [{ text: 'Note', value: true }],
      onFilter: (value, record) => {
        if (value) {
          return !!record.note;
        } else {
          return true;
        }
      },
    },
    {
      title: `${t('OPTION')}`,
      valueType: 'option',
      key: 'option',
      width: '14%',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          Edit
        </a>,
      ],
    },
  ];

  type MenuItem = Required<MenuProps>['items'][number];
  function getItem(
    label: React.ReactNode,
    key?: React.Key | null,
    icon?: React.ReactNode,
    children?: any[],
    type?: 'group'
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      type,
    } as MenuItem;
  }
  const items: MenuProps['items'] = [
    {
      label: `${t('Report')}`,
      key: 'print',
      icon: null,
      children: [
        getItem('Print', 'sub4.1', null, [
          getItem('Selected Items', 'sub4.1.1', <PrinterOutlined />),
          getItem(
            <div
            // onClick={() => setOpenAddAppForm(true)}
            >
              <PrinterOutlined /> All Items
            </div>,
            '9ssxs'
          ),
        ]),

        getItem('Export to Exel', 'sub5', '', [
          getItem(
            <div
              onClick={() =>
                selectedRowKeys &&
                selectedRowKeys.length > 0 &&
                exportToExcel(
                  false,
                  selectedRowKeys,
                  visibleColumns,
                  data,
                  `Filtred-NOTFounded-${aplicationName}`
                )
              }
            >
              <DownloadOutlined /> Selected Items
            </div>,
            '5.1'
          ),
          getItem(
            <div
              onClick={() =>
                data.length &&
                exportToExcel(
                  true,
                  selectedRowKeys,
                  visibleColumns,
                  data,
                  `NOTFounded-${aplicationName}`
                )
              }
            >
              <PrinterOutlined /> All Items
            </div>,
            '5.2'
          ),
        ]),
        // ]),
      ],
    },
  ];

  return (
    <div className="flex my-0 mx-auto flex-col h-[67vh] relative overflow-hidden">
      {isLoading && (
        <Spin
          style={{ height: '65vh' }}
          className="flex  flex-col items-center justify-center"
          tip="Loading"
          size="large"
        ></Spin>
      )}
      {!isLoading && filteredTaskNumberData.length ? (
        <EditableTable
          recordCreatorProps={false}
          data={filteredTaskNumberData}
          initialColumns={initialColumns}
          isLoading={isLoading}
          menuItems={items}
          onRowClick={function (record: any): void {
            console.log(record);
          }}
          onSave={function (rowKey: any, data: any, row: any): void {
            console.log(data);
          }}
          yScroll={42}
          onSelectedRowKeysChange={handleSelectedRowKeysChange}
          onVisibleColumnsChange={handleVisibleColumnsChange}
          externalReload={function (): Promise<void> {
            throw new Error('Function not implemented.');
          }}
        ></EditableTable>
      ) : (
        <>{!isLoading && <Empty></Empty>}</>
      )}
    </div>
  );
};

export default UnFoundedItems;
