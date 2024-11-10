import { useMemo } from 'react';
import { TFunction } from 'i18next';
import { ColDef } from 'ag-grid-community';
import AutoCompleteEditor from '../../shared/Table/ag-grid/AutoCompleteEditor';

type CellDataType = 'text' | 'number' | 'date' | 'boolean';

interface ExtendedColDef extends ColDef {
  cellDataType: CellDataType;
}

export const useColumnDefs = (projectTasks: any[], t: TFunction) => {
  return useMemo<ExtendedColDef[]>(
    () => [
      {
        headerName: t('PART No'),
        field: 'PART_NUMBER',
        editable: false,
        cellEditor: AutoCompleteEditor,
        cellEditorParams: {
          options: projectTasks,
        },
        cellDataType: 'text',
        filter: true,
      },
      {
        field: 'DESCRIPTION',
        headerName: t('DESCRIPTION'),
        cellDataType: 'text',
        filter: true,
      },
      {
        field: 'GROUP',
        headerName: t('GROUP'),
        cellDataType: 'text',
        filter: true,
      },
      {
        field: 'TYPE',
        headerName: t('TYPE'),
        cellDataType: 'text',
        filter: true,
      },
      {
        field: 'UNIT_OF_MEASURE',
        editable: false,
        filter: true,
        headerName: t('UNIT OF MEASURE'),
        cellDataType: 'text',
      },
    ],
    [projectTasks, t]
  );
};
