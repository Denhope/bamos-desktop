import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/lib/table';

interface DataType {
  key: React.Key;
  [key: string]: any;
}

interface TableProps {
  columns: ColumnsType<DataType>;
  data?: DataType[];
}

const TableComponent: React.FC<TableProps> = ({ columns, data }) => {
  return (
    <div className="flex-grow overflow-auto">
      <Table
        bordered
        columns={columns}
        dataSource={data}
        pagination={false}
        className="w-full p-0 y-0"
        scroll={{ y: '57vh' }} // Устанавливаем высоту скролла равную 100%
      />
    </div>
  );
};

export default TableComponent;
