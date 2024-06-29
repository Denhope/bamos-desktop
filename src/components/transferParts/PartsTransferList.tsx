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
  scrollY: any;
  isLoading: boolean;
  onSelectedIds: (record: any) => void;
  onSelectedParts?: (record: any) => void;
};
const PartsTransferList: FC<PartListTypes> = ({
  parts,
  scrollY,
  isLoading,
  onSelectedIds,
  onSelectedParts,
}) => {
  const { t } = useTranslation();
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    // setSelectedRowKeys(newSelectedRowKeys);
    onSelectedIds && onSelectedIds(newSelectedRowKeys);
  };
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
      width: '7%',
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
      // width: '12%',
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
      width: '8%',
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
    {
      title: `${t('STORE')}`,
      dataIndex: 'SHELF_NUMBER',
      key: 'SHELF_NUMBER',
      //tooltip: 'ITEM LOCATION',
      ellipsis: true,
      width: '7%',
      formItemProps: {
        name: 'SHELF_NUMBER',
      },
      render: (text: any, record: any) => record?.storeID?.storeShortName,
      // остальные свойства...

      responsive: ['sm'],
    },

    {
      title: `${t('LOCATION')}`,
      dataIndex: 'SHELF_NUMBER',
      key: 'SHELF_NUMBER',
      //tooltip: 'ITEM LOCATION',
      ellipsis: true,
      width: '7%',
      formItemProps: {
        name: 'SHELF_NUMBER',
      },
      render: (text: any, record: any) => record?.locationID?.locationName,

      responsive: ['sm'],
    },

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
      width: '9%',
      responsive: ['sm'],

      sorter: (a, b) => {
        if (
          a.PRODUCT_EXPIRATION_DATE ||
          (a?.nextDueMOS && b.PRODUCT_EXPIRATION_DATE) ||
          b?.nextDueMOS
        ) {
          const aFinishDate = new Date(
            a.PRODUCT_EXPIRATION_DATE || a?.nextDueMOS
          );
          const bFinishDate = new Date(
            b.PRODUCT_EXPIRATION_DATE || b?.nextDueMOS
          );
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
      width: '7%',
      responsive: ['sm'],
      search: false,
      render: (text, record) => {
        let backgroundColor;
        if (
          record?.PRODUCT_EXPIRATION_DATE ||
          (record?.nextDueMOS &&
            new Date(record.PRODUCT_EXPIRATION_DATE || record?.nextDueMOS) >=
              new Date())
        ) {
          backgroundColor = '#32CD32'; // Красный фон, если PRODUCT_EXPIRATION_DATE меньше текущей даты
        } // Зеленый фон по умолчанию
        if (record?.SHELF_NUMBER === 'TRANSFER') {
          backgroundColor = '#FFDB58'; // Желтый фон для SHELF_NUMBER 'TRANSFER'
        }
        if (
          record?.PRODUCT_EXPIRATION_DATE ||
          (record?.nextDueMOS &&
            new Date(record.PRODUCT_EXPIRATION_DATE || record?.nextDueMOS) <
              new Date())
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
      width: '5%',
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
      width: '4%',
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
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        isNoneRowSelection={false}
        // showSelectedInput={true}
        data={parts || []}
        initialColumns={initialColumns}
        isLoading={isLoading}
        menuItems={undefined}
        recordCreatorProps={false}
        showSearchInput={true}
        onMultiSelect={(record: any, rowIndex?: any) => {
          const materials = record.map((item: any) => item);
          // console.log(locationNames);
          onSelectedParts && onSelectedParts(materials);
        }}
        onRowClick={function (record: any, rowIndex?: any): void {
          null;
        }}
        onSave={function (rowKey: any, data: any, row: any): void {
          null;
        }}
        yScroll={scrollY}
        externalReload={function () {
          null;
        }}
      ></EditableTable>
    </div>
  );
};

export default PartsTransferList;
