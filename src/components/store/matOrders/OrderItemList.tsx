import { ProColumns } from '@ant-design/pro-components';
import { TimePicker } from 'antd';
import ContextMenuWrapper from '@/components/shared/ContextMenuWrapperProps';
import EditableTable from '@/components/shared/Table/EditableTable';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FileModalList from '@/components/shared/FileModalList';
import { handleFileOpen, handleFileSelect } from '@/services/utilites';
type ReceivingItemList = {
  scroll: number;
  data: any[];
  onSelectedParts?: (record: any) => void;
  onSelectedIds?: (record: any) => void;
  onDoubleClick?: (record: any, rowIndex?: any) => void;
  onSingleRowClick?: (record: any, rowIndex?: any) => void;
};
const OrderItemList: FC<ReceivingItemList> = ({
  data,
  scroll,
  onSelectedParts,
  onSelectedIds,
  onDoubleClick,
  onSingleRowClick,
}) => {
  const [selectedMaterials, setSelectedMaterials] = useState<any>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    onSelectedIds && onSelectedIds(newSelectedRowKeys);
  };
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
    // {
    //   title: `${t('RECEIVING ITEM No')}`,
    //   dataIndex: 'RECEIVING_ITEM_NUMBER',
    //   key: 'RECEIVING_ITEM_NUMBER',
    //   //tip: 'ITEM PART_NUMBER',
    //   ellipsis: true,
    //   width: '7%',
    //   formItemProps: {
    //     name: 'RECEIVING_ITEM_NUMBER',
    //   },
    //   render: (text: any, record: any) => {
    //     return (
    //       <ContextMenuWrapper
    //         items={[
    //           {
    //             label: 'Copy',
    //             action: handleCopy,
    //           },
    //           // {
    //           //   label: 'Open with',
    //           //   action: () => {},
    //           //   submenu: [
    //           //     { label: 'PART TRACKING', action: handleAdd },
    //           //     { label: 'PICKSLIP REQUEST', action: handleAddPick },
    //           //   ],
    //           // },
    //         ]}
    //       >
    //         <a
    //           onClick={() => {
    //             // dispatch(setCurrentProjectTask(record));
    //             // setOpenRequirementDrawer(true);
    //             // onReqClick(record);
    //           }}
    //         >
    //           {record.RECEIVING_ITEM_NUMBER}
    //         </a>
    //       </ContextMenuWrapper>
    //     );
    //   },

    //   // responsive: ['sm'],
    // },

    {
      title: `${t('ORDER No')}`,
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      // tip: 'ITEM STORE',
      ellipsis: true,
      // width: '8%',
      formItemProps: {
        name: 'orderNumber',
      },

      sorter: (a: any, b: any) => a.orderNumber - b.orderNumber, //
    },
    {
      title: `${t('ORDER TYPE')}`,
      dataIndex: 'orderType',
      key: 'orderType',
      // tip: 'LOCAL_ID',
      ellipsis: true,
      width: '7%',
      formItemProps: {
        name: 'orderType',
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('POS')}`,
      dataIndex: 'POS',
      key: 'POS',
      width: '3%',
      ellipsis: true,
      render: (text: any, record: any) => record?.POS + 1,
      // остальные свойства...
    },
    {
      title: `${t('PART No')}`,
      dataIndex: 'PART_NUMBER',
      key: 'PART_NUMBER',
      ellipsis: true,
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
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'DESCRIPTION',
      key: 'DESCRIPTION',
      // tip: 'ITEM STORE',
      ellipsis: true,
      width: '13%',
      formItemProps: {
        name: 'DESCRIPTION',
      },

      // responsive: ['sm'],
    },
    // {
    //   title: `${t('CONDITION')}`,
    //   dataIndex: 'CONDITION',
    //   key: 'CONDITION',
    //   //tip: 'CONDITION',
    //   ellipsis: true,

    //   formItemProps: {
    //     name: 'CONDITION',
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
    //         {record.CONDITION}
    //       </div>
    //     );
    //   },

    //   // responsive: ['sm'],
    // },
    // {
    //   title: `${t('LABEL')}`,
    //   dataIndex: 'LOCAL_ID',
    //   key: 'LOCAL_ID',
    //   // tip: 'LOCAL_ID',
    //   ellipsis: true,
    //   width: '7%',
    //   formItemProps: {
    //     name: 'LOCAL_ID',
    //   },
    //   sorter: (a: any, b: any) => a.LOCAL_ID - b.LOCAL_ID, //

    //   // responsive: ['sm'],
    // },
    // {
    //   title: `${t('AWB No')}`,
    //   dataIndex: 'AWB_NUMBER',
    //   key: 'AWB_NUMBER',
    //   //tip: 'ITEM ORDER_NUMBER',
    //   ellipsis: true,
    //   width: '7%',
    //   formItemProps: {
    //     name: 'AWB_NUMBER',
    //   },

    //   // responsive: ['sm'],
    // },

    {
      title: `${t('QTY')}`,
      dataIndex: 'QUANTITY',
      key: 'QUANTITY',
      width: '5%',
      responsive: ['sm'],
      search: false,

      sorter: (a: any, b: any) => a.QUANTITY - b.QUANTITY, //
    },
    {
      title: `${t('QUOTED')}`,
      dataIndex: 'qtyQuoted',
      key: 'qtyQuoted',

      responsive: ['sm'],
      search: false,

      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('BACKORDER')}`,
      dataIndex: 'backorder',
      key: 'backorder',
      width: '6%',
      responsive: ['sm'],
      search: false,

      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('UNIT')}`,
      dataIndex: 'UNIT_OF_MEASURE',
      key: 'UNIT_OF_MEASURE',
      responsive: ['sm'],
      width: '5%',
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: `${t('VENDOR')}`,
      dataIndex: 'CODE',
      key: 'CODE',
      // tip: 'ITEM STORE',
      ellipsis: true,
      // width: '4%',

      render: (text: any, record: any) => {
        return <div>{record.CODE}</div>;
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('PRICE')}`,
      dataIndex: 'price',
      key: 'price',

      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },

      sorter: (a: any, b: any) => a.price - b.price, //
      search: false,
    },
    {
      title: `${t('CURRENCY')}`,
      dataIndex: 'currency',
      key: 'currency',

      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
    {
      title: `${t('STATE')}`,
      key: 'state',

      valueType: 'select',
      filterSearch: true,
      filters: true,
      ellipsis: true,

      dataIndex: 'state',
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        // Определяем цвет фона в зависимости от условия
        let backgroundColor;
        if (record.state === 'RECEIVED') {
          backgroundColor = '#62d156';
        } else if (record.state === 'OPEN' || record.state === 'open') {
          backgroundColor = 'red';
        } else {
          backgroundColor = '#f0be37';
        }
        return (
          <div style={{ backgroundColor }}>{record.state && record.state}</div>
        );
      },
    },
    {
      title: `${t('CREATE BY')}`,
      dataIndex: 'createBySing',
      key: 'createBySing',

      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
    {
      title: `${t('CREATE DATE')}`,
      dataIndex: 'createDate',
      width: '7%',
      key: 'createDate',
      //tip: 'ITEM EXPIRY DATE',
      ellipsis: true,
      valueType: 'date',

      formItemProps: {
        name: 'createDate',
      },
      sorter: (a, b) => {
        if (a.createDate && b.createDate) {
          const aFinishDate = new Date(a.createDate);
          const bFinishDate = new Date(b.createDate);
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
      title: `${t('DOC')}`,
      dataIndex: 'filesVendor',
      key: 'filesVendor',
      width: '4%',
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      render: (text, record, index) => {
        return record?.files && record?.files.length > 0 ? (
          <FileModalList
            files={record?.files || []}
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
        data={data}
        showSearchInput
        initialColumns={initialColumns}
        isLoading={false}
        menuItems={undefined}
        recordCreatorProps={false}
        onMultiSelect={(record: any, rowIndex?: any) => {
          const materials = record.map((item: any) => item);
          // console.log(locationNames);
          setSelectedMaterials(materials);
          onSelectedParts && onSelectedParts(materials);
        }}
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        // onSelectedRowKeysChange={handleSelectedRowKeysChange}
        onRowClick={function (record: any, rowIndex?: any): void {
          onSingleRowClick && onSingleRowClick(record);
          setSelectedMaterials((prevSelectedItems: (string | undefined)[]) =>
            prevSelectedItems && prevSelectedItems.includes(record._id)
              ? []
              : [record]
          );
          onSelectedParts &&
            onSelectedParts((prevSelectedItems: (string | undefined)[]) =>
              prevSelectedItems && prevSelectedItems.includes(record._id)
                ? []
                : [record]
            );
        }}
        onDoubleRowClick={onDoubleClick}
        onSave={function (rowKey: any, data: any, row: any): void {}}
        yScroll={scroll}
        externalReload={function () {
          throw new Error('Function not implemented.');
        }}
      ></EditableTable>
    </div>
  );
};

export default OrderItemList;
