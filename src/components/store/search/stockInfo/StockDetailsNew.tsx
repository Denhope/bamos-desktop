//@ts-nocheck
import { ProCard, ProColumns } from '@ant-design/pro-components';
import { Empty, TimePicker } from 'antd';

import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { transformToIStockPartNumber } from '@/services/utilites';

import { ColDef } from 'ag-grid-community';
import { useGetStorePartsQuery } from '@/features/storeAdministration/PartsApi';
import UniversalAgGrid from '@/components/shared/UniversalAgGrid';

interface StockDetailsNewProps {
  isLoading: boolean;
  transformedStokPartNumbers: any[];
  isDescription: boolean;
  height: string;
  isAlternatives?: boolean;
  partNumberID?: string;
  total?: number;
  showInaccessibleOnly?: boolean;
}

const StockDetailsNew: FC<StockDetailsNewProps> = ({
  partNumberID,
  isAlternatives,
  storeID,
  height,
  isLoading,
  isDescription = false,
  transformedStokPartNumbers,
  total,
  showInaccessibleOnly = false,
}) => {
  const { t } = useTranslation();

  const [data, setData] = useState<any>([]);

  useEffect(() => {
    console.log('Setting data:', transformedStokPartNumbers);
    setData(transformedStokPartNumbers);
  }, [transformedStokPartNumbers]);

  type CellDataType = 'text' | 'number' | 'date' | 'boolean' | 'Object';

  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType;
  }

  const DateCell = (props: { value: string; style: any }) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    };

    return (
      <div
        style={{
          backgroundColor: props.style.backgroundColor,
          border: `1px solid ${props.style.borderColor}`,
          color: props.style.color,
          borderRadius: '4px',
          padding: '2px 8px',
          display: 'inline-block',
          fontSize: '12px',
          textAlign: 'center',
          minWidth: '90px',
        }}
      >
        {formatDate(props.value)}
      </div>
    );
  };

  const [columnDefs] = useState<ExtendedColDef[]>([
    {
      headerName: `${t('LOCAL_ID')}`,
      field: 'LOCAL_ID',
      editable: false,
      cellDataType: 'text',
    },
    {
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER',
      editable: false,
      cellDataType: 'text',
    },
    {
      field: 'NAME_OF_MATERIAL',
      headerName: `${t('DESCRIPTION')}`,
      cellDataType: 'text',
    },
    {
      field: 'GROUP',
      headerName: `${t('GROUP')}`,
      cellDataType: 'text',
    },
    {
      field: 'TYPE',
      headerName: `${t('TYPE')}`,
      cellDataType: 'text',
    },
    {
      field: 'QUANTITY',
      editable: false,
      filter: false,
      headerName: `${t('QTY')}`,
      cellDataType: 'number',
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('UNIT OF MEASURE')}`,
      cellDataType: 'text',
    },
    {
      field: 'STOCK',
      editable: false,
      filter: false,
      headerName: `${t('STORE')}`,
      cellDataType: 'text',
    },
    {
      field: 'LOCATION',
      editable: false,
      filter: false,
      headerName: `${t('LOCATION')}`,
      cellDataType: 'text',
    },
    {
      field: 'CONDITION',
      editable: false,
      filter: false,
      headerName: `${t('CONDITION')}`,
      cellDataType: 'text',
    },

    {
      field: 'SUPPLIER_BATCH_NUMBER',
      headerName: `${t('BATCH NUMBER')}`,
      cellDataType: 'text',
    },
    {
      field: 'SERIAL_NUMBER',
      headerName: `${t('SERIAL NUMBER')}`,
      cellDataType: 'text',
    },
    {
      field: 'OWNER',
      editable: false,
      filter: false,
      headerName: `${t('OWNER')}`,
      cellDataType: 'text',
    },
    {
      field: 'PRODUCT_EXPIRATION_DATE',
      headerName: `${t('PRODUCT EXPIRATION DATE')}`,
      cellDataType: 'date',
      cellRenderer: (params: any) => {
        if (!params.value) return null;

        const date = new Date(params.value);
        const today = new Date();
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let style = {
          backgroundColor: '#f6ffed',
          borderColor: '#b7eb8f',
          color: '#389e0d',
        };

        if (diffDays <= 0) {
          style = {
            backgroundColor: '#fff1f0',
            borderColor: '#ffa39e',
            color: '#cf1322',
          };
        } else if (diffDays <= 30) {
          style = {
            backgroundColor: '#fff7e6',
            borderColor: '#ffd591',
            color: '#d46b08',
          };
        } else if (diffDays <= 90) {
          style = {
            backgroundColor: '#feffe6',
            borderColor: '#fffb8f',
            color: '#ad8b00',
          };
        }

        return <DateCell value={params.value} style={style} />;
      },
    },
    {
      field: 'RECEIVED_DATE',
      headerName: `${t('RECEIVED DATE')}`,
      cellDataType: 'date',
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
      },
    },
    // {
    //   field: 'FILES',
    //   headerName: `${t('FILES')}`,
    //   cellDataType: 'text',
    // },
    ...(showInaccessibleOnly
      ? [
          {
            field: 'restrictionID',
            headerName: `${t('RESTRICTION')}`,
            cellDataType: 'text',
          },
          {
            field: 'locationType',
            headerName: `${t('LOCATION TYPE')}`,
            cellDataType: 'text',
          },
        ]
      : []),
  ]);

  // Вычисление значений для индикаторов
  const sumInaccessible = useMemo(() => {
    return data.reduce((sum: number, part: any) => {
      return part.restrictionID === 'inaccessible'
        ? sum + (Number(part.QUANTITY) || 0)
        : sum;
    }, 0);
  }, [data]);

  const sumRestricted = useMemo(() => {
    return data.reduce((sum: number, part: any) => {
      return part.restrictionID === 'restricted' || part.isReserved
        ? sum + (Number(part.QUANTITY) || 0)
        : sum;
    }, 0);
  }, [data]);

  const sumStandard = useMemo(() => {
    return data.reduce((sum: number, part: any) => {
      return (!part.restrictionID || part.restrictionID === 'standart') &&
        !part.isReserved
        ? sum + (Number(part.QUANTITY) || 0)
        : sum;
    }, 0);
  }, [data]);

  return (
    <div className="py-2 flex flex-col w-[99%] justify-between">
      <div className="flex-grow">
        {partNumberID && data.length > 0 ? (
          <UniversalAgGrid
            height={height}
            columnDefs={columnDefs}
            rowData={data}
            isLoading={isLoading}
            gridOptions={{
              suppressRowClickSelection: true,
              rowSelection: 'single',
              enableRangeSelection: true,
              copyHeadersToClipboard: true,
              enableCellTextSelection: true,
            }}
          />
        ) : (
          <Empty description={t('No data')} />
        )}
      </div>

      {isDescription && (
        <div className="flex mt-4">
          <ProCard title={`${t('INACCESSIBLE')}`}>
            <ProCard
              size="small"
              type="inner"
              style={{ backgroundColor: 'red', color: 'black' }}
              className="flex justify-end items-end font-bold py-0 my-0"
            >
              {sumInaccessible}
            </ProCard>
          </ProCard>
          <ProCard title={`${t('RESTRICTED')}`}>
            <ProCard
              size="small"
              type="inner"
              style={{ backgroundColor: '#FFDB58', color: 'black' }}
              className="flex justify-end items-end font-bold py-0 my-0"
            >
              {sumRestricted}
            </ProCard>
          </ProCard>
          <ProCard title={`${t('STANDARD')}`}>
            <ProCard
              size="small"
              type="inner"
              style={{ backgroundColor: '#32CD32', color: 'black' }}
              className="flex justify-center items-end font-bold py-0 my-0"
            >
              {sumStandard}
            </ProCard>
          </ProCard>
        </div>
      )}
    </div>
  );
};

export default StockDetailsNew;
