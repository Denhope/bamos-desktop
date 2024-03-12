import React, { FC, useEffect, useMemo, useState } from 'react';
import { Tree, Typography, Input } from 'antd';
import type { DataNode } from 'antd/lib/tree';

import {
  IAreaCode,
  ISubZoneCode,
  IZoneCode,
  IZoneCodeGroup,
} from '@/models/ITask';

interface TreeDataNode extends DataNode {
  zoneCode?: IZoneCode;
  subZoneCode?: ISubZoneCode;
  areaCode?: IAreaCode;
}

interface ZoneTreeProps {
  onZoneCodeSelect: (zoneCode: IZoneCode) => void;
  zoneCodesGroup: IZoneCodeGroup[] | [];
}

const ZoneCodeTree: FC<ZoneTreeProps> = ({
  onZoneCodeSelect,
  zoneCodesGroup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  // const convertToTreeData = (
  //   zoneCodesGroup: IZoneCodeGroup[]
  // ): TreeDataNode[] => {
  //   return zoneCodesGroup.map((group) => {
  //     const groupNode: TreeDataNode = {
  //       title: `${group.majoreZoneNbr} - ${String(
  //         group.majoreZoneDescription
  //       )?.toUpperCase()}`,
  //       key: group.id,
  //       zoneCode: group,
  //       children: group.subZonesCode?.map((subZone) => {
  //         const subZoneNode: TreeDataNode = {
  //           title: `${
  //             subZone.subZoneNbr
  //           } - ${subZone.subZoneDescription?.toUpperCase()}`,
  //           key: subZone.id,
  //           subZoneCode: subZone,
  //           children: subZone.areasCode?.map((area) => ({
  //             title: `${area.areaNbr} - ${area.areaDescription?.toUpperCase()}`,
  //             key: area.id,
  //             areaCode: area,
  //           })),
  //         };
  //         return subZoneNode;
  //       }),
  //     };
  //     return groupNode;
  //   });
  // };

  const convertToTreeData = (
    zoneCodesGroup: IZoneCodeGroup[]
  ): TreeDataNode[] => {
    return zoneCodesGroup.map((group) => {
      const groupNode: TreeDataNode = {
        title: `${group.majoreZoneNbr} - ${String(
          group.majoreZoneDescription
        )?.toUpperCase()}`,
        key: group.majoreZoneNbr, // Используйте majoreZoneNbr в качестве ключа
        zoneCode: group,
        children: group.subZonesCode?.map((subZone) => {
          const subZoneNode: TreeDataNode = {
            title: `${
              subZone.subZoneNbr
            } - ${subZone.subZoneDescription?.toUpperCase()}`,
            key: `${group.majoreZoneNbr}-${subZone.subZoneNbr}`, // Создайте уникальный ключ для subZone
            subZoneCode: subZone,
            children: subZone.areasCode?.map((area) => ({
              title: `${area.areaNbr} - ${area.areaDescription?.toUpperCase()}`,
              key: `${group.majoreZoneNbr}-${subZone.subZoneNbr}-${area.areaNbr}`, // Создайте уникальный ключ для area
              areaCode: area,
            })),
          };
          return subZoneNode;
        }),
      };
      return groupNode;
    });
  };

  useEffect(() => {
    setTreeData(convertToTreeData(zoneCodesGroup));
  }, [zoneCodesGroup]);

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

    setSelectedIndex((prevIndex) => (prevIndex + 1) % filteredTreeData.length);

    const selectedNode = filteredTreeData[selectedIndex];
    if (selectedNode.zoneCode) {
      onZoneCodeSelect(selectedNode.zoneCode);
    } else if (selectedNode.subZoneCode) {
      onZoneCodeSelect(selectedNode.subZoneCode);
    } else if (selectedNode.areaCode) {
      onZoneCodeSelect(selectedNode.areaCode);
    }
  };

  const renderTreeNodes = (data: TreeDataNode[]) => {
    return data.map((item) => (
      <Tree.TreeNode
        title={item.title}
        key={item.key}
        className={item.key === selectedIndex ? 'ant-tree-node-selected' : ''}
      >
        {item.children && renderTreeNodes(item.children)}
      </Tree.TreeNode>
    ));
  };

  return (
    <div className="flex flex-col gap-2 ">
      <Input.Search
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
        height={650}
        defaultExpandedKeys={['group1']}
        onSelect={(selectedKeys, info) => {
          const selectedNode = treeData.find(
            (node) => node.key === selectedKeys[0]
          );
          if (selectedNode && selectedNode.zoneCode) {
            onZoneCodeSelect(selectedNode.zoneCode);
          }
        }}
      >
        {renderTreeNodes(filteredTreeData)}
      </Tree>
    </div>
  );
};

export default ZoneCodeTree;
