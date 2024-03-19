import { ProColumns } from '@ant-design/pro-components';
import EditableSearchTable from '@/components/shared/Table/EditableSearchTable';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
export interface MaterialItemStoreSearchNewProps {
  initialParams: any;
  scroll: number;
  onRowClick: (record: any) => void;
  isLoading: boolean;
}
const MaterialItemStoreSearchNew: FC<MaterialItemStoreSearchNewProps> = ({
  isLoading,
  scroll,
  initialParams,
}) => {
  const { t } = useTranslation();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const initialColumns: ProColumns<any>[] = [
    {
      title: 'ID',
      dataIndex: 'ID',
      // valueType: 'index',
      ellipsis: true,
      tooltip: 'ITEM ID',
      key: 'ID',
      width: '12%',

      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return (
          <a
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              // setOpenRequirementDrawer(true);
              // onReqClick(record);
            }}
          >
            {record.ID}
          </a>
        );
      },
      // sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },

    {
      title: `${t('PN')}`,
      dataIndex: 'PART_NUMBER',
      key: 'PART_NUMBER',
      tooltip: 'ITEM PART_NUMBER',
      ellipsis: true,
      formItemProps: {
        name: 'PART_NUMBER',
      },

      // responsive: ['sm'],
    },

    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'NAME_OF_MATERIAL',
      key: 'NAME_OF_MATERIAL',

      // responsive: ['sm'],
      tooltip: 'ITEM DESCRIPTION',
      ellipsis: true, //
      // width: '20%',
    },
    {
      title: `${t('QUANTITY')}`,
      dataIndex: 'QUANTITY',
      key: 'QUANTITY',
      responsive: ['sm'],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('UNIT')}`,
      dataIndex: 'UNIT_OF_MEASURE',
      key: 'UNIT_OF_MEASURE',
      responsive: ['sm'],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: 'RESERVED',
      dataIndex: 'reserved',
      key: 'reserved',
      responsive: ['sm'],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: 'BLOCKED',
      dataIndex: 'ONBLOCK_QUANTITY',
      key: 'ONBLOCK_QUANTITY',
      responsive: ['sm'],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: 'RACK',
      dataIndex: 'RACK_NUMBER',
      key: 'RACK_NUMBER',
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
    {
      title: 'SHELF',
      dataIndex: 'SHELF_NUMBER',
      key: 'SHELF_NUMBER',
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },

    {
      title: 'OWNER',
      dataIndex: 'OWNER',
      key: 'OWNER',
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
    {
      title: `${t('DOC')}`,
      dataIndex: 'DOC',
      key: 'DOC',
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
  ];
  return (
    <div className="flex my-0 mx-auto  h-[78vh] flex-col relative overflow-hidden">
      <EditableSearchTable
        initialParams={initialParams}
        data={[]}
        initialColumns={initialColumns}
        isLoading={isLoading}
        menuItems={undefined}
        recordCreatorProps={false}
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        onRowClick={function (record: any): void {
          console.log(record);
        }}
        onSave={function (rowKey: any, data: any, row: any): void {
          console.log(rowKey);
        }}
        yScroll={scroll}
        // externalReload={function (): Promise<void> {
        //   throw new Error('Function not implemented.');
        // }}
      />
    </div>
  );
};

export default MaterialItemStoreSearchNew;
