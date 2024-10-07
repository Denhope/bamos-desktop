import React from 'react';
import { Checkbox, Popover, Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface ColumnManagerProps {
  columns: { field: string; headerName: string }[];
  visibleColumns: string[];
  onColumnVisibilityChange: (field: string, visible: boolean) => void;
}

const ColumnManager: React.FC<ColumnManagerProps> = ({
  columns,
  visibleColumns,
  onColumnVisibilityChange,
}) => {
  const { t } = useTranslation();

  const content = (
    <div>
      {columns.map((column) => (
        <div key={column.field}>
          <Checkbox
            checked={visibleColumns.includes(column.field)}
            onChange={(e) => onColumnVisibilityChange(column.field, e.target.checked)}
          >
            {column.headerName}
          </Checkbox>
        </div>
      ))}
    </div>
  );

  return (
    <Popover content={content} title={t('Manage Columns')} trigger="click">
      <Button icon={<SettingOutlined />}>{t('Manage Columns')}</Button>
    </Popover>
  );
};

export default ColumnManager;