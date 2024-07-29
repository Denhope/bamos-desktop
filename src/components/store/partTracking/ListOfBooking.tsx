import { ProColumns } from '@ant-design/pro-components';
import { TimePicker } from 'antd';
import EditableTable from '@/components/shared/Table/EditableTable';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IBookingItem } from '@/models/IBooking';
import PartContainer from '@/components/woAdministration/PartContainer';
import {
  transformToIPartNumber,
  transformToPartBooking,
} from '@/services/utilites';
import { ColDef } from 'ag-grid-community';
type ListOfBookingType = {
  scroll: number;
  data: any[];
  onSingleRowClick?: (record: any, rowIndex?: any) => void;
  isLoading: boolean;
};
const ListOfBooking: FC<ListOfBookingType> = ({
  data,
  scroll,
  onSingleRowClick,
  isLoading,
}) => {
  const { t } = useTranslation();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const transformedPartNumbers = useMemo(() => {
    return transformToPartBooking(data || []);
  }, [data]);
  type CellDataType = 'text' | 'number' | 'date' | 'boolean';

  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType;
  }

  const [columnDefs, setColumnDefs] = useState<ExtendedColDef[]>([
    {
      field: 'createDate',
      editable: false,
      cellDataType: 'date',
      headerName: `${t('CREATE DATE')}`,
      width: 150,
      valueFormatter: (params: any) => {
        if (!params.value) return ''; // Проверка отсутствия значения
        const date = new Date(params.value);
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },

    {
      headerName: `${t('BOOKING')}`,
      field: 'voucherModel',
      editable: false,
      cellDataType: 'text',
      width: 140,
    },
    {
      field: 'LOCAL_ID',
      headerName: `${t('LABEL')}`,
      cellDataType: 'text',
      width: 100,
    },
    {
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER',
      editable: false,
      cellDataType: 'text',
    },
    {
      field: 'SUPPLIER_BATCH_NUMBER',
      editable: false,
      filter: false,
      headerName: `${t('BATCH')}`,
      cellDataType: 'text',
      width: 140,
    },
    {
      field: 'SERIAL_NUMBER',
      editable: false,
      filter: false,
      headerName: `${t('SERIAL')}`,
      cellDataType: 'text',
      width: 140,
    },
    {
      field: 'CONDITION',
      editable: false,
      filter: false,
      headerName: `${t('CONDITION')}`,
      cellDataType: 'text',
      width: 140,
    },
    {
      field: 'NAME_OF_MATERIAL',
      headerName: `${t('DESCRIPTION')}`,
      cellDataType: 'text',
    },
    // {
    //   field: 'registrationNumber',
    //   headerName: `${t('A/C')}`,
    //   cellDataType: 'text',
    // },

    {
      field: 'QUANTITY',
      editable: false,
      filter: false,
      headerName: `${t('QTY')}`,
      cellDataType: 'number',
      width: 100,
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('UNIT OF MEASURE')}`,
      cellDataType: 'text',
    },
    {
      field: 'CREATE_BY',
      editable: false,
      filter: false,
      headerName: `${t('CREATE BY')}`,
      cellDataType: 'text',
    },
  ]);
  return (
    <div>
      {/* <EditableTable
        data={data}
        isNoneRowSelection
        showSearchInput
        initialColumns={initialColumns}
        isLoading={false}
        menuItems={undefined}
        recordCreatorProps={false}
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        // onSelectedRowKeysChange={handleSelectedRowKeysChange}
        onRowClick={function (record: any, rowIndex?: any): void {
          onSingleRowClick && onSingleRowClick(record);
        }}
        onSave={function (rowKey: any, data: any, row: any): void {}}
        yScroll={scroll}
        externalReload={function () {
          throw new Error('Function not implemented.');
        }}
      ></EditableTable> */}

      <PartContainer
        isLoading={isLoading}
        isFilesVisiable={true}
        isVisible={true}
        pagination={true}
        isAddVisiable={true}
        isButtonVisiable={false}
        isEditable={true}
        height={'68vh'}
        columnDefs={columnDefs}
        partNumbers={[]}
        isChekboxColumn={true}
        onUpdateData={(data: any[]): void => {}}
        rowData={transformedPartNumbers}
        onCheckItems={setSelectedRowKeys}
        onRowSelect={(data: any): void => {
          onSingleRowClick && onSingleRowClick(data);
        }}
      />
    </div>
  );
};

export default ListOfBooking;
