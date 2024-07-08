import React, { FC, useState, useEffect, useMemo } from 'react';
import { Tree, Input, Empty } from 'antd';
import type { DataNode } from 'antd/lib/tree';
import { IProjectItemWO } from '@/models/AC';
import CustomTree from '../userAdministration/zoneCodeAdministration/CustomTree';

// Убедитесь, что вы импортировали правильный тип project

interface TreeDataNode extends DataNode {
  project?: IProjectItemWO;
}

interface UserTreeProps {
  onProjectSelect: (project: IProjectItemWO) => void;
  onCheckItems?: (selectedKeys: React.Key[]) => void;
  projects: IProjectItemWO[] | [];
  isLoading?: boolean;
}

const { TreeNode } = Tree;
const { Search } = Input;

const WOTree: FC<UserTreeProps> = ({
  onProjectSelect,
  projects,
  onCheckItems,
  isLoading,
}) => {
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
      const title = `№:${requirement?.taskWO} -/${
        requirement?.taskId?.taskNumber || requirement?.taskNumber || ''
      }(${requirement?.title || ''}/${
        requirement?.partNumberID?.PART_NUMBER || ''
      })${statusIndicator}/${requirement?.qty || ''}${
        requirement?.partNumberID?.UNIT_OF_MEASURE ||
        requirement?.taskDescription ||
        ''
      }`;
      // const children = [
      //   {
      //     title: `STATUS: ${requirement.status}`,
      //     key: `${requirement._id!.toString()}-status`,
      //     requirement,
      //     color: getColor(requirement),
      //   },
      //   {
      //     title: `DESCRIPTION: ${requirement.remarks || ''}`,
      //     key: `${requirement._id!.toString()}-description`,
      //     requirement,
      //     color: getColor(requirement),
      //   },
      //   // Добавьте другие вложенные поля, если они есть
      // ];
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
      {projects ? (
        <>
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
            isLoading={isLoading}
            treeData={filteredTreeData}
            checkable={true}
            isAllChecked
            searchQuery={searchQuery}
            height={560}
            onCheckItems={(selectedKeys: any[]) => {
              // console.log(selectedKeys);
              return onCheckItems && onCheckItems(selectedKeys);
            }}
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
        </>
      ) : (
        <Empty></Empty>
      )}
    </div>
  );
};

export default WOTree;
