import React, { FC, useState, useEffect, useMemo } from 'react';
import { Tree, Input } from 'antd';
import type { DataNode } from 'antd/lib/tree';
import { IProject } from '@/models/IProject';
import CustomTree from '../userAdministration/zoneCodeAdministration/CustomTree';

// Убедитесь, что вы импортировали правильный тип project

interface TreeDataNode extends DataNode {
  project?: IProject;
}

interface UserTreeProps {
  onProjectSelect: (project: IProject) => void;
  projects: IProject[] | [];
  onCheckItems?: (selectedKeys: React.Key[]) => void;
  isLoading?: boolean;
}

const { TreeNode } = Tree;
const { Search } = Input;

const ProjectTree: FC<UserTreeProps> = ({
  onCheckItems,
  onProjectSelect,
  projects,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  const convertToTreeData = (companys: IProject[]): TreeDataNode[] => {
    return companys.map((project) => ({
      title: project.projectName,
      key: project.id || project._id,
      project: project,
    }));
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
        isLoading={isLoading}
        onCheckItems={(selectedKeys: any[]) => {
          // console.log(selectedKeys);
          return onCheckItems && onCheckItems(selectedKeys);
        }}
        // showLine
        height={680}
        treeData={filteredTreeData}
        // defaultExpandedKeys={['group1']}
        onSelect={(selectedKeys, info) => {
          const project = projects.find(
            (project) => project._id === selectedKeys[0]
          );
          if (project) {
            onProjectSelect(project);
          }
        }}
        checkable={false}
        searchQuery={searchQuery}
      >
        {/* {renderTreeNodes(filteredTreeData)} */}
      </CustomTree>
    </div>
  );
};

export default ProjectTree;
