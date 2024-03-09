import React, { FC, useEffect, useState } from 'react';
import { Tree, Typography, Input, Button } from 'antd';
import type { DataNode } from 'antd/lib/tree';
import { User, UserGroup } from '@/models/IUser';
import { faker } from '@faker-js/faker';

interface TreeDataNode extends DataNode {
  user?: User;
}
interface UserTreeProps {
  onUserSelect: (user: User) => void;
  usersGroup: UserGroup[] | [];
}

const UserTree: FC<UserTreeProps> = ({ onUserSelect, usersGroup }) => {
  const { Search } = Input;
  const [searchTerm, setSearchTerm] = useState('');
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [filteredTreeData, setFilteredTreeData] = useState<TreeDataNode[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    setTreeData(renderTreeNodes(usersGroup));
    setFilteredTreeData(renderTreeNodes(usersGroup));
  }, [usersGroup]);

  const renderTreeNodes = (data: UserGroup[]): TreeDataNode[] => {
    return data.map((group) => ({
      title: group.title,
      key: group.id,
      children: group.users?.map(
        (user: { firstName: any; lastName: any; id: any }) => ({
          title: `${user.firstName} ${user.lastName}`,
          key: user.id,
          user: user,
        })
      ),
    }));
  };

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    setSelectedKeys(selectedKeys);
    const selectedNode = info.selectedNodes[0] as TreeDataNode;
    if (selectedNode && selectedNode.user) {
      onUserSelect(selectedNode.user);
    }
  };

  const onExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filteredData = searchTree(treeData, value);
    setFilteredTreeData(filteredData);
    setCurrentIndex(-1);
    findNextMatchingUser(filteredData, value);
  };

  const searchTree = (nodes: TreeDataNode[], term: string): TreeDataNode[] => {
    return nodes.map((node) => {
      let filteredChildren = node.children;
      if (term) {
        filteredChildren = node.children?.filter((child) => {
          return (
            child.title &&
            typeof child.title === 'string' &&
            child.title.toLowerCase().includes(term.toLowerCase())
          );
        });
      }
      return { ...node, children: filteredChildren };
    });
  };

  const findNextMatchingUser = (nodes: any[], term: string) => {
    if (term) {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.children) {
          for (let j = 0; j < node.children.length; j++) {
            const child = node.children[j];
            if (
              child.title &&
              typeof child.title === 'string' &&
              child.title.toLowerCase().includes(term.toLowerCase()) &&
              child.user
            ) {
              setCurrentIndex(i);
              setSelectedKeys([child.key as string]);
              setExpandedKeys((prevKeys) => [...prevKeys, node.key]);
              onUserSelect(child.user);
              return;
            }
          }
        }
      }
    }
  };

  const handleNextUser = () => {
    if (searchTerm) {
      const nextIndex = (currentIndex + 1) % filteredTreeData.length;
      setCurrentIndex(nextIndex);
      findNextMatchingUser(filteredTreeData.slice(nextIndex), searchTerm);
    }
  };

  return (
    <div className="flex flex-col gap-2 py-3">
      <Search
        size="small"
        allowClear
        onChange={(e) => handleSearch(e.target.value)}
        onSearch={handleSearch}
        enterButton
        onPressEnter={handleNextUser}
      />
      <Tree
        showLine
        onSelect={onSelect}
        onExpand={onExpand}
        height={680}
        treeData={filteredTreeData}
        selectedKeys={selectedKeys}
        expandedKeys={expandedKeys}
      />
    </div>
  );
};

export default UserTree;
