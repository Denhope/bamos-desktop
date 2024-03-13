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
  onZoneCodeSelect: (zoneCode: IZoneCode | ISubZoneCode | IAreaCode) => void;
  zoneCodesGroup: IZoneCodeGroup[] | [];
}

const ZoneCodeTree: FC<ZoneTreeProps> = ({
  onZoneCodeSelect,
  zoneCodesGroup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const { Search } = Input;

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
    const selectedNode = info.node;
    if (selectedNode.zoneCode) {
      onZoneCodeSelect(selectedNode.zoneCode);
    } else if (selectedNode.subZoneCode) {
      onZoneCodeSelect(selectedNode.subZoneCode);
    } else if (selectedNode.areaCode) {
      onZoneCodeSelect(selectedNode.areaCode);
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

  useEffect(() => {
    setTreeData(filteredTreeData);
  }, [filteredTreeData]);
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

  useEffect(() => {
    const filteredTreeData = filterTreeData(treeData, searchQuery);
    setTreeData(filteredTreeData);
  }, [searchQuery]);

  return (
    <div>
      <Search
        size="small"
        allowClear
        onSearch={(value) => {
          setSearchQuery(value);
          handleEnterPress();
        }}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: 8 }}
        onPressEnter={handleEnterPress}
      />
      <Tree
        showLine
        defaultExpandedKeys={['group1']}
        onSelect={onSelect}
        treeData={treeData}
      />
    </div>
  );
};

export default ZoneCodeTree;
