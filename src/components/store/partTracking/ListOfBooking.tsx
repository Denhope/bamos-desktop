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
  ValueEnumTypeTask,
  getTaskTypeColor,
} from '@/services/utilites';
import { ColDef } from 'ag-grid-community';
import UniversalAgGrid from '@/components/shared/UniversalAgGrid';
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
  const valueEnumTask: ValueEnumTypeTask = {
    RC: t('TC'),
    CR_TASK: t('CR TASK (CRITICAL TASK/DI)'),
    NRC: t('NRC (DEFECT)'),
    NRC_ADD: t('ADHOC (ADHOC TASK)'),
    MJC: t('MJC'),
    CMJC: t('CMJC'),
    FC: t('FC'),
    HARD_ACCESS: t('HARD_ACCESS'),
  };
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
      field: 'PICK_SLIP_NUMBER',
      headerName: `${t('PICKSLIP No')}`,
      cellDataType: 'text',
      width: 100,
    },
    {
      field: 'registrationNumber',
      headerName: `${t('AC REG')}`,
      cellDataType: 'text',
    },
    {
      field: 'projectWO',
      headerName: `${t('PROJECT No')}`,
      cellDataType: 'text',
    },
    {
      field: 'woName',
      headerName: `${t('WP NAME')}`,
      cellDataType: 'text',
    },
    {
      field: 'projectTaskWO',
      headerName: `${t('TRACE No')}`,
      cellDataType: 'text',
    },
    {
      field: 'taskNumber',
      headerName: `${t('TASK No')}`,
      cellDataType: 'text',
    },
    {
      field: 'taskDescription',
      headerName: `${t('TASK DESCRIPTION')}`,
      cellDataType: 'text',
    },
    {
      field: 'TASK_TYPE',
      headerName: `${t('TASK TYPE')}`,
      filter: true,
      valueGetter: (params: { data: { TASK_TYPE: keyof ValueEnumTypeTask } }) =>
        params.data.TASK_TYPE,
      valueFormatter: (params: { value: keyof ValueEnumTypeTask }) => {
        const status = params.value;
        return valueEnumTask[status] || '';
      },
      cellStyle: (params: { value: keyof ValueEnumTypeTask }) => ({
        backgroundColor: getTaskTypeColor(params.value),
      }),
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
      field: 'CREATE_BY',
      editable: false,
      filter: false,
      headerName: `${t('CREATE BY')}`,
      cellDataType: 'text',
    },
  ]);
  return (
    <div>
      <UniversalAgGrid
        isLoading={isLoading}
        isVisible={true}
        pagination={true}
        height={'68vh'}
        columnDefs={columnDefs}
        isChekboxColumn={true}
        rowData={transformedPartNumbers}
        onCheckItems={setSelectedRowKeys}
        onRowSelect={(data: any): void => {
          onSingleRowClick && onSingleRowClick(data[0]);
        }}
        gridId={'bookingList'}
      />
    </div>
  );
};

export default ListOfBooking;
