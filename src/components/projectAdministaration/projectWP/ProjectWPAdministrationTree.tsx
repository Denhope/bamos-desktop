import CustomTree from '@/components/userAdministration/zoneCodeAdministration/CustomTree';
import { IProjectItem, IProjectItemWO, IRequirementCode } from '@/models/AC';
import { Typography } from 'antd';
import { DataNode } from 'antd/es/tree';
import { TreeNode } from 'antd/es/tree-select';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { Tree, Input, Button } from 'antd';
interface TreeDataNode extends DataNode {
  projectItem?: any;
}
interface reqTreeProps {
  onProjectItemSelect: (req: any) => void;
  onCheckItems?: (selectedKeys: React.Key[]) => void;
  projectItems: any[] | [];
}
const ProjectWPAdministrationTree: FC<reqTreeProps> = ({
  onProjectItemSelect,
  onCheckItems,
  projectItems,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const { Text } = Typography;
  const { TreeNode } = Tree;
  const { Search } = Input;
  const getColor = (item: IProjectItemWO): string => {
    if (item.status === 'open') {
      return 'red';
    } else if (item.status === 'inProgress') {
      return 'blue';
    } else {
      return 'default'; // Default color or color for other cases
    }
  };

  const convertToTreeData = (projectItems: IProjectItem[]): TreeDataNode[] => {
    return projectItems.map((reqCode) => {
      let stateIndicator = ' ⚪'; // Серый кружок по умолчанию

      // Проверяем каждый элемент в массиве projectItemsWOID
      if (reqCode?.projectItemsWOID) {
        for (const item of reqCode.projectItemsWOID) {
          if (item.status === 'open') {
            stateIndicator = ' \u{1F534}'; // Если хоть один заказ открыт, устанавливаем красный кружок
            break; // Прерываем цикл, так как уже нашли открытый заказ
          } else if (item.status === 'CLOSED') {
            stateIndicator = ' 🟢'; // Если все заказы закрыты, устанавливаем зеленый кружок
          }
        }
      }

      // return {
      //   title: `${reqCode?.partNumberID?.PART_NUMBER?.toUpperCase()} - ${reqCode?.partNumberID?.DESCRIPTION?.toUpperCase()} - ${
      //     reqCode?.qty || ''
      //   } ${reqCode?.partNumberID?.UNIT_OF_MEASURE?.toUpperCase()}${stateIndicator}`,
      //   key: reqCode.id,
      //   reqCode: reqCode,
      // };

      return {
        title: `${
          reqCode?.taskNumber
        } - ${reqCode?.taskDescription?.toUpperCase()} ${stateIndicator}`,
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
        selectedKeys={selectedKeys}
        isAllChecked={true}
        checkable={true}
        treeData={filteredTreeData}
        onCheckItems={(selectedKeys: any[]) => {
          // console.log(selectedKeys);
          return onCheckItems && onCheckItems(selectedKeys);
        }}
        onSelect={(selectedKeys, info) => {
          const reqGroup = projectItems.find(
            (group) => group.id === selectedKeys[0]
          );
          if (reqGroup) {
            onProjectItemSelect(reqGroup);
          }
        }}
        height={470}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default ProjectWPAdministrationTree;