import { ColDef } from 'ag-grid-community';
import { TFunction } from 'i18next';

export const columnDefs = (t: TFunction): ColDef[] => [
  {
    field: 'createDate',
    headerName: t('CREATE DATE'),

    flex: 1,
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
  },
  {
    field: 'pickSlipNumber',
    headerName: t('PICKSLIP No'),
  },
  {
    field: 'partNumber',
    headerName: t('PART No'),
  },

  {
    field: 'batchNumber',
    headerName: t('BATCH'),
  },
  {
    field: 'serialNumber',
    headerName: t('SERIAL'),
  },
  {
    field: 'store',
    headerName: t('STORE'),
  },
  {
    field: 'location',
    headerName: t('LOCATION'),
  },
  {
    field: 'condition',
    headerName: t('CONDITION'),
  },
  {
    field: 'description',
    headerName: t('DESCRIPTION'),
  },
  {
    field: 'orderNumber',
    headerName: t('ORDER No'),
  },
  {
    field: 'projectWO',
    headerName: t('PROJECT No'),
  },
  {
    field: 'projectTaskWO',
    headerName: t('TRACE No'),
  },
  {
    field: 'taskNumber',
    headerName: t('TASK No'),
  },
  {
    field: 'taskDescription',
    headerName: t('TASK DESCRIPTION'),
  },
  {
    field: 'taskType',
    headerName: t('TASK TYPE'),

    flex: 1,
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
    minWidth: 80,
    flex: 1,
    type: 'numericColumn',
  },
  {
    field: 'cancelledQty',
    headerName: t('CANCELLED QTY'),
    minWidth: 120,
    flex: 1,
    type: 'numericColumn',
  },
  {
    field: 'unitOfMeasure',
    headerName: t('UNIT OF MEASURE'),
    minWidth: 120,
    flex: 1,
  },
  {
    field: 'createdBy',
    headerName: t('CREATE BY'),
    minWidth: 120,
    flex: 1,
  },
];
