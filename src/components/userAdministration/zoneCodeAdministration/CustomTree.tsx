import React, { useState, useEffect } from 'react';
import { Tree } from 'antd';
import type { DataNode } from 'antd/lib/tree';

interface CustomTreeProps {
  treeData: DataNode[];
  onSelect: (selectedKeys: React.Key[], info: any) => void;
  height: number;
  checkable: boolean;
  searchQuery: string;
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
}) => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [filteredTreeData, setFilteredTreeData] =
    useState<DataNode[]>(treeData);

  useEffect(() => {
    if (searchQuery) {
      const searchTreeData = (data: DataNode[]): DataNode[] => {
        return data.map((node) => {
          const title = highlightText(node.title as string, searchQuery);
          const children = node.children ? searchTreeData(node.children) : [];
          return { ...node, title, children };
        });
      };
      setFilteredTreeData(searchTreeData(treeData));
    } else {
      setFilteredTreeData(treeData);
    }
  }, [treeData, searchQuery]);

  const onExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const onCheck = (checkedKeysValue: any) => {
    setSelectedKeys(checkedKeysValue);
  };

  const onNodeSelect = (selectedKeysValue: React.Key[], info: any) => {
    setSelectedKeys(selectedKeysValue);
    onSelect(selectedKeysValue, info);
  };

  return (
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
  );
};

export default CustomTree;
