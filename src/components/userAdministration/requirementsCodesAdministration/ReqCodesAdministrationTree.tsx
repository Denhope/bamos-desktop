import React, { FC, useEffect, useMemo, useState } from 'react';
import { Tree, Typography, Input, Button } from 'antd';
import type { DataNode } from 'antd/lib/tree';

import { IRequirementCode } from '@/models/AC';
import CustomTree from '../zoneCodeAdministration/CustomTree';

interface TreeDataNode extends DataNode {
  reqCode?: IRequirementCode;
}
interface reqTreeProps {
  onReqCodeselect: (req: IRequirementCode) => void;
  reqCodes: IRequirementCode[] | [];
}
const { Text } = Typography;
const { TreeNode } = Tree;
const { Search } = Input;

const ReqCodesAdministrationTree: FC<reqTreeProps> = ({
  onReqCodeselect,
  reqCodes,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  const convertToTreeData = (reqCodes: IRequirementCode[]): TreeDataNode[] => {
    return reqCodes.map((reqCode) => ({
      title: `${reqCode.code.toUpperCase()} - ${reqCode.description.toUpperCase()}  `,
      key: reqCode.id,
      reqCode: reqCode,
    }));
  };

  useEffect(() => {
    setTreeData(convertToTreeData(reqCodes));
  }, [reqCodes]);

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

    const selectedGroup = filteredTreeData[selectedIndex].reqCode;
    if (selectedGroup) {
      onReqCodeselect(selectedGroup);
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
        checkable={false}
        treeData={filteredTreeData}
        onSelect={(selectedKeys, info) => {
          const reqGroup = reqCodes.find(
            (group) => group.id === selectedKeys[0]
          );
          if (reqGroup) {
            onReqCodeselect(reqGroup);
          }
        }}
        height={680}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default ReqCodesAdministrationTree;
