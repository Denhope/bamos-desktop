import React, { FC, useState, useEffect, useMemo } from 'react';
import { Tree, Input } from 'antd';
import type { DataNode } from 'antd/lib/tree';
import { UserGroup } from '@/models/IUser'; // Убедитесь, что вы импортировали правильный тип UserGroup
import CustomTree from '../zoneCodeAdministration/CustomTree';

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

  const convertToTreeData = (userGroups: UserGroup[]): TreeDataNode[] => {
    return userGroups.map((userGroup) => ({
      title: userGroup.title,
      key: userGroup.id,
      usersGroup: userGroup,
    }));
  };

  useEffect(() => {
    setTreeData(convertToTreeData(usersGroup));
  }, [usersGroup]);

  const filteredTreeData = useMemo(() => {
    if (!searchQuery) {
      return treeData;
    }
    return treeData.filter((node) => {
      if (typeof node.title === 'string') {
        return node.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return false;
    });
  }, [treeData, searchQuery]);

  const handleEnterPress = () => {
    if (filteredTreeData.length === 0) return;

    if (selectedIndex === -1) {
      setSelectedIndex(0);
    } else {
      setSelectedIndex(
        (prevIndex) => (prevIndex + 1) % filteredTreeData.length
      );
    }

    const selectedGroup = filteredTreeData[selectedIndex].usersGroup;
    if (selectedGroup) {
      onUsersGroupSelect(selectedGroup);
    }
  };

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
    <div className="flex flex-col gap-2 ">
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
        onPressEnter={handleEnterPress}
      />

      <CustomTree
        checkable={false}
        treeData={filteredTreeData}
        onSelect={(selectedKeys, info) => {
          const userGroup = usersGroup.find(
            (group) => group.id === selectedKeys[0]
          );
          if (userGroup) {
            onUsersGroupSelect(userGroup);
          }
        }}
        height={680}
        searchQuery={searchQuery}
      />
      {/* <Tree
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
      </Tree> */}
    </div>
  );
};

export default UserGroupTree;
