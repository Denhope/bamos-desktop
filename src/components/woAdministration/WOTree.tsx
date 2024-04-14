import React, { FC, useState, useEffect, useMemo } from 'react';
import { Tree, Input } from 'antd';
import type { DataNode } from 'antd/lib/tree';
import { IProjectItemWO } from '@/models/AC';
import CustomTree from '../userAdministration/zoneCodeAdministration/CustomTree';

// Убедитесь, что вы импортировали правильный тип project

interface TreeDataNode extends DataNode {
  project?: IProjectItemWO;
}

interface UserTreeProps {
  onProjectSelect: (project: IProjectItemWO) => void;
  projects: IProjectItemWO[] | [];
}

const { TreeNode } = Tree;
const { Search } = Input;

const WOTree: FC<UserTreeProps> = ({ onProjectSelect, projects }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  const convertToTreeData = (
    requirements: IProjectItemWO[]
  ): TreeDataNode[] => {
    return requirements.map((requirement) => {
      let statusIndicator = '';
      if (requirement.status === 'onQuatation') {
        statusIndicator = ' \u{1F7E1}'; // Оранжевый кружок
      } else if (requirement.status === 'open') {
        statusIndicator = ' \u{1F534}'; // Красный кружок
      } else if (requirement.status === 'transfer') {
        statusIndicator = ' \u{1F7E2}'; // Желтый кружок
      } else if (requirement.status === 'draft') {
        statusIndicator = ' ⚪'; // Серый квадрат
      }
      if (requirement.status === 'RECEIVED') {
        statusIndicator = ' 🟢'; // Оранжевый кружок
      }
      if (requirement.status === 'CLOSED') {
        statusIndicator = ' 🟢'; // Оранжевый кружок
      }
      if (requirement.status === 'closed') {
        statusIndicator = ' 🟢'; // Оранжевый кружок
      }
      if (requirement.status === 'PARTLY_RECEIVED') {
        statusIndicator = ' \u{1F7E1}'; // Оранжевый кружок
      }
      if (requirement.status === 'CANCELED') {
        statusIndicator = ' ⚪'; // Серый квадрат
      }
      if (requirement.status === 'CANCELLED') {
        statusIndicator = ' ⚪'; // Серый квадрат
      }
      if (requirement.status === 'onOrder') {
        statusIndicator = '🔵'; // Серый квадрат
      }
      if (requirement.status === 'onShort') {
        statusIndicator = '🟠'; // Серый квадрат
      }
      const title = `№:${requirement?.taskWO || requirement?.projectTaskWO} -/${
        requirement?.taskId?.taskNumber || ''
      }(${requirement?.title || ''}/${
        requirement?.taskId?.taskDescription || ''
      }/${requirement?.partNumberID?.PART_NUMBER || ''})${statusIndicator}`;

      return {
        title,
        key: requirement.id!.toString(),
        requirement,
      };
    });
  };

  useEffect(() => {
    setTreeData(convertToTreeData(projects));
  }, [projects]);

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

    const selectedGroup = filteredTreeData[selectedIndex].project;
    if (selectedGroup) {
      onProjectSelect(selectedGroup);
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
        treeData={filteredTreeData}
        checkable={true}
        searchQuery={searchQuery}
        height={590}
        onSelect={(selectedKeys, info) => {
          const project = projects.find(
            (project) => project.id === selectedKeys[0]
          );
          if (project) {
            onProjectSelect(project);
          }
        }}
      >
        {/* {renderTreeNodes(filteredTreeData)} */}
      </CustomTree>
    </div>
  );
};

export default WOTree;
