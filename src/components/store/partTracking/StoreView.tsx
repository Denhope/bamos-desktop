import { ProColumns } from '@ant-design/pro-components';
import { TimePicker } from 'antd';
import EditableTable from '@/components/shared/Table/EditableTable';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IBookingItem } from '@/models/IBooking';
import { transformToPartBooking } from '@/services/utilites';
import { ColDef } from 'ag-grid-community';
import PartContainer from '@/components/woAdministration/PartContainer';
type StoreViewType = {
  scroll: number;
  data: any[];
  isLoading: boolean;
  onSingleRowClick?: (record: any, rowIndex?: any) => void;
};
const StoreView: FC<StoreViewType> = ({
  data,
  scroll,
  onSingleRowClick,
  isLoading,
}) => {
  const { t } = useTranslation();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

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
      headerName: `${t('BOOKING')}`,
      field: 'voucherModel',
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
      field: 'SUPPLIER_BATCH_NUMBER',
      editable: false,
      filter: false,
      headerName: `${t('BATCH')}`,
      cellDataType: 'text',
    },
    {
      field: 'SERIAL_NUMBER',
      editable: false,
      filter: false,
      headerName: `${t('SERIAL')}`,
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
      field: 'SHELF_NUMBER',
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
      field: 'NAME_OF_MATERIAL',
      headerName: `${t('DESCRIPTION')}`,
      cellDataType: 'text',
    },
    {
      field: 'ORDER_NUMBER',
      headerName: `${t('ORDER No')}`,
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
  ]);
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  return (
    <div>
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
        //
        onRowSelect={(data: any): void => {
          onSingleRowClick && onSingleRowClick(data);
        }}
      />
    </div>
  );
};

export default StoreView;
