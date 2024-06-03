import React, { FC, useState, useEffect, useMemo } from 'react';
import { Tree, Input } from 'antd';
import type { DataNode } from 'antd/lib/tree';
// Убедитесь, что вы импортировали правильный тип plane
import CustomTree from '../zoneCodeAdministration/CustomTree';

interface TreeDataNode extends DataNode {
  plane?: any;
}

interface UserTreeProps {
  onPlaneselect: (plane: any) => void;
  planes: any[] | [];
}

const { Search } = Input;

const ACAdministrationTree: FC<UserTreeProps> = ({ onPlaneselect, planes }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  const convertToTreeData = (planes: any[]): TreeDataNode[] => {
    return planes.map((plane) => ({
      title: String(plane.regNbr).toUpperCase(),
      key: plane.id,
      plane: plane,
    }));
  };

  useEffect(() => {
    setTreeData(convertToTreeData(planes));
  }, [planes]);

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

    const selectedGroup = filteredTreeData[selectedIndex].plane;
    if (selectedGroup) {
      onPlaneselect(selectedGroup);
    }
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
          const plane = planes.find((plane) => plane.id === selectedKeys[0]);
          if (plane) {
            onPlaneselect(plane);
          }
        }}
        height={660}
        searchQuery={searchQuery}
        selectedKeys={[]}
      />
    </div>
  );
};

export default ACAdministrationTree;
