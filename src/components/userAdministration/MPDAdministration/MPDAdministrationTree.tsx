import React, { FC, useEffect, useMemo, useState } from 'react';
import { Tree, Typography, Input, Button } from 'antd';
import type { DataNode } from 'antd/lib/tree';

import { IMPD } from '@/models/ITask';
import CustomTree from '../zoneCodeAdministration/CustomTree';

interface TreeDataNode extends DataNode {
  taskCode?: IMPD;
}
interface UserTreeProps {
  onMPDCodeSelect: (user: IMPD) => void;
  MPDCodes: IMPD[] | [];
}
const { Text } = Typography;
const { TreeNode } = Tree;
const { Search } = Input;

const MPDAdministrationTree: FC<UserTreeProps> = ({
  onMPDCodeSelect,
  MPDCodes,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  const convertToTreeData = (MPDCodes: IMPD[]): TreeDataNode[] => {
    return MPDCodes.map((taskCode) => ({
      title: `${taskCode.code.toUpperCase()} - ${taskCode.description.toUpperCase()}`,
      key: taskCode.id,
      taskCode: taskCode,
    }));
  };

  useEffect(() => {
    setTreeData(convertToTreeData(MPDCodes));
  }, [MPDCodes]);

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

    const selectedGroup = filteredTreeData[selectedIndex].taskCode;
    if (selectedGroup) {
      onMPDCodeSelect(selectedGroup);
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
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Отменяем действие по умолчанию
      event.stopPropagation(); // Останавливаем дальнейшую передачу события
    }
  };
  return (
    <div className="flex flex-col  ">
      <Search
        size="small"
        allowClear
        onSearch={(value) => {
          setSearchQuery(value);
          // handleEnterPress();
        }}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: 8 }}
        enterButton
        // onPressEnter={handleEnterPress}
        onKeyDown={handleKeyDown}
      />
      <CustomTree
        checkable={false}
        treeData={filteredTreeData}
        onSelect={(selectedKeys, info) => {
          const userGroup = MPDCodes.find(
            (group) => group.id === selectedKeys[0]
          );
          if (userGroup) {
            onMPDCodeSelect(userGroup);
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
          const userGroup = MPDCodes.find(
            (group) => group.id === selectedKeys[0]
          );
          if (userGroup) {
            onMPDCodeSelect(userGroup);
          }
        }}
      >
        {renderTreeNodes(filteredTreeData)}
      </Tree> */}
    </div>
  );
};

export default MPDAdministrationTree;
