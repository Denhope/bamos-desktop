import { ProCard, ProColumns } from '@ant-design/pro-components';
import { TimePicker } from 'antd';
import ContextMenuWrapper from '@/components/shared/ContextMenuWrapperProps';
import FilesSelector from '@/components/shared/FilesSelector';
import EditableTable from '@/components/shared/Table/EditableTable';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { handleFileOpen, handleFileSelect } from '@/services/utilites';
import FileModalList from '@/components/shared/FileModalList';

const StockDetails: FC = () => {
  const { t } = useTranslation();
  const {
    isLoading,
    filteredCurrentStockItems,
    filteredStockDetails,
    filteredItemsStockQuantity,
  } = useTypedSelector((state) => state.storesLogistic);
  const [data, setData] = useState<any>([]);
  const handleCopy = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    navigator.clipboard.writeText(value);
  };
  const handleAdd = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    console.log('Добавить:', value);
  };

  const handleAddPick = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    console.log('Добавить Pick:', value);
  };
  useEffect(() => {
    setData(filteredStockDetails);

    // navigate(storedKey);
  }, [filteredStockDetails]);
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('LOCAL_ID')}`,
      dataIndex: 'LOCAL_ID',
      key: 'LOCAL_ID',
      // tip: 'LOCAL_ID',
      ellipsis: true,
      width: '7%',
      formItemProps: {
        name: 'LOCAL_ID',
      },

      // responsive: ['sm'],
    },

    {
      title: `${t('PN')}`,
      dataIndex: 'PART_NUMBER',
      key: 'PART_NUMBER',
      //tip: 'ITEM PART_NUMBER',
      // ellipsis: true,
      width: '12%',
      formItemProps: {
        name: 'PART_NUMBER',
      },
      render: (text: any, record: any) => {
        return (
          <ContextMenuWrapper
            items={[
              {
                label: 'Copy',
                action: handleCopy,
              },
              {
                label: 'Open with',
                action: () => {},
                submenu: [
                  { label: 'PART TRACKING', action: handleAdd },
                  { label: 'PICKSLIP REQUEST', action: handleAddPick },
                ],
              },
            ]}
          >
            <a
              onClick={() => {
                // dispatch(setCurrentProjectTask(record));
                // setOpenRequirementDrawer(true);
                // onReqClick(record);
              }}
            >
              {record.PART_NUMBER}
            </a>
          </ContextMenuWrapper>
        );
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('STORE')}`,
      dataIndex: 'STOCK',
      key: 'STOCK',
      // tip: 'ITEM STORE',
      ellipsis: true,
      width: '4%',
      formItemProps: {
        name: 'STOCK',
      },
      render: (text: any, record: any) => {
        return (
          <div
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              // setOpenRequirementDrawer(true);
              // onReqClick(record);
            }}
          >
            {record.STOCK}
          </div>
        );
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('CONDITION')}`,
      dataIndex: 'CONDITION',
      key: 'CONDITION',
      //tip: 'CONDITION',
      ellipsis: true,
      width: '10%',
      formItemProps: {
        name: 'CONDITION',
      },
      render: (text: any, record: any) => {
        return (
          <div
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              // setOpenRequirementDrawer(true);
              // onReqClick(record);
            }}
          >
            {record.CONDITION}
          </div>
        );
      },

      // responsive: ['sm'],
    },

    {
      title: `${t('LOCATION')}`,
      dataIndex: 'SHELF_NUMBER',
      key: 'SHELF_NUMBER',
      //tip: 'ITEM LOCATION',
      ellipsis: true,
      width: '7%',
      formItemProps: {
        name: 'SHELF_NUMBER',
      },

      // responsive: ['sm'],
    },

    // {
    //   title: `${t('DESCRIPTION')}`,
    //   dataIndex: 'NAME_OF_MATERIAL',
    //   key: 'NAME_OF_MATERIAL',

    //   // responsive: ['sm'],
    //   tip: 'ITEM DESCRIPTION',
    //   ellipsis: true, //
    //   width: '20%',
    // },
    {
      title: `${t('BATCH/SERIAL')}`,
      dataIndex: 'SERIAL_NUMBER',
      key: 'SERIAL_NUMBER',
      render: (text: any, record: any) =>
        record.SERIAL_NUMBER || record.SUPPLIER_BATCH_NUMBER,

      // responsive: ['sm'],
    },
    {
      title: `${t('RESEIVING')}`,
      dataIndex: 'ORDER_NUMBER',
      key: 'ORDER_NUMBER',
      //tip: 'ITEM ORDER_NUMBER',
      ellipsis: true,
      width: '7%',
      formItemProps: {
        name: 'ORDER_NUMBER',
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('EXPIRY DATE')}`,
      dataIndex: 'PRODUCT_EXPIRATION_DATE',
      key: 'PRODUCT_EXPIRATION_DATE',
      //tip: 'ITEM EXPIRY DATE',
      ellipsis: true,
      valueType: 'date',
      width: '9%',
      formItemProps: {
        name: 'PRODUCT_EXPIRATION_DATE',
      },
      sorter: (a, b) => {
        if (a.PRODUCT_EXPIRATION_DATE && b.PRODUCT_EXPIRATION_DATE) {
          const aFinishDate = new Date(a.PRODUCT_EXPIRATION_DATE);
          const bFinishDate = new Date(b.PRODUCT_EXPIRATION_DATE);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
      },
      renderFormItem: () => {
        return <TimePicker />;
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('QTY')}`,
      dataIndex: 'QUANTITY',
      key: 'QUANTITY',
      width: '5%',
      responsive: ['sm'],
      search: false,
      render: (text, record) => {
        let backgroundColor;
        if (
          record?.PRODUCT_EXPIRATION_DATE &&
          new Date(record.PRODUCT_EXPIRATION_DATE) >= new Date()
        ) {
          backgroundColor = '#32CD32'; // Красный фон, если PRODUCT_EXPIRATION_DATE меньше текущей даты
        } // Зеленый фон по умолчанию
        if (record?.SHELF_NUMBER === 'TRANSFER') {
          backgroundColor = '#FFDB58'; // Желтый фон для SHELF_NUMBER 'TRANSFER'
        }
        if (
          record?.PRODUCT_EXPIRATION_DATE &&
          new Date(record.PRODUCT_EXPIRATION_DATE) < new Date()
        ) {
          backgroundColor = '#FF0000'; // Красный фон, если PRODUCT_EXPIRATION_DATE меньше текущей даты
        }
        return <div style={{ backgroundColor }}>{text}</div>;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('UNIT')}`,
      dataIndex: 'UNIT_OF_MEASURE',
      key: 'UNIT_OF_MEASURE',
      responsive: ['sm'],
      width: '4%',
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: 'R/QTY',
      dataIndex: 'reserved',
      key: 'reserved',
      width: '5%',
      responsive: ['sm'],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: 'B/QTY',
      width: '5%',
      dataIndex: 'ONBLOCK_QUANTITY',
      key: 'ONBLOCK_QUANTITY',
      responsive: ['sm'],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: 'OWNER',
      dataIndex: 'Owner Short Name',
      key: 'Owner Short Name',
      width: '6%',
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
    {
      title: `${t('DOC')}`,
      dataIndex: 'DOC',
      key: 'DOC',
      width: '7%',
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      render: (text, record, index) => {
        return record.FILES && record.FILES.length > 0 ? (
          <FileModalList
            files={record?.FILES}
            onFileSelect={function (file: any): void {
              handleFileSelect({
                id: file?.id,
                name: file?.name,
              });
            }}
            onFileOpen={function (file: any): void {
              handleFileOpen(file);
            }}
          />
        ) : (
          <></>
        );
      },
    },
  ];
  return (
    <div className="py-2 flex flex-col w-[99%] justify-between">
      <div>
        {' '}
        <EditableTable
          isNoneRowSelection={true}
          showSearchInput={true}
          data={data}
          initialColumns={initialColumns}
          isLoading={false}
          menuItems={undefined}
          recordCreatorProps={false}
          onRowClick={function (record: any, rowIndex?: any): void {}}
          onSave={function (rowKey: any, data: any, row: any): void {}}
          yScroll={25}
          externalReload={function () {}}
        />
      </div>

      <div className="flex mt-auto ">
        <ProCard title="INACCESSIBLE">
          <ProCard
            size="small"
            type="inner"
            style={{
              backgroundColor: 'red',
              color: 'black',
            }}
            className="flex justify-end items-end font-bold  py-0 my-0"
          >
            0
          </ProCard>
        </ProCard>
        <ProCard title="RESTRICTED">
          <ProCard
            size="small"
            type="inner"
            style={{ backgroundColor: '#FFDB58', color: 'black' }}
            className="flex justify-end items-end font-bold py-0 my-0"
          >
            <div className="py-0 my-0">0</div>
          </ProCard>
        </ProCard>
        <ProCard title="STANDARD">
          <ProCard
            size="small"
            type="inner"
            style={{ backgroundColor: '#32CD32', color: 'black' }}
            className="flex justify-center items-end font-bold py-0 my-0"
          >
            {filteredItemsStockQuantity?.totalQuantity || 0}
          </ProCard>
        </ProCard>
      </div>
    </div>
  );
};

export default StockDetails;
