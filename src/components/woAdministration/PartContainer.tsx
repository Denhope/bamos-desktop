import { Empty } from 'antd';
import React, { FC, useMemo } from 'react';
import PartsTable from '../shared/Table/PartsTable';
import { IPartNumber } from '@/models/IUser';
import { ColDef } from 'ag-grid-community';
type ExampleComponentProps = {
  columnDefs: ColDef[];
  partNumbers: IPartNumber[] | [];
  taskId?: string;
  fetchData?: IPartNumber[] | [];
  onUpdateData: (data: any[]) => void;
  height: string;
  isAddVisiable?: boolean;
  isButtonVisiable?: boolean;
  isEditable?: boolean;
  pagination?: boolean;
  onRowSelect?: (rowData: any | null) => void;

  rowData?: any[];
};
const PartContainer: FC<ExampleComponentProps> = ({
  columnDefs,
  partNumbers,
  height,
  rowData,
  isButtonVisiable = true,
  isEditable = true,
  isAddVisiable,
  pagination,
  onRowSelect,
}) => {
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
  console.log(rowData);
  return (
    <div>
      {/* <Empty></Empty> */}
      <div style={containerStyle}>
        <div style={gridStyle} className={'ag-theme-alpine'}>
          <PartsTable
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
            onCellValueChanged={function (params: any): void {}} // onAddRow={onAddRow}
            onRowSelect={function (rowData: any): void {
              onRowSelect && onRowSelect(rowData);
            }}
            onCheckItems={function (selectedKeys: React.Key[]): void {}} // onDelete={onDelete}
            // onSave={onSave}
            // onCellValueChanged={onCellValueChanged}
          />
        </div>
      </div>
    </div>
  );
};

export default PartContainer;
