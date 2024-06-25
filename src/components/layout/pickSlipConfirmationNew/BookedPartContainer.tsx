import { Empty } from 'antd';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { IPartNumber } from '@/models/IUser';
import { ColDef } from 'ag-grid-community';
import PartsTable from '@/components/shared/Table/PartsTable';
type ExampleComponentProps = {
  columnDefs: ColDef[];
  partNumbers: IPartNumber[] | [];
  taskId?: string;
  fetchData?: any[] | [];
  onUpdateData: (data: any[]) => void;
  height: string;
  isAddVisiable?: boolean;
  isVisible?: boolean;
  isButtonVisiable?: boolean;
  isEditable?: boolean;
  pagination?: boolean;
  onRowSelect?: (rowData: any | null) => void;
  isButtonColumn?: boolean;
  isChekboxColumn?: boolean;
  isFilesVisiable?: boolean;
  rowClassRules?: any;

  // rowData?: any[];
};
const PartContainer: FC<ExampleComponentProps> = ({
  columnDefs,
  partNumbers,
  height,
  fetchData,
  isButtonVisiable = true,
  isEditable = true,
  isAddVisiable,
  isVisible = false,
  pagination,
  onRowSelect,
  isChekboxColumn,
  isButtonColumn,
  isFilesVisiable,
  rowClassRules,
  onUpdateData,
}) => {
  const [rowData, setRowData] = useState<any[]>([]);
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
  const onCellValueChanged = useCallback(
    (params: any) => {
      const updatedRow = params;
      console.log(params);
      const updatedData = rowData.map((row) =>
        row._id === updatedRow._id ? updatedRow : row
      );
      setRowData(updatedData);
      onUpdateData(updatedData);
    },
    [rowData, onUpdateData]
  );
  useEffect(() => {
    if (fetchData && fetchData.length > 0) {
      setRowData(fetchData);
      onUpdateData(fetchData);
    }
  }, [fetchData, onUpdateData]);
  return (
    <div style={containerStyle}>
      <div style={gridStyle} className={'ag-theme-alpine'}>
        <PartsTable
          rowClassRules={rowClassRules}
          isFilesVisiable={isFilesVisiable}
          isChekboxColumn={isChekboxColumn}
          isVisible={isVisible}
          isButtonColumn={isButtonColumn}
          pagination={pagination}
          isEditable={isEditable}
          isAddVisiable={isAddVisiable}
          isButtonVisiable={isButtonVisiable}
          height={height}
          // isLoading={isLoading}
          rowData={rowData || []}
          columnDefs={columnDefs}
          partNumbers={partNumbers}
          onAddRow={function (): void {}}
          onDelete={function (id: string): void {}}
          onSave={function (data: any): void {}}
          onCellValueChanged={onCellValueChanged} // onAddRow={onAddRow}
          onRowSelect={function (rowData: any): void {
            onRowSelect && onRowSelect(rowData);
          }}
          onCheckItems={function (selectedKeys: React.Key[]): void {}} // onDelete={onDelete}
          // onSave={onSave}
          // onCellValueChanged={onCellValueChanged}
        />
      </div>
    </div>
  );
};

export default PartContainer;
