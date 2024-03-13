import React, { FC, useState, useEffect, useMemo } from 'react';
import { Tree, Input } from 'antd';
import type { DataNode } from 'antd/lib/tree';

import { IACType } from '@/models/AC';
import CustomTree from '../zoneCodeAdministration/CustomTree';

interface TreeDataNode extends DataNode {
  acType?: IACType;
}

interface UserTreeProps {
  onACTypeSelect: (acType: IACType) => void;
  acTypes: IACType[] | [];
}

const { TreeNode } = Tree;
const { Search } = Input;

const ACTypesTree: FC<UserTreeProps> = ({ onACTypeSelect, acTypes }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  const convertToTreeData = (acTypes: IACType[]): TreeDataNode[] => {
    return acTypes.map((acType) => ({
      title: String(acType.name).toUpperCase(),
      key: acType.id,
      acType: acType,
    }));
  };

  useEffect(() => {
    setTreeData(convertToTreeData(acTypes));
  }, [acTypes]);

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

    const selectedGroup = filteredTreeData[selectedIndex].acType;
    if (selectedGroup) {
      onACTypeSelect(selectedGroup);
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
    <div className="flex flex-col  ">
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
          const acType = acTypes.find(
            (acType) => acType.id === selectedKeys[0]
          );
          if (acType) {
            onACTypeSelect(acType);
          }
        }}
        height={660}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default ACTypesTree;
