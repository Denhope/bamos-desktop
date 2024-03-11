import { IACType, IMaintenanceType } from '@/models/AC';
import { Input } from 'antd';
import Tree, { DataNode } from 'antd/es/tree';
import React, { FC, useEffect, useMemo, useState } from 'react';

interface TreeDataNode extends DataNode {
  maintenanceType?: IMaintenanceType;
}
interface MaintenanceTypeProps {
  onMaintananceTypeSelect: (vendor: IMaintenanceType) => void;
  maintenanceTypes: IMaintenanceType[] | [];
}
const { TreeNode } = Tree;
const { Search } = Input;
const MaintenanceTypeTree: FC<MaintenanceTypeProps> = ({
  maintenanceTypes,
  onMaintananceTypeSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const convertToTreeData = (
    maintenanceTypes: IMaintenanceType[]
  ): TreeDataNode[] => {
    return maintenanceTypes.map((maintenanceType) => ({
      title: String(maintenanceType.name).toUpperCase(),
      key: maintenanceType.id,
      maintenanceType: maintenanceType,
    }));
  };
  useEffect(() => {
    setTreeData(convertToTreeData(maintenanceTypes));
  }, [maintenanceTypes]);
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

    const selectedGroup = filteredTreeData[selectedIndex].maintenanceType;
    if (selectedGroup) {
      onMaintananceTypeSelect(selectedGroup);
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
      <Tree 
        showLine
        height={660}
        defaultExpandedKeys={['group1']}
        onSelect={(selectedKeys, info) => {
          const maintenanceType = maintenanceTypes.find(
            (maintenanceType) => maintenanceType.id === selectedKeys[0]
          );
          if (maintenanceType) {
            onMaintananceTypeSelect(maintenanceType);
          }
        }}
      >
        {renderTreeNodes(filteredTreeData)}
      </Tree>
    </div>
  );
};

export default MaintenanceTypeTree;
