import { ProCard, ProColumns } from '@ant-design/pro-components';
import { Empty, TimePicker } from 'antd';

import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { transformToIStockPartNumber } from '@/services/utilites';

import PartContainer from '@/components/woAdministration/PartContainer';

import { ColDef } from 'ag-grid-community';
import { useGetStorePartsQuery } from '@/features/storeAdministration/PartsApi';
type StockDetailsType = {
  partNumberID?: any;
  isAlternatives?: boolean;
  isLoading: boolean;
  isDescription?: boolean;
  storeID?: string;
  height: string;
  transformedStokPartNumbers: any;
};
const StockDetailsNew: FC<StockDetailsType> = ({
  partNumberID,
  isAlternatives,
  storeID,
  height,
  isLoading,
  isDescription = false,
  transformedStokPartNumbers,
}) => {
  const { t } = useTranslation();

  const [data, setData] = useState<any>([]);

  // const {
  //   data: parts,
  //   isLoading: partsQueryLoading,
  //   isFetching: partsLoadingF,
  //   refetch,
  // } = useGetStorePartsQuery(
  //   {
  //     partNumberID: partNumberID,
  //     storeID: storeID,
  //   },

  //   {
  //     skip: !partNumberID,
  //   }
  // );
  // const transformedStokPartNumbers = useMemo(() => {
  //   return transformToIStockPartNumber(parts || []);
  // }, [parts]);

  useEffect(() => {
    setData(transformedStokPartNumbers);

    // navigate(storedKey);
  }, [transformedStokPartNumbers]);

  type CellDataType = 'text' | 'number' | 'date' | 'boolean' | 'Object';

  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType;
  }
  const [columnDefs, setColumnDefs] = useState<ExtendedColDef[]>([
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
      field: 'SERIAL_NUMBER',
      editable: false,
      filter: false,
      headerName: `${t('BATCH/SERIAL')}`,
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
      field: 'PRODUCT_EXPIRATION_DATE',
      editable: false,
      filter: false,
      headerName: `${t('EXPIRY DATE')}`,
      cellDataType: 'date',
      valueFormatter: (params: any) => {
        if (!params.value) return ''; // Проверка отсутствия значения
        const date = new Date(params.value);
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      },
    },

    {
      field: 'reservedQTY',
      editable: false,
      filter: false,
      headerName: `${t('RESERVED QTY')}`,
      cellDataType: 'number',
    },

    {
      field: 'OWNER',
      editable: false,
      filter: false,
      headerName: `${t('OWNER')}`,
      cellDataType: 'text',
    },
    {
      field: 'RECEIVING_NUMBER',
      editable: false,
      filter: false,
      headerName: `${t('RECEIVING')}`,
      cellDataType: 'text',
    },
    {
      field: 'RECEIVED_DATE',
      editable: false,
      filter: false,
      headerName: `${t('RECEIVED DATE')}`,
      cellDataType: 'date',
      valueFormatter: (params: any) => {
        if (!params.value) return ''; // Проверка отсутствия значения
        const date = new Date(params.value);
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      },
    },
    {
      field: 'DOC_NUMBER',
      editable: false,
      filter: false,
      headerName: `${t('DOC_NUMBER')}`,
      cellDataType: 'text',
    },
    {
      field: 'DOC_TYPE',
      editable: false,
      filter: false,
      headerName: `${t('DOC_TYPE')}`,
      cellDataType: 'text',
    },
  ]);
  // Вычисление значений на основании restrictionID
  const sumInaccessible = useMemo(() => {
    return transformedStokPartNumbers.reduce(
      (sum: any, part: { restrictionID: string; QUANTITY: any }) => {
        return part.restrictionID === 'inaccessible'
          ? sum + part.QUANTITY
          : sum;
      },
      0
    );
  }, [transformedStokPartNumbers]);

  const sumRestricted = useMemo(() => {
    return transformedStokPartNumbers.reduce(
      (sum: any, part: { restrictionID: string; QUANTITY: any }) => {
        return part.restrictionID === 'restricted' ? sum + part.QUANTITY : sum;
      },
      0
    );
  }, [transformedStokPartNumbers]);

  const sumStandard = useMemo(() => {
    return transformedStokPartNumbers.reduce(
      (sum: any, part: { restrictionID: string; QUANTITY: any }) => {
        return part.restrictionID === 'standart' ? sum + part.QUANTITY : sum;
      },
      0
    );
  }, [transformedStokPartNumbers]);

  return (
    <div className="py-2 flex flex-col w-[99%] justify-between">
      <div>
        {partNumberID ? (
          <PartContainer
            isFilesVisiable={true}
            isVisible={false}
            pagination={false}
            isAddVisiable={true}
            isButtonVisiable={false}
            isEditable={true}
            height={height}
            columnDefs={columnDefs}
            partNumbers={[]}
            onUpdateData={(data: any[]): void => {}}
            rowData={transformedStokPartNumbers}
            isLoading={isLoading}
          />
        ) : (
          <Empty />
        )}
      </div>

      {isDescription && (
        <div className="flex mt-auto ">
          <ProCard title={`${t('INACCESSIBLE')}`}>
            <ProCard
              size="small"
              type="inner"
              style={{
                backgroundColor: 'red',
                color: 'black',
              }}
              className="flex justify-end items-end font-bold  py-0 my-0"
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
              <div className="py-0 my-0">{sumRestricted}</div>
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
