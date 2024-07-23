import React, { FC, useState, useEffect, useMemo } from 'react';
import { Tree, Input } from 'antd';
import type { DataNode } from 'antd/lib/tree';
import { ICompany } from '@/models/IUser'; // Убедитесь, что вы импортировали правильный тип company
import CustomTree from '../zoneCodeAdministration/CustomTree';
import { IRequirement } from '@/models/IRequirement';
import { SettingOutlined } from '@ant-design/icons';

interface TreeDataNode extends DataNode {
  color: any;
  requirement?: any;
}

interface UserTreeProps {
  onCompanySelect: (requirement: any) => void;
  pickSlips: any[] | [];
  isLoading?: boolean;
}

const { TreeNode } = Tree;
const { Search } = Input;

const PickSlipAdministrationTree: FC<UserTreeProps> = ({
  onCompanySelect,
  pickSlips,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const getColor = (requirement: any): string => {
    // Define your logic here to determine the color based on the state and nested value
    // For example, if you have a 'state' field and a 'nestedValue' field, you might do:
    if (requirement.state === 'open') {
      return 'red';
    } else if (requirement.state === 'inProgress') {
      return 'blue';
    } else {
      return 'default'; // Default color or color for other cases
    }
  };
  const convertToTreeData = (pickSlips: any[]): TreeDataNode[] => {
    return pickSlips.map((requirement) => {
      let stateIndicator = '';
      if (requirement.state === 'onQuatation') {
        stateIndicator = ' \u{1F7E1}'; // Оранжевый кружок
      } else if (requirement.state === 'open') {
        stateIndicator = ' 🔵'; // Красный кружок
      } else if (requirement.state === 'transfer') {
        stateIndicator = ' \u{1F7E2}'; // Желтый кружок
      } else if (requirement.state === 'draft') {
        stateIndicator = ' ⚪'; // Серый квадрат
      }
      if (requirement.state === 'RECEIVED') {
        stateIndicator = ' 🟢'; // Оранжевый кружок
      }
      if (requirement.state === 'CLOSED') {
        stateIndicator = ' 🟢'; // Оранжевый кружок
      }
      if (requirement.state === 'progress') {
        stateIndicator = ' 🟣'; // Оранжевый кружок
      }
      if (requirement.state === 'complete') {
        stateIndicator = ' 🟠'; // Оранжевый кружок
      }
      if (requirement.state === 'closed') {
        stateIndicator = ' 🟢'; // Оранжевый кружок
      }
      if (requirement.state === 'PARTLY_RECEIVED') {
        stateIndicator = ' \u{1F7E1}'; // Оранжевый кружок
      }
      if (requirement.state === 'canceled') {
        stateIndicator = '  \u{1F534}'; // Серый квадрат
      }
      if (requirement.state === 'CANCELLED') {
        stateIndicator = '  \u{1F534}'; // Серый квадрат
      }
      if (requirement.state === 'partlyCanceled') {
        stateIndicator = '  \u{1F534}'; // Серый квадрат
      }
      if (requirement.state === 'issued') {
        stateIndicator = '🟣'; // Серый квадрат
      }
      if (requirement.state === 'onShort') {
        stateIndicator = '🟠'; // Серый квадрат
      }
      const title = `№:${requirement?.pickSlipNumberNew})---${stateIndicator}`;
      // const children = [
      //   {
      //     title: `state: ${requirement.state}`,
      //     key: `${requirement._id!.toString()}-state`,
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
        key: requirement?.id!.toString(),
        requirement,
        // children,
        color: getColor(requirement),
      };
    });
  };

  useEffect(() => {
    setTreeData(convertToTreeData(pickSlips));
  }, [pickSlips]);

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
        isLoading={isLoading}
        checkable={true}
        treeData={filteredTreeData}
        onSelect={(selectedKeys, info) => {
          const requirement = pickSlips.find(
            (requirement) => requirement.id === selectedKeys[0]
          );
          if (requirement) {
            onCompanySelect(requirement);
            // console.log(requirement);
          }
        }}
        height={590}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default PickSlipAdministrationTree;
