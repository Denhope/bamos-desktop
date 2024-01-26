import Table, { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

interface DataType {
  key: React.Key;
  [key: string]: any;
}
interface MyTableProps {
  data: DataType[];
  columns: ColumnsType<DataType>;
}
const MyTable = ({ data, columns }: MyTableProps) => {
  const [selectedColumns, setSelectedColumns] = useState(
    columns.map((column) => column.key)
  );
  const handleMenuClick = (e: { key: React.Key }) => {
    if (selectedColumns.includes(e.key)) {
      setSelectedColumns(selectedColumns.filter((key) => key !== e.key));
    } else {
      setSelectedColumns([...selectedColumns, e.key]);
    }
  };
  return (
    <div>
      {/* <Navigation onMenuClick={handleMenuClick} columns={columns} /> */}
      <Table
        columns={columns.filter((column) =>
          selectedColumns.includes(column.key)
        )}
        dataSource={data}
      />
    </div>
  );
};
export default MyTable;
