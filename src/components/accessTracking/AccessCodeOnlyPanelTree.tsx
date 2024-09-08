import React, { FC, useEffect, useMemo, useState } from 'react';
import { Tree, Typography, Input } from 'antd';
import type { DataNode } from 'antd/lib/tree';

import { IAccessCode } from '@/models/ITask';
import CustomTree from '../userAdministration/zoneCodeAdministration/CustomTree';

interface TreeDataNode extends DataNode {
  accessCode?: IAccessCode;
}

interface ZoneTreeProps {
  onCheckItems?: (selectedKeys: React.Key[]) => void;
  onZoneCodeSelect: (zoneCode: IAccessCode) => void;
  accessCode: IAccessCode[] | [];
  isLoading?: boolean;
}

const AccessCodeOnlyPanelTree: FC<ZoneTreeProps> = ({
  onZoneCodeSelect,
  accessCode,
  onCheckItems,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]); // Добавлено
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const { Search } = Input;
  const { TreeNode } = Tree;

  const convertToTreeData = (accessCode: any[]): TreeDataNode[] => {
    return accessCode.map((access) => {
      const accessIndicator =
        access.status === 'open'
          ? ' 🔴(OPEN)' + `///L:(${access.accessProjectNumber})`
          : access.status === 'inspected'
          ? ' 🟢🟢(INSPECTION)' + `///L:(${access.accessProjectNumber})`
          : access.status === 'draft'
          ? ' ⚪(DRAFT)' + `///L:(${access.accessProjectNumber})`
          : ' 🟢(CLOSED)' + `///L:(${access.accessProjectNumber})`;

      const node = {
        title: `${String(access.accessNbr).toUpperCase()}-${String(
          access.accessDescription
        ).toUpperCase()}${accessIndicator}`,
        key: access._id,
        accessCode: access,
      };

      return node;
    });
  };

  useEffect(() => {
    setTreeData(convertToTreeData(accessCode));
  }, [accessCode]);

  const filterTreeData = (
    treeData: TreeDataNode[],
    searchQuery: string
  ): TreeDataNode[] => {
    return treeData.reduce((acc: TreeDataNode[], node) => {
      const title = String(node.title).toLowerCase();
      const query = searchQuery.toLowerCase();

      if (title.includes(query)) {
        const filteredChildren = node.children
          ? filterTreeData(node.children, searchQuery)
          : [];
        acc.push({ ...node, children: filteredChildren });
      } else if (node.children) {
        const filteredChildren = filterTreeData(node.children, searchQuery);
        if (filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren });
        }
      }

      return acc;
    }, []);
  };

  const filteredTreeData = useMemo(() => {
    if (!searchQuery) {
      return treeData;
    }
    return filterTreeData(treeData, searchQuery);
  }, [treeData, searchQuery]);

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const handleEnterPress = () => {
    if (filteredTreeData.length === 0) return;

    const nextIndex =
      selectedIndex === filteredTreeData.length - 1 ? 0 : selectedIndex + 1;
    setSelectedIndex(nextIndex);

    const selectedGroup = filteredTreeData[nextIndex].accessCode;
    if (selectedGroup) {
      const newSelectedKeys = [...selectedKeys, selectedGroup._id]; // Добавляем новый ключ в массив selectedKeys
      setSelectedKeys(newSelectedKeys); // Обновляем состояние selectedKeys
      onZoneCodeSelect(selectedGroup);
    }
  };

  const renderTreeNodes = (data: TreeDataNode[]) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.title} key={item.key} />;
    });
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Отменяем действие по умолчанию
      event.stopPropagation(); // Останавливаем дальнейшую передачу события
      handleEnterPress(); // Вызываем функцию handleEnterPress при нажатии Enter
    }
  };
  return (
    <div>
      <Search
        size="small"
        allowClear
        onSearch={(value) => {
          setSearchQuery(value);
          handleEnterPress();
        }}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: 8 }}
        enterButton
        onKeyDown={handleKeyDown}
        onPressEnter={handleEnterPress}
      />

      <CustomTree
        isLoading={isLoading}
        isAllChecked={true}
        checkable={true}
        treeData={filteredTreeData}
        onSelect={(selectedKeys, info) => {
          setSelectedKeys(selectedKeys); // Установите выбранный ключ
          onCheckItems && onCheckItems(selectedKeys);
          const access = accessCode.find(
            (accessCodeItem) => accessCodeItem._id === selectedKeys[0]
          );
          if (access) {
            onZoneCodeSelect(access);
          }
        }}
        height={560}
        searchQuery={searchQuery}
        onCheckItems={(selectedKeys: any[]) => {
          setSelectedKeys(selectedKeys); // Установите выбранные ключи при выборе элементов
          console.log(selectedKeys);
          return onCheckItems && onCheckItems(selectedKeys);
        }}
        selectedKeys={selectedKeys} // Передайте selectedKeys в CustomTree
      />
    </div>
  );
};

export default AccessCodeOnlyPanelTree;
