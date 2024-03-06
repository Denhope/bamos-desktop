import { ProColumns } from '@ant-design/pro-components';
import EditableTable from '@/components/shared/Table/EditableTable';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { v4 as originalUuidv4 } from 'uuid'; // Импортируйте библиотеку uuid
type PartListType = {
  scroll: number;
  addedParts?: any[];
  onAddedData?: (record: any, rowIndex?: any) => void;
};
const PartList: FC<PartListType> = ({ scroll, addedParts, onAddedData }) => {
  const [data, setData] = useState<any | null>([]);
  const uuidv4: () => string = originalUuidv4;
  useEffect(() => {
    if (onAddedData) {
      const filteredData = data.map(function (item: any) {
        return {
          PN: item.PN,
          unit: item.unit,
          nameOfMaterial: item.nameOfMaterial,
          type: item.type,
          _id: item._id,
          quantity: item.requestQuantity,
          partRequestNumber: item.partRequestNumber,
          group: item.group,
          state: 'OPEN',
          price: '100500',
          backorder: item.requestQuantity,
          serialNumber: '',
          owner: item.ownerShortName,
          id: uuidv4(),
        };
      });
      onAddedData(filteredData);
    }
  }, [data, onAddedData]);
  const { t } = useTranslation();
  const handleSave = (rowKey: any, data: any, row: any) => {
    setData((prevData: any) => [...prevData, data]);
  };

  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('REQUIREMENT NUMBER')}`,
      dataIndex: 'partRequestNumber',
      // valueType: 'index',
      ellipsis: true,

      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return (
          <a
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              // setOpenRequirementDrawer(true);
            }}
          >
            {record.partRequestNumber && record.partRequestNumber}
          </a>
        );
      },
      // sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: `${t('PART No')}`,
      dataIndex: 'PN',
      key: 'PN',
      ellipsis: true,
      formItemProps: {
        name: 'PN',
      },
      editable: (text, record, index) => {
        return false;
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'nameOfMaterial',
      key: 'nameOfMaterial',
      // responsive: ['sm'],
      tip: 'Text Show',
      ellipsis: true, //

      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: `${t('M.CLASS')}`,
      dataIndex: 'type',
      key: 'type',
      responsive: ['sm'],
      search: false,
      editable: (text, record, index) => {
        return false;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: `${t('QTY')}`,
      dataIndex: 'requestQuantity',
      key: 'requestQuantity',
      responsive: ['sm'],
      search: false,
      width: '10%',
      editable: (text, record, index) => {
        return true;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: `${t('UNIT')}`,
      dataIndex: 'unit',
      key: 'unit',
      responsive: ['sm'],
      search: false,
      editable: (text, record, index) => {
        return false;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('OWNER')}`,
      dataIndex: 'owner',
      key: 'owner',
      responsive: ['sm'],
      search: false,
      editable: (text, record, index) => {
        return true;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('OPTION')}`,
      valueType: 'option',
      key: 'option',
      // width: '9%',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record._id);
          }}
        >
          Edit
        </a>,
      ],
    },
  ];
  useEffect(() => {
    if (addedParts) {
      setData((prevData: any) => [...prevData, addedParts]);
    }
  }, [addedParts]);
  return (
    <div className="flex w-[100%]  my-0 mx-auto flex-col  h-[40vh] relative overflow-hidden">
      <EditableTable
        showSearchInput={false}
        actionRenderDelete
        data={data}
        initialColumns={initialColumns}
        // isLoading={isLoading}
        menuItems={undefined}
        recordCreatorProps={false}
        onDoubleRowClick={function (record: any, rowIndex?: any): void {}}
        onRowClick={function (record: any, rowIndex?: any): void {}}
        onSave={handleSave}
        yScroll={scroll}
        externalReload={function (): Promise<void> {
          throw new Error('Function not implemented.');
        }}
        isLoading={false}
      />
    </div>
  );
};

export default PartList;
