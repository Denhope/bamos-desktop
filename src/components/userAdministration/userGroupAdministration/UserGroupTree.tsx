import React, { FC, useState, useEffect, useMemo } from 'react';
import { Tree, Input } from 'antd';
import type { DataNode } from 'antd/lib/tree';
import { UserGroup } from '@/models/IUser'; // Убедитесь, что вы импортировали правильный тип UserGroup

interface TreeDataNode extends DataNode {
  usersGroup?: UserGroup;
}

interface UserTreeProps {
  onUsersGroupSelect: (userGroup: UserGroup) => void;
  usersGroup: UserGroup[] | [];
}

const { TreeNode } = Tree;
const { Search } = Input;

const UserGroupTree: FC<UserTreeProps> = ({
  onUsersGroupSelect,
  usersGroup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  // Функция для преобразования UserGroup в TreeDataNode
  const convertToTreeData = (userGroups: UserGroup[]): TreeDataNode[] => {
    return userGroups.map((userGroup) => ({
      title: userGroup.title,
      key: userGroup.id,
      usersGroup: userGroup,
    }));
  };

  // Обновляем treeData, когда usersGroup изменяется
  useEffect(() => {
    setTreeData(convertToTreeData(usersGroup));
  }, [usersGroup]);

  // Фильтруем treeData на основе searchQuery
  const filteredTreeData = useMemo(() => {
    if (!searchQuery) {
      return treeData;
    }
    return treeData.filter((node) => {
      // Проверяем, что title является строкой перед вызовом toLowerCase
      if (typeof node.title === 'string') {
        return node.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return false; // Если title не является строкой, игнорируем его
    });
  }, [treeData, searchQuery]);

  // Функция для обработки нажатия клавиши Enter
  const handleEnterPress = () => {
    if (filteredTreeData.length === 0) return;

    // Если группа не выбрана, выбираем первую
    if (selectedIndex === -1) {
      setSelectedIndex(0);
    } else {
      // Выбираем следующую группу в списке, переходя обратно к первой при необходимости
      setSelectedIndex(
        (prevIndex) => (prevIndex + 1) % filteredTreeData.length
      );
    }

    // Уведомляем родительский компонент о выбранной группе
    const selectedGroup = filteredTreeData[selectedIndex].usersGroup;
    if (selectedGroup) {
      onUsersGroupSelect(selectedGroup);
    }
  };

  // Функция для рекурсивного рендеринга узлов дерева
  const renderTreeNodes = (data: TreeDataNode[]) => {
    return data.map((item, index) => (
      <TreeNode
        title={item.title}
        key={item.key}
        className={index === selectedIndex ? 'ant-tree-node-selected' : ''}
      />
    ));
  };

  return (
    <div>
      <Search
        size="small"
        placeholder="Search groups"
        allowClear
        onSearch={(value) => {
          setSearchQuery(value);
          handleEnterPress(); // Выбираем первую группу, которая соответствует поисковому запросу
        }}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: 8 }}
        enterButton="Select Group"
        onPressEnter={handleEnterPress}
      />
      <Tree
        showLine
        height={680}
        defaultExpandedKeys={['group1']}
        onSelect={(selectedKeys, info) => {
          const userGroup = usersGroup.find(
            (group) => group.id === selectedKeys[0]
          );
          if (userGroup) {
            onUsersGroupSelect(userGroup);
          }
        }}
      >
        {renderTreeNodes(filteredTreeData)}
      </Tree>
    </div>
  );
};

export default UserGroupTree;
