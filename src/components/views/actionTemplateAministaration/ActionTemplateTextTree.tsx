import React, { FC, useState, useEffect, useMemo } from 'react';
import { Tree, Input } from 'antd';
import type { DataNode } from 'antd/lib/tree';
import { IProjectType } from '@/models/AC';
// Убедитесь, что вы импортировали правильный тип company

interface TreeDataNode extends DataNode {
  company?: IProjectType;
}

interface UserTreeProps {
  onCompanySelect: (company: IProjectType) => void;
  companies: IProjectType[] | [];
}

const { TreeNode } = Tree;
const { Search } = Input;

const ActionTemplateTextTree: FC<UserTreeProps> = ({
  onCompanySelect,
  companies,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  const convertToTreeData = (companys: IProjectType[]): TreeDataNode[] => {
    return companys.map((company) => ({
      title: company.code || company?.code,
      key: company.id,
      company: company,
    }));
  };

  useEffect(() => {
    setTreeData(convertToTreeData(companies));
  }, [companies]);

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

    const selectedGroup = filteredTreeData[selectedIndex].company;
    if (selectedGroup) {
      onCompanySelect(selectedGroup);
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
        height={680}
        defaultExpandedKeys={['group1']}
        onSelect={(selectedKeys, info) => {
          const company = companies.find(
            (company) => company.id === selectedKeys[0]
          );
          if (company) {
            onCompanySelect(company);
          }
        }}
      >
        {renderTreeNodes(filteredTreeData)}
      </Tree>
    </div>
  );
};

export default ActionTemplateTextTree;
