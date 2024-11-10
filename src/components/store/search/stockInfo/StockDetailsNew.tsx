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
      field: 'OWNER',
      editable: false,
      filter: false,
      headerName: `${t('OWNER')}`,
      cellDataType: 'text',
    },
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
