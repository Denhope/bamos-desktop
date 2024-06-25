import React, { FC, useState, useEffect, useMemo } from 'react';
import { Tree, Input } from 'antd';
import type { DataNode } from 'antd/lib/tree';
import { ICompany } from '@/models/IUser'; // Убедитесь, что вы импортировали правильный тип company
import CustomTree from '../zoneCodeAdministration/CustomTree';
import { IRequirement } from '@/models/IRequirement';
import { SettingOutlined } from '@ant-design/icons';

interface TreeDataNode extends DataNode {
  color: any;
  requirement?: IRequirement;
}

interface UserTreeProps {
  onCompanySelect: (requirement: IRequirement) => void;
  requirements: IRequirement[] | [];
}

const { TreeNode } = Tree;
const { Search } = Input;

const RequirementTree: FC<UserTreeProps> = ({
  onCompanySelect,
  requirements,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const getColor = (requirement: IRequirement): string => {
    // Define your logic here to determine the color based on the status and nested value
    // For example, if you have a 'status' field and a 'nestedValue' field, you might do:
    if (requirement.status === 'open') {
      return 'red';
    } else if (requirement.status === 'inProgress') {
      return 'blue';
    } else {
      return 'default'; // Default color or color for other cases
    }
  };
  const convertToTreeData = (requirements: IRequirement[]): TreeDataNode[] => {
    return requirements.map((requirement) => {
      let statusIndicator = '';
      if (requirement.status === 'onQuatation') {
        statusIndicator = ' \u{1F7E1}'; // Оранжевый кружок
      } else if (requirement.status === 'open') {
        statusIndicator = ' 🔵'; // Красный кружок
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
      if (requirement.status === 'issued') {
        statusIndicator = '🟣'; // Серый квадрат
      }
      if (requirement.status === 'onShort') {
        statusIndicator = '🟠'; // Серый квадрат
      }
      const title = `№:${requirement?.partRequestNumberNew} -/(${requirement?.partNumberID?.PART_NUMBER})${statusIndicator}`;
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
        key: requirement._id!.toString(),
        requirement,
        // children,
        color: getColor(requirement),
      };
    });
  };

  useEffect(() => {
    setTreeData(convertToTreeData(requirements));
  }, [requirements]);

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
        (prevIndex: number) => (prevIndex + 1) % filteredTreeData.length
      );
    }

    const selectedGroup = filteredTreeData[selectedIndex].requirement;
    if (selectedGroup) {
      onCompanySelect(selectedGroup);
    }
  };

  const renderTreeNode = (node: DataNode): React.ReactNode => {
    // Cast the node to TreeDataNode to access the color property
    const treeNode = node as TreeDataNode;
    // Create an icon element with the correct color
    const icon = <SettingOutlined style={{ color: treeNode.color }} />;

    return (
      <TreeNode
        title={treeNode.title}
        key={treeNode.key}
        icon={icon} // Set the icon with the correct color
        className={
          treeNode.key === selectedIndex.toString()
            ? 'ant-tree-node-selected'
            : ''
        }
      />
    );
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
        checkable={true}
        treeData={filteredTreeData}
        onSelect={(selectedKeys, info) => {
          const requirement = requirements.find(
            (requirement) => requirement._id === selectedKeys[0]
          );
          if (requirement) {
            onCompanySelect(requirement);
            // console.log(requirement);
          }
        }}
        height={540}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default RequirementTree;
