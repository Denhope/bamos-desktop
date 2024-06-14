import React, { useState, useEffect } from 'react';
import { Checkbox, Tree, Space } from 'antd'; // Импортируем Space из antd
import type { DataNode } from 'antd/lib/tree';
import { useTranslation } from 'react-i18next';

interface CustomTreeProps {
  treeData: DataNode[];
  onSelect: (selectedKeys: React.Key[], info: any) => void;
  onCheckItems?: (checkedKeys: React.Key[]) => void;
  isAllChecked?: boolean;
  height: number;
  checkable: boolean;
  searchQuery: string;
  selectedKeys?: React.Key[];
}

const highlightText = (text: string, query: string) => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i}>{part}</mark> : part
  );
};

const CustomTree: React.FC<CustomTreeProps> = ({
  treeData,
  onSelect,
  height,
  checkable,
  searchQuery,
  onCheckItems,
  isAllChecked,
  selectedKeys: propSelectedKeys,
}) => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [filteredTreeData, setFilteredTreeData] =
    useState<DataNode[]>(treeData);
  const { t } = useTranslation();

  useEffect(() => {
    if (propSelectedKeys !== undefined) {
      setSelectedKeys(propSelectedKeys);
    }
  }, [propSelectedKeys]);

  useEffect(() => {
    const searchTreeData = (data: DataNode[]): DataNode[] => {
      return data.map((node) => {
        let title = node.title;
        if (typeof title === 'string') {
          title = highlightText(title, searchQuery);
        }
        const children = node.children ? searchTreeData(node.children) : [];
        return { ...node, title, children };
      });
    };
    setFilteredTreeData(searchQuery ? searchTreeData(treeData) : treeData);
  }, [treeData, searchQuery]);

  const onExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const onNodeSelect = (selectedKeysValue: React.Key[], info: any) => {
    setSelectedKeys(selectedKeysValue);
    onSelect(selectedKeysValue, info);
  };

  const selectAllKeys = () => {
    const allKeys = getAllKeys(treeData);
    setSelectedKeys(allKeys);
    onCheckItems && onCheckItems(allKeys);
  };

  const getAllKeys = (nodes: DataNode[]): React.Key[] => {
    let keys: React.Key[] = [];
    nodes.forEach((node) => {
      keys.push(node.key);
      if (node.children) {
        keys = keys.concat(getAllKeys(node.children));
      }
    });
    return keys;
  };

  const numTotal = getAllKeys(treeData).length;
  const numSelected = selectedKeys.length;

  const [isCheckAll, setIsCheckAll] = useState<boolean>(false);

  const onCheck = (checkedKeysValue: any) => {
    setSelectedKeys(checkedKeysValue);
    onCheckItems && onCheckItems(checkedKeysValue);
    setIsCheckAll(checkedKeysValue.length === numTotal);
  };

  const onCheckAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      selectAllKeys();
    } else {
      setSelectedKeys([]);
      onCheckItems && onCheckItems([]);
    }
    setIsCheckAll(e.target.checked);
  };

  return (
    <>
      <Space>
        {isAllChecked && filteredTreeData.length > 0 && (
          <>
            <Checkbox onChange={onCheckAllChange} checked={isCheckAll}>
              {t('SELECT ALL')}
            </Checkbox>
            <div>
              {t('Total')}: {numTotal}, {t('Selected')}: {numSelected}
            </div>
          </>
        )}
      </Space>

      <Tree
        checkable={checkable}
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        onCheck={onCheck}
        checkedKeys={selectedKeys}
        onSelect={onNodeSelect}
        selectedKeys={selectedKeys}
        treeData={filteredTreeData}
        showLine
        height={height}
        style={{ '--tree-selected-bg': 'orange' } as React.CSSProperties} // Изменяем цвет выделения
      />
    </>
  );
};

export default CustomTree;
