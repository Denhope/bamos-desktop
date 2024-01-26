import React, { useState } from 'react';
import { Menu, Dropdown, Button, MenuProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { ColumnsType } from 'antd/es/table';
import SubMenu from 'antd/es/menu/SubMenu';
import MenuItem from 'antd/es/menu/MenuItem';
type MenuItem = Required<MenuProps>['items'][number];
function getItem(
  label: React.ReactNode,
  key?: React.Key | null,
  icon?: React.ReactNode,
  children?: any[],
  type?: 'group'
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}
interface NavigationProps {
  onMenuClick(e: { key: React.Key }): void;
  columns: any;
  selectedColumns: any;
  data: any;
  menuItems: MenuItem[];
  selectedRows: any[]; // добавляем новое свойство
  onMenuClick(e: { key: React.Key }): void;
  sortOptions: { label: string; value: string }[];
  isSorting: boolean;
  style?: any;
  isView?: boolean;
}
const NavigationPanel = ({
  onMenuClick,
  columns,
  selectedColumns,
  data,
  menuItems,
  selectedRows,
  sortOptions,
  isSorting,
  isView,
  style,
}: NavigationProps) => {
  const [visible, setVisible] = useState(false);
  const handleVisibleChange = (flag: boolean) => {
    setVisible(flag);
  };

  const columnMenu = (
    <Menu onClick={onMenuClick}>
      {columns.map((column: any) => (
        <Menu.Item key={column.key}>
          <input
            type="checkbox"
            checked={selectedColumns.includes(column.key)}
            readOnly
          />
          {column.title}
        </Menu.Item>
      ))}
    </Menu>
  );
  const sortMenu = (
    <Menu>
      {sortOptions.map((option) => (
        <Menu.Item key={option.value}>{option.label}</Menu.Item>
      ))}
    </Menu>
  );

  // Recursive function to generate menu items and submenus
  const generateMenuItems = (items: any[]) => {
    return items.map((item) => {
      if (item.children) {
        return (
          <SubMenu key={item.key} title={item.label} icon={item.icon}>
            {generateMenuItems(item.children)}
          </SubMenu>
        );
      } else {
        return (
          <MenuItem key={item.key} icon={item.icon} onClick={item.onClick}>
            {item.label}
          </MenuItem>
        );
      }
    });
  };
  return (
    <div className="" style={style}>
      <Menu
        mode="horizontal"
        style={{
          // marginLeft: 'auto',
          background: 'rgba(255, 255, 255, 00)',
        }}
      >
        {isView && (
          <Menu.SubMenu title="VIEWS" onTitleClick={() => setVisible(!visible)}>
            <Menu.ItemGroup title="Columns">{columnMenu}</Menu.ItemGroup>
          </Menu.SubMenu>
        )}

        {isSorting && <Menu.SubMenu title="Sort">{sortMenu}</Menu.SubMenu>}
        {generateMenuItems(menuItems)}
      </Menu>
    </div>
  );
};

export default NavigationPanel;
