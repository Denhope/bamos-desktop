import { ColDef } from 'ag-grid-community';
import { TFunction } from 'i18next';

export const columnDefs = (t: TFunction): ColDef[] => [
  {
    field: 'createDate',
    headerName: t('CREATE DATE'),
    width: 150,
    valueFormatter: (params: any) => {
      if (!params.value) return '';
      return new Date(params.value).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
  {
    field: 'label',
    headerName: t('LABEL'),
    width: 120,
  },
  {
    field: 'pickSlipNumber',
    headerName: t('PICKSLIP No'),
    width: 120,
  },
  {
    field: 'partNumber',
    headerName: t('PART No'),
    width: 120,
  },
  {
    field: 'batchNumber',
    headerName: t('BATCH'),
    width: 120,
  },
  {
    field: 'serialNumber',
    headerName: t('SERIAL'),
    width: 120,
  },
  {
    field: 'store',
    headerName: t('STORE'),
    width: 120,
  },
  {
    field: 'location',
    headerName: t('LOCATION'),
    width: 120,
  },
  {
    field: 'condition',
    headerName: t('CONDITION'),
    width: 120,
  },
  {
    field: 'description',
    headerName: t('DESCRIPTION'),
    width: 120,
  },
  {
    field: 'orderNumber',
    headerName: t('ORDER No'),
    width: 120,
  },
  {
    field: 'projectWO',
    headerName: t('PROJECT No'),
    width: 120,
  },
  {
    field: 'projectTaskWO',
    headerName: t('TRACE No'),
    width: 120,
  },
  { field: 'externalNumber', headerName: t('EXTERNAL No'), width: 120 },
  {
    field: 'taskNumber',
    headerName: t('TASK No'),
    width: 120,
  },
  {
    field: 'taskDescription',
    headerName: t('TASK DESCRIPTION'),
    width: 120,
  },
  {
    field: 'taskType',
    headerName: t('TASK TYPE'),
    width: 150,
    valueFormatter: (params: any) => {
      const valueEnumTask = {
        RC: t('TC'),
        CR_TASK: t('CR TASK (CRITICAL TASK/DI)'),
        NRC: t('NRC (DEFECT)'),
        NRC_ADD: t('ADHOC (ADHOC TASK)'),
        MJC: t('MJC'),
        CMJC: t('CMJC'),
        FC: t('FC'),
        HARD_ACCESS: t('HARD_ACCESS'),
      };
      return (
        valueEnumTask[params.value as keyof typeof valueEnumTask] ||
        params.value
      );
    },
  },
  {
    field: 'quantity',
    headerName: t('QTY'),
    width: 80,
    type: 'numericColumn',
  },
  {
    field: 'cancelledQty',
    headerName: t('CANCELLED QTY'),
    width: 120,
    type: 'numericColumn',
  },
  {
    field: 'unitOfMeasure',
    headerName: t('UNIT OF MEASURE'),
    width: 120,
  },
  {
    field: 'createdBy',
    headerName: t('CREATE BY'),
    width: 120,
  },
];
