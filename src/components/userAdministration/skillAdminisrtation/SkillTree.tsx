import React, { FC, useState, useEffect, useMemo } from 'react';
import { Tree, Input } from 'antd';
import type { DataNode } from 'antd/lib/tree';

import { IRequirementType } from '@/models/AC';
import CustomTree from '../zoneCodeAdministration/CustomTree';
import { ISkill } from '@/models/IUser';

interface TreeDataNode extends DataNode {
  reqType?: ISkill;
}

interface UserTreeProps {
  onSkillSelect: (acType: ISkill) => void;
  skills: ISkill[] | [];
}

const { TreeNode } = Tree;
const { Search } = Input;

const SkillsTree: FC<UserTreeProps> = ({ onSkillSelect, skills }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  const convertToTreeData = (skills: ISkill[]): TreeDataNode[] => {
    return skills.map((acType) => ({
      title: String(acType.code).toUpperCase(),
      key: acType.id,
      acType: acType,
    }));
  };

  useEffect(() => {
    setTreeData(convertToTreeData(skills));
  }, [skills]);

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

    const selectedGroup = filteredTreeData[selectedIndex].reqType;
    if (selectedGroup) {
      onSkillSelect(selectedGroup);
    }
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
          const acType = skills.find((acType) => acType.id === selectedKeys[0]);
          if (acType) {
            onSkillSelect(acType);
          }
        }}
        height={660}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default SkillsTree;
