import React, { useState, useEffect } from 'react';
import { Checkbox, Tree } from 'antd';
import type { DataNode } from 'antd/lib/tree';
import { useTranslation } from 'react-i18next';

interface CustomTreeProps {
  treeData: DataNode[];
  onSelect: (selectedKeys: React.Key[], info: any) => void;
  onCheckItems?: (selectedKeys: React.Key[]) => void;
  isAllChecked?: boolean;
  height: number;
  checkable: boolean;
  searchQuery: string;
  selectedKeys: React.Key[];
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
  selectedKeys: propSelectedKeys, // Изменено
}) => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [filteredTreeData, setFilteredTreeData] =
    useState<DataNode[]>(treeData);
  const { t } = useTranslation();

  useEffect(() => {
    setSelectedKeys(propSelectedKeys); // Обновление selectedKeys при изменении propSelectedKeys
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

  const [isCheckAll, setIsCheckAll] = useState<boolean>(false);

  const onCheck = (checkedKeysValue: any) => {
    setSelectedKeys(checkedKeysValue);
    onCheckItems && onCheckItems(checkedKeysValue);
    setIsCheckAll(checkedKeysValue.length === getAllKeys(treeData).length);
  };

  const onCheckAllChange = (e: any) => {
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
      {isAllChecked && filteredTreeData.length > 0 && (
        <Checkbox onChange={onCheckAllChange} checked={isCheckAll}>
          {t('SELECT ALL')}
        </Checkbox>
      )}
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
      />
    </>
  );
};

export default CustomTree;
