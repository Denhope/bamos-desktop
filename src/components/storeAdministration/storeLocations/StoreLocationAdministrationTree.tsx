//@ts-nocheck

import CustomTree from '@/components/userAdministration/zoneCodeAdministration/CustomTree';
import { IProjectItem, IProjectItemWO, IRequirementCode } from '@/models/AC';
import { Typography } from 'antd';
import { DataNode } from 'antd/es/tree';
import { TreeNode } from 'antd/es/tree-select';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { Tree, Input, Button } from 'antd';
import { ILocation } from '@/models/IUser';
interface TreeDataNode extends DataNode {
  projectItem?: any;
}
interface reqTreeProps {
  onProjectItemSelect: (req: any) => void;
  onCheckItems?: (selectedKeys: React.Key[]) => void;
  projectItems: any[] | [];
  isLoading?: boolean;
}
const StoreLocationAdministrationTree: FC<reqTreeProps> = ({
  onProjectItemSelect,
  onCheckItems,
  projectItems,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const { Text } = Typography;
  const { TreeNode } = Tree;
  const { Search } = Input;

  const convertToTreeData = (projectItems: ILocation[]): TreeDataNode[] => {
    return projectItems.map((reqCode) => {
      let stateIndicator = ' ⚪'; // Серый кружок по умолчанию

      // Проверяем каждый элемент в массиве projectItemsWOID
      // if (reqCode?.projectItemsWOID) {
      //   for (const item of reqCode.projectItemsWOID) {
      //     if (item.status === 'open') {
      //       stateIndicator = ' \u{1F534}'; // Если хоть один заказ открыт, устанавливаем красный кружок
      //       break; // Прерываем цикл, так как уже нашли открытый заказ
      //     } else if (item.status === 'CLOSED') {
      //       stateIndicator = ' 🟢'; // Если все заказы закрыты, устанавливаем зеленый кружок
      //     }
      //   }
      // }

      return {
        title: `${String(
          reqCode?.locationName
        ).toUpperCase()}--${reqCode?.description?.toUpperCase()}--${reqCode?.locationType.toUpperCase()}`,
        key: reqCode.id,
        reqCode: reqCode,
      };
    });
  };

  useEffect(() => {
    setTreeData(convertToTreeData(projectItems));
  }, [projectItems]);

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

    const selectedGroup = filteredTreeData[selectedIndex].projectItem;
    if (selectedGroup) {
      onProjectItemSelect(selectedGroup);
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
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Отменяем действие по умолчанию
      event.stopPropagation(); // Останавливаем дальнейшую передачу события
    }
  };
  return (
    <div className="flex flex-col  ">
      <Search
        size="small"
        allowClear
        onSearch={(value) => {
          setSearchQuery(value);
          // handleEnterPress();
        }}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: 8 }}
        enterButton
        // onPressEnter={handleEnterPress}
        onKeyDown={handleKeyDown}
      />
      <CustomTree
        isAllChecked
        isLoading={isLoading}
        checkable={false}
        treeData={filteredTreeData}
        onCheckItems={(selectedKeys) => {
          // console.log(selectedKeys);
          onCheckItems && onCheckItems(selectedKeys);
        }}
        onSelect={(selectedKeys, info) => {
          const reqGroup = projectItems.find(
            (group) => group.id === selectedKeys[0]
          );
          if (reqGroup) {
            onProjectItemSelect(reqGroup);
          }
        }}
        height={460}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default StoreLocationAdministrationTree;
