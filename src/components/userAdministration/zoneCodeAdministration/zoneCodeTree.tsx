import React, { FC, useEffect, useMemo, useState } from 'react';
import { Tree, Typography, Input } from 'antd';
import type { DataNode } from 'antd/lib/tree';

import {
  IAccessCode,
  IAreaCode,
  ISubZoneCode,
  IZoneCode,
  IZoneCodeGroup,
} from '@/models/ITask';
import CustomTree from './CustomTree';

interface TreeDataNode extends DataNode {
  zoneCode?: IZoneCode;
  subZoneCode?: ISubZoneCode;
  areaCode?: IAreaCode;
  accessCode?: IAccessCode;
}

interface ZoneTreeProps {
  onZoneCodeSelect: (
    zoneCode: IZoneCode | ISubZoneCode | IAreaCode | IAccessCode
  ) => void;
  zoneCodesGroup: IZoneCodeGroup[] | [];
}

const ZoneCodeTree: FC<ZoneTreeProps> = ({
  onZoneCodeSelect,
  zoneCodesGroup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const { Search } = Input;
  const { TreeNode } = Tree;

  const convertToTreeData = (zoneCodes: IZoneCodeGroup[]): TreeDataNode[] => {
    return zoneCodes.map((zoneCode) => {
      const zoneNode: TreeDataNode = {
        title: `${
          zoneCode.majoreZoneNbr
        } - ${zoneCode.majoreZoneDescription.toUpperCase()}`,
        key: zoneCode.id,
        zoneCode,
        children:
          zoneCode.subZonesCode &&
          zoneCode.subZonesCode.map((subZoneCode) => {
            const subZoneNode: TreeDataNode = {
              title: `${subZoneCode.subZoneNbr} - ${
                subZoneCode?.subZoneDescription &&
                subZoneCode?.subZoneDescription.toUpperCase()
              }`,
              key: subZoneCode.id,
              subZoneCode,
              children:
                subZoneCode.areasCode &&
                subZoneCode.areasCode.map((areaCode) => ({
                  title: `${areaCode.areaNbr} - ${
                    areaCode.areaDescription &&
                    areaCode.areaDescription.toUpperCase()
                  }`,
                  key: areaCode.id,
                  areaCode,
                  children:
                    areaCode.accessCodes &&
                    areaCode.accessCodes.map((accessCode) => ({
                      title: `${accessCode.accessNbr} - ${
                        accessCode?.accessDescription &&
                        accessCode?.accessDescription.toUpperCase()
                      }`,
                      key: accessCode?._id,
                      accessCode,
                    })),
                })),
            };
            return subZoneNode;
          }),
      };
      return zoneNode;
    });
  };
  useEffect(() => {
    setTreeData(convertToTreeData(zoneCodesGroup));
  }, [zoneCodesGroup]);

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    const userGroup = zoneCodesGroup.find(
      (group) => group.id === selectedKeys[0]
    );
    if (userGroup) {
      onZoneCodeSelect(userGroup);
    }
    const selectedNode = info.node;
    if (selectedNode.zoneCode) {
      onZoneCodeSelect(selectedNode.zoneCode);
    } else if (selectedNode.subZoneCode) {
      onZoneCodeSelect(selectedNode.subZoneCode);
    } else if (selectedNode.areaCode) {
      onZoneCodeSelect(selectedNode.areaCode);
    } else if (selectedNode.accessCode) {
      onZoneCodeSelect(selectedNode.accessCode);
    }
  };

  const filterTreeData = (
    treeData: TreeDataNode[],
    searchQuery: string
  ): TreeDataNode[] => {
    return treeData.reduce((acc: TreeDataNode[], node) => {
      const title = String(node.title).toLowerCase();
      const query = searchQuery.toLowerCase();

      if (title.includes(query)) {
        const filteredChildren = node.children
          ? filterTreeData(node.children, searchQuery)
          : [];
        acc.push({ ...node, children: filteredChildren });
      } else if (node.children) {
        const filteredChildren = filterTreeData(node.children, searchQuery);
        if (filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren });
        }
      }

      return acc;
    }, []);
  };

  const filteredTreeData = useMemo(() => {
    if (!searchQuery) {
      return treeData;
    }
    return filterTreeData(treeData, searchQuery);
  }, [treeData, searchQuery]);

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const handleEnterPress = () => {
    if (filteredTreeData.length === 0) return;

    if (selectedIndex === -1) {
      setSelectedIndex(0);
    } else {
      setSelectedIndex(
        (prevIndex) => (prevIndex + 1) % filteredTreeData.length
      );
    }

    const selectedGroup = filteredTreeData[selectedIndex].areaCode;
    if (selectedGroup) {
      onZoneCodeSelect(selectedGroup);
    }
  };

  const renderTreeNodes = (data: TreeDataNode[]) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.title} key={item.key} />;
    });
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Отменяем действие по умолчанию
      event.stopPropagation(); // Останавливаем дальнейшую передачу события
    }
  };
  return (
    <div>
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
        onKeyDown={handleKeyDown}
        // onPressEnter={handleEnterPress}
      />

      <CustomTree
        checkable={false}
        treeData={filteredTreeData}
        onSelect={onSelect}
        height={620}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default ZoneCodeTree;
