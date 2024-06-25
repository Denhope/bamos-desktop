import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Split } from '@geoffcox/react-splitter';
import PartContainer from '@/components/woAdministration/PartContainer';
import { ColDef } from 'ag-grid-community';
import AltFormPanel from './AltFormPanel';
import { useGetAltsPartNumbersQuery } from '@/features/partAdministration/altPartApi';
import { transformToIAltPartNumber } from '@/services/utilites';
import { Empty } from 'antd';
import { format } from 'date-fns';

type AlternatesFormType = {
  onEditPart?: (part?: any) => void;
  currentPart?: any;
};

const Alternates: FC<AlternatesFormType> = ({ currentPart }) => {
  const { t } = useTranslation();

  const [currentAlternate, setCurrentAlternate] = useState<any>(null);

  const { data: altPartNumbers, isLoading } = useGetAltsPartNumbersQuery(
    {
      partNumberID: currentPart?._id,
    },
    {
      skip: !currentPart?._id,
    }
  );

  const [selectedSingleAlternativePN, setSecectedSingleAlternativePN] =
    useState<any>();

  type CellDataType = 'text' | 'number' | 'date' | 'boolean';

  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType;
  }

  const [columnDefs, setColumnDefs] = useState<ExtendedColDef[]>([
    {
      headerName: `${t('ALTERNATE-PART')}`,
      field: 'ALTERNATIVE',
      editable: false,
      cellDataType: 'text',
    },
    {
      field: 'ALTERNATIVE_DESCRIPTION',
      headerName: `${t('ALT. DESCRIPTION')}`,
      cellDataType: 'text',
    },
    {
      field: 'GROUP',
      headerName: `${t('ALT. GROUP')}`,
      cellDataType: 'text',
    },
    {
      field: 'TYPE',
      headerName: `${t('ALT. TYPE')}`,
      cellDataType: 'text',
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('ALT. UNIT OF MEASURE')}`,
      cellDataType: 'text',
    },
    {
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER',
      editable: false,
      cellDataType: 'text',
    },
    {
      field: 'PART_DESCRIPTION',
      headerName: `${t('DESCRIPTION')}`,
      cellDataType: 'text',
    },
    {
      field: 'PART_GROUP',
      headerName: `${t('GROUP')}`,
      cellDataType: 'text',
    },
    {
      field: 'PART_TYPE',
      headerName: `${t('TYPE')}`,
      cellDataType: 'text',
    },
    {
      field: 'PART_UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('UNIT OF MEASURE')}`,
      cellDataType: 'text',
    },
    {
      headerName: `${t('APPROVED BY')}`,
      field: 'APPROVED',
      cellDataType: 'text',
      valueFormatter: (params) =>
        params.value ? params.value.toUpperCase() : '',
    },
    {
      headerName: `${t('APPROVED DATE')}`,
      field: 'createDate',
      cellDataType: 'date',
      valueFormatter: (params) => {
        if (!params.value) return '';
        return format(new Date(params.value), 'dd.MM.yyyy');
      },
    },
  ]);

  const handleRowSelect = useCallback((row: any) => {
    setCurrentAlternate(row);
  }, []);

  // Используем useMemo для кэширования результата transformToIAltPartNumber
  const transformedAltPartNumbers = useMemo(() => {
    return transformToIAltPartNumber(altPartNumbers || []);
  }, [altPartNumbers]);

  return (
    <div>
      <div className="flex gap-4 justify-between">
        <Split initialPrimarySize="60%">
          <div className="h-[59vh] overflow-hidden flex flex-col justify-between">
            {currentPart ? (
              <PartContainer
                isVisible={false}
                onRowSelect={handleRowSelect}
                pagination={false}
                isAddVisiable={true}
                isButtonVisiable={false}
                isEditable={true}
                height={'58vh'}
                columnDefs={columnDefs}
                partNumbers={[]}
                onUpdateData={(data: any[]): void => {}}
                rowData={transformedAltPartNumbers}
              />
            ) : (
              <Empty />
            )}
          </div>
          <>
            <div className="flex flex-col px-3">
              {currentPart ? (
                <AltFormPanel
                  currentPart={currentPart}
                  currentAltPart={currentAlternate}
                />
              ) : (
                <Empty />
              )}
            </div>
          </>
        </Split>
      </div>
    </div>
  );
};

export default Alternates;
