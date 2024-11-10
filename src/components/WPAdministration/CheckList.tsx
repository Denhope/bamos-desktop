//@ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { useTranslation } from 'react-i18next';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
// import PDFExport from '../reports/ReportBase';
import PDFExport from '../shared/PDFExport';
import UniversalAgGrid from '../shared/UniversalAgGrid';

interface CheckListItem {
  id: string;
  taskNumber: string;
  description: string;
  checkStatus: 'draft' | 'checked' | 'onEdit' | 'success';
}

interface CheckListProps {
  tasks: any[];
  wo?: any;
  onStatusChange: (
    taskId: string,
    newStatus: CheckListItem['checkStatus']
  ) => void;
}

const CheckList: React.FC<CheckListProps> = ({ tasks, onStatusChange, wo }) => {
  const { t } = useTranslation();
  const [rowData, setRowData] = useState<CheckListItem[]>([]);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  useEffect(() => {
    const initialData = tasks.map((task) => ({
      id: task.id,
      taskNumber: task.taskNumber,
      taskWONumber: task.taskWONumber,
      taskWO: task.taskWO,
      description: task.taskDescription,
      checkStatus: task.checkStatus || 'draft',
    }));
    setRowData(initialData);
  }, [tasks]);

  const getStatusCellClass = (status: string) => {
    const statusClasses = {
      draft: 'bg-gray-100',
      checked: 'bg-blue-100',
      onEdit: 'bg-yellow-100',
      success: 'bg-green-100',
    };
    return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100';
  };

  const onCellValueChanged = (params: any) => {
    if (params.colDef.field === 'checkStatus') {
      onStatusChange(params.data.id, params.newValue);
    }
  };

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        field: 'taskWONumber',
        headerName: `${t('SEQ No')}`,
        filter: true,
        minWidth: 120,
        flex: 1,
      },
      {
        field: 'taskWO',
        headerName: `${t('TRACE No')}`,
        filter: true,
        minWidth: 100,
        flex: 1,
      },
      { field: 'taskNumber', headerName: t('TASK NUMBER'), flex: 1 },
      { field: 'description', headerName: t('DESCRIPTION'), flex: 2 },
      {
        field: 'checkStatus',
        headerName: t('CHECK STATUS'),
        minWidth: 200,
        width: 200, // Добавьте фиксированную ширину
        cellRenderer: (params: any) => {
          const status = params.value || 'draft';
          const color = getStatusCellClass(status);
          return (
            <div
              className={`${color} p-2 rounded w-full h-full flex items-center justify-center`}
            >
              {t(status.toUpperCase())}
            </div>
          );
        },
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['draft', 'checked', 'onEdit', 'success'],
        },
        editable: true,
        cellStyle: { overflow: 'visible' },
      },
    ],
    [t]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
    }),
    []
  );

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
  };

  const onFilterTextBoxChanged = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      gridApi?.setQuickFilter(event.target.value);
    },
    [gridApi]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between mb-4">
        <PDFExport
          title={t('CHECK LIST TASK REPORT')}
          filename={`check_list_task_report_wo_${wo?.WONumber || 'unknown'}_${
            new Date().toISOString().split('T')[0]
          }`}
          statistics={{
            WO: wo?.WONumber || '',
            Description: wo?.WOName || '',
            'AC Registration': wo?.planeId?.regNbr || '',
            'Total Tasks': rowData.length,
            'Checked Tasks': rowData.filter(
              (item) => item.checkStatus === 'checked'
            ).length,
          }}
          columnDefs={columnDefs}
          data={rowData}
          orientation="landscape"
        />
      </div>
      <div className="flex-grow ag-theme-alpine">
        <UniversalAgGrid
          gridId="checkList111"
          pagination={true}
          rowData={rowData}
          columnDefs={columnDefs}
          onCellValueChanged={onCellValueChanged}
        />
      </div>
    </div>
  );
};

export default CheckList;
