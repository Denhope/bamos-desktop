import ContextMenuWrapper from '@/components/shared/ContextMenuWrapperProps';
import FileModalList from '@/components/shared/FileModalList';
import EditableTable from '@/components/shared/Table/EditableTable';
import { handleFileSelect, handleFileOpen } from '@/services/utilites';
import { ProColumns } from '@ant-design/pro-components';
import { TimePicker } from 'antd';

import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
type PartListTypes = {
  parts: any;
};
const PartsList: FC<PartListTypes> = ({ parts }) => {
  const { t } = useTranslation();
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
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('LOCAL_ID')}`,
      dataIndex: 'LOCAL_ID',
      key: 'LOCAL_ID',
      // tooltip: 'LOCAL_ID',
      ellipsis: true,
      // width: '7%',
      formItemProps: {
        name: 'LOCAL_ID',
      },
      sorter: (a: any, b: any) => a.LOCAL_ID - b.LOCAL_ID, //

      responsive: ['xl'],
    },

    {
      title: `${t('PN')}`,
      dataIndex: 'PART_NUMBER',
      key: 'PART_NUMBER',
      //tooltip: 'ITEM PART_NUMBER',
      // ellipsis: true,
      // width: '12%',
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

      responsive: ['sm'],
    },
    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'NAME_OF_MATERIAL',
      key: 'NAME_OF_MATERIAL',
      // tooltip: 'ITEM STORE',
      ellipsis: true,

      formItemProps: {
        name: 'NAME_OF_MATERIAL',
      },

      // responsive: ['sm'],
    },
    // {
    //   title: `${t('STORE')}`,
    //   dataIndex: 'STOCK',
    //   key: 'STOCK',
    //   // tooltip: 'ITEM STORE',
    //   ellipsis: true,
    //   // width: '4%',
    //   formItemProps: {
    //     name: 'STOCK',
    //   },
    //   render: (text: any, record: any) => {
    //     return (
    //       <div
    //         onClick={() => {
    //           // dispatch(setCurrentProjectTask(record));
    //           // setOpenRequirementDrawer(true);
    //           // onReqClick(record);
    //         }}
    //       >
    //         {record.STOCK}
    //       </div>
    //     );
    //   },

    //   // responsive: ['sm'],
    // },
    {
      title: `${t('CONDITION')}`,
      dataIndex: 'CONDITION',
      key: 'CONDITION',
      //tooltip: 'CONDITION',
      ellipsis: true,
      // width: '10%',
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
            {record?.CONDITION}
          </div>
        );
      },

      // responsive: ['sm'],
    },

    // {
    //   title: `${t('LOCATION')}`,
    //   dataIndex: 'SHELF_NUMBER',
    //   key: 'SHELF_NUMBER',
    //   //tooltip: 'ITEM LOCATION',
    //   ellipsis: true,
    //   width: '7%',
    //   formItemProps: {
    //     name: 'SHELF_NUMBER',
    //   },

    //   responsive: ['sm'],
    // },

    {
      title: `${t('BATCH/SERIAL')}`,
      dataIndex: 'SERIAL_NUMBER',
      key: 'SERIAL_NUMBER',
      render: (text: any, record: any) =>
        record.SERIAL_NUMBER || record.SUPPLIER_BATCH_NUMBER,
      // остальные свойства...
    },
    // {
    //   title: `${t('RESEIVING')}`,
    //   dataIndex: 'ORDER_NUMBER',
    //   key: 'ORDER_NUMBER',
    //   //tooltip: 'ITEM ORDER_NUMBER',
    //   ellipsis: true,
    //   // width: '7%',
    //   formItemProps: {
    //     name: 'ORDER_NUMBER',
    //   },

    //   // responsive: ['sm'],
    // },
    {
      title: `${t('EXPIRY DATE')}`,
      dataIndex: 'PRODUCT_EXPIRATION_DATE',
      key: 'PRODUCT_EXPIRATION_DATE',
      //tooltip: 'ITEM EXPIRY DATE',
      ellipsis: true,
      valueType: 'date',
      // width: '9%',
      responsive: ['sm'],
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
      render(value: any, record: any) {
        // Преобразование даты в более читаемый формат
        const date = new Date(
          record.PRODUCT_EXPIRATION_DATE || record?.nextDueMOS
        );
        const formattedDate =
          (record.PRODUCT_EXPIRATION_DATE || record?.nextDueMOS) &&
          date.toLocaleDateString();
        return formattedDate;
      },
    },
    {
      title: `${t('QTY')}`,
      dataIndex: 'QUANTITY',
      key: 'QUANTITY',
      // width: '5%',
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
      // responsive: ['sm'],
      // width: '5%',
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    // {
    //   title: `${t('OWNER')}`,
    //   dataIndex: 'OWNER_SHORT_NAME',
    //   key: 'OWNER_SHORT_NAME',
    //   // responsive: ['sm'],
    //   width: '6%',
    //   ellipsis: true,
    //   editable: (text, record, index) => {
    //     return false;
    //   },
    //   search: false,
    // },
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
        return record?.FILES && record?.FILES.length > 0 ? (
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
    <div>
      <EditableTable
        isNoneRowSelection={true}
        // showSelectedInput={false}
        data={parts || []}
        initialColumns={initialColumns}
        isLoading={false}
        menuItems={undefined}
        recordCreatorProps={false}
        showSearchInput={true}
        onRowClick={function (record: any, rowIndex?: any): void {
          throw new Error('Function not implemented.');
        }}
        onSave={function (rowKey: any, data: any, row: any): void {
          throw new Error('Function not implemented.');
        }}
        yScroll={25}
        externalReload={function () {
          throw new Error('Function not implemented.');
        }}
      ></EditableTable>
    </div>
  );
};

export default PartsList;
