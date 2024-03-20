import { ProCard, ProColumns } from '@ant-design/pro-components';
import { DatePicker, Divider, Layout, Row, Space, TimePicker } from 'antd';
import Title from 'antd/es/typography/Title';
import ContextMenuWrapper from '@/components/shared/ContextMenuWrapperProps';
import FilesSelector from '@/components/shared/FilesSelector';

import EditableTable from '@/components/shared/Table/EditableTable';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import moment from 'moment';
import RcResizeObserver from 'rc-resize-observer';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { handleFileOpen, handleFileSelect } from '@/services/utilites';
import {
  getFilteredMaterialItems,
  getFilteredMaterialItemsStock,
} from '@/utils/api/thunks';
import FileModalList from '@/components/shared/FileModalList';

interface Stock {
  STOCK: string;
  QUANTITY: number;
  OWNER_LONG_NAME?: string;
}

interface StockGridProps {
  stocks: Stock[];
  totalQuantity?: number;
  partNumber: any;
}

const StockGrid: React.FC<StockGridProps> = ({
  partNumber,
  stocks,
  totalQuantity,
}) => {
  const { RangePicker } = DatePicker;
  const {
    isLoading,
    filteredCurrentStockItems,
    filteredItemsStockQuantity,
    selectedFlterDate,
  } = useTypedSelector((state) => state.storesLogistic);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const size = stocks.length ? Math.floor(70 / Math.sqrt(stocks.length)) : 100; // Размер блока в зависимости от количества блоков
  const sizey = Math.floor(15 / Math.sqrt(stocks.length)) || 300;
  const fontSize = Math.floor((11 * size) / 30) || 20;
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
      //tooltip: 'ITEM PART_NUMBER',
      // ellipsis: true,
      // width: '15%',
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
      // tooltip: 'ITEM STORE',
      ellipsis: true,
      width: '6%',
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
      //tooltip: 'CONDITION',
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
      //tooltip: 'ITEM LOCATION',
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
    //   tooltip: 'ITEM DESCRIPTION',
    //   ellipsis: true, //
    //   width: '20%',
    // },
    {
      title: `${t('BATCH/SERIAL')}`,
      dataIndex: 'SERIAL_NUMBER',
      key: 'SERIAL_NUMBER',
      render: (text: any, record: any) =>
        record.SERIAL_NUMBER || record.SUPPLIER_BATCH_NUMBER,
      ellipsis: true,
      width: '10%',
      formItemProps: {
        name: 'Batch_Unit Notes',
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('RESEIVING')}`,
      dataIndex: 'ORDER_NUMBER',
      key: 'ORDER_NUMBER',
      //tooltip: 'ITEM ORDER_NUMBER',
      ellipsis: true,
      width: '7%',
      formItemProps: {
        name: 'ORDER_NUMBER',
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
      width: '6%',
      search: false,
      // sorter: (a, b) =
    },
    {
      title: `${t('OWNER')}`,
      dataIndex: 'OWNER_SHORT_NAME',
      key: 'Owner Short Name',
      width: '9%',
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
  const dispatch = useAppDispatch();
  const alternativeValues =
    filteredItemsStockQuantity?.alternatives &&
    filteredItemsStockQuantity?.alternatives.map(
      (item: { ALTERNATIVE: any }) => item.ALTERNATIVE
    );

  return (
    <div className="flex flex-col my-0 mx-auto h-[78vh] relative overflow-hidden">
      {/* <div className=""> */}
      <div className="flex p-5 flex-wrap ">
        {stocks && stocks.length ? (
          stocks?.map((stock, index) => (
            <ProCard
              key={index}
              style={{
                cursor: 'pointer',
                maxWidth: `${size}%`,
                maxHeight: `${sizey}vh`,
                minHeight: `${sizey}vh`,
                margin: 1,
                backgroundColor:
                  selectedKey === stock?.STOCK &&
                  filteredCurrentStockItems &&
                  filteredCurrentStockItems.length > 0
                    ? '#228B22'
                    : '#32CD32',
                border:
                  selectedKey === stock?.STOCK
                    ? '1px solid blanc'
                    : '1px solid gray',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                transition: 'transform .2s', // Добавлено для анимации
              }}
              onClick={async () => {
                setSelectedKey(stock?.STOCK);
                console.log(partNumber);
                const result = await dispatch(
                  getFilteredMaterialItemsStock({
                    PART_NUMBER: partNumber.trim(),
                    companyID: localStorage.getItem('companyID') || '',
                    STOCK: stock?.STOCK,
                    alternatives: alternativeValues,
                    isAllDate: selectedFlterDate,
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  console.log(result.payload);
                }
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = 'scale(1.02)')
              } // Добавлено для анимации
              onMouseOut={(e) => (e.currentTarget.style.transform = '')}
            >
              <div
                style={{
                  alignItems: 'center',
                  fontSize: `${fontSize}px`,
                  fontWeight: 'bold',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div> {stock.STOCK}</div>
                <div> {stock.QUANTITY}</div>
                <div className="text-xs font-normal">
                  {stock.OWNER_LONG_NAME}
                </div>
              </div>
            </ProCard>
          ))
        ) : (
          <ProCard
            key={1}
            style={{
              cursor: 'pointer',
              maxWidth: `${size}%`,
              maxHeight: `${sizey}vh`,
              minHeight: `${sizey}vh`,
              margin: 1,
              backgroundColor: '#FF4500',
              border: 'solid gray',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              transition: 'transform .2s', // Добавлено для анимации
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = 'scale(1.02)')
            } // Добавлено для анимации
            onMouseOut={(e) => (e.currentTarget.style.transform = '')}
          >
            <div
              style={{
                alignItems: 'center',
                fontSize: `${fontSize}px`,
                fontWeight: 'bold',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div> {0}</div>
            </div>
          </ProCard>
        )}
      </div>
      <div className={`flex flex-col text-sm ml-auto font-bold`}>
        <div className="ml-auto pr-24">
          TOTAL STOCK QTY:
          <span
            className={`highlight ${
              totalQuantity ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {totalQuantity || 0}
          </span>
        </div>
      </div>

      <div className="py-5 flex flex-col w-[99%]">
        <Title level={5}>
          {t('DETAILS FOR STORE ')} -
          <a className="font-bold text-lg">
            {filteredCurrentStockItems && filteredCurrentStockItems.length > 0
              ? selectedKey
              : ''}
          </a>
        </Title>
        <EditableTable
          isNoneRowSelection={true}
          showSearchInput={true}
          data={filteredCurrentStockItems}
          initialColumns={initialColumns}
          isLoading={false}
          menuItems={undefined}
          recordCreatorProps={false}
          onRowClick={function (record: any, rowIndex?: any): void {}}
          onSave={function (rowKey: any, data: any, row: any): void {}}
          yScroll={17}
          externalReload={function () {}}
        />
      </div>

      {/* </div> */}
    </div>
  );
};

export default StockGrid;
