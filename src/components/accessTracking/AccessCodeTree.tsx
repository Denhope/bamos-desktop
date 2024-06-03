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
import CustomTree from '../userAdministration/zoneCodeAdministration/CustomTree';

interface TreeDataNode extends DataNode {
  zoneCode?: IZoneCode;
  subZoneCode?: ISubZoneCode;
  areaCode?: IAreaCode;
  accessCode?: IAccessCode;
}

interface ZoneTreeProps {
  onCheckItems?: (selectedKeys: React.Key[]) => void;
  onZoneCodeSelect: (
    zoneCode: IZoneCode | ISubZoneCode | IAreaCode | IAccessCode
  ) => void;
  zoneCodesGroup: IZoneCodeGroup[] | [];
}

const AccessCodeTree: FC<ZoneTreeProps> = ({
  onZoneCodeSelect,
  zoneCodesGroup,
  onCheckItems,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const { Search } = Input;
  const { TreeNode } = Tree;

  const convertToTreeData = (zoneCodes: IZoneCodeGroup[]): any[] => {
    return zoneCodes.map((zoneCode) => {
      const zoneIndicator = getIndicator(zoneCode);
      return {
        title: `${
          zoneCode.majoreZoneNbr
        } - ${zoneCode.majoreZoneDescription.toUpperCase()}${zoneIndicator}`,
        key: zoneCode.id,
        zoneCode,
        children: zoneCode.subZonesCode?.map((subZoneCode) => {
          const subZoneIndicator = getIndicator(subZoneCode);
          if (!subZoneCode.areasCode || subZoneCode.areasCode.length === 0) {
            // Если areasCode отсутствует или не содержит элементов, устанавливаем статус 'draft'
            return {
              title: `${
                subZoneCode.subZoneNbr
              } - ${subZoneCode?.subZoneDescription?.toUpperCase()} ⚪(DRAFT)`,
              key: subZoneCode.id,
              subZoneCode,
              children: [], // Нет areasCode
            };
          } else {
            // Проверяем, есть ли в areasCode хотя бы один элемент
            const hasAreas = subZoneCode.areasCode.some(
              (area) => area.accessCodes && area.accessCodes.length > 0
            );
            const areas = subZoneCode.areasCode.map((areaCode) => {
              const areaIndicator = getIndicator(areaCode);
              if (!areaCode.accessCodes || areaCode.accessCodes.length === 0) {
                // Если accessCodes отсутствует или не содержит элементов, устанавливаем статус 'draft'
                return {
                  title: `${
                    areaCode.areaNbr
                  } - ${areaCode.areaDescription?.toUpperCase()} ⚪(DRAFT)`,
                  key: areaCode.id,
                  areaCode,
                  children: [], // Нет accessCodes
                };
              } else {
                const accessCodes = areaCode.accessCodes.map((accessCode) => {
                  const accessIndicator =
                    accessCode.status === 'open'
                      ? ' 🔴' +
                        '(OPEN)' +
                        `///L:(${accessCode.accessProjectNumber})`
                      : accessCode.status === 'inspected'
                      ? ' 🟢🟢' +
                        '(INSPECTED)' +
                        `///L:(${accessCode.accessProjectNumber})`
                      : accessCode.status === 'draft'
                      ? ' ⚪' +
                        '(DRAFT)' +
                        `///L:(${accessCode.accessProjectNumber})`
                      : ' 🟢' +
                        '(CLOSED)' +
                        `///L:(${accessCode.accessProjectNumber})`;
                  return {
                    title: `${
                      accessCode.accessNbr
                    } - ${accessCode.accessDescription?.toUpperCase()}${accessIndicator}`,
                    key: accessCode._id,
                    accessCode: { ...accessCode, areaCode },
                  };
                });
                return {
                  title: `${
                    areaCode.areaNbr
                  } - ${areaCode.areaDescription?.toUpperCase()}${areaIndicator}`,
                  key: areaCode.id,
                  areaCode,
                  children: accessCodes,
                };
              }
            });
            // Если нет ни одного areas с accessCodes, устанавливаем статус 'draft'
            const subZoneTitle = `${
              subZoneCode.subZoneNbr
            } - ${subZoneCode?.subZoneDescription?.toUpperCase()}`;
            return {
              title: hasAreas
                ? `${subZoneTitle}${subZoneIndicator}`
                : `${subZoneTitle} ⚪(DRAFT)`,
              key: subZoneCode.id,
              subZoneCode,
              children: areas,
            };
          }
        }),
      };
    });
  };

  const getIndicator = (item: any): string => {
    if (
      item.accessCodes &&
      item.accessCodes.some(
        (accessCode: { status: string }) => accessCode.status === 'open'
      )
    ) {
      return ' 🔴' + '(OPEN)';
    } else if (
      item.accessCodes &&
      item.accessCodes.every(
        (accessCode: { status: string }) => accessCode.status === 'inspected'
      )
    ) {
      return ' 🟢🟢' + '(INSPECTED)';
    } else if (
      item.accessCodes &&
      item.accessCodes.every(
        (accessCode: { status: string }) => accessCode.status === 'closed'
      )
    ) {
      return ' 🟢' + '(CLOSED)';
    } else if (
      item.accessCodes &&
      item.accessCodes.every(
        (accessCode: { status: string }) => accessCode.status === 'draft'
      )
    ) {
      return ' ⚪' + '(DRAFT)';
    } else if (item.areasCode && item.areasCode.length > 0) {
      // Check areas for open, inspected, closed, or draft accessCodes
      const openExists = item.areasCode.some(
        (area: { accessCodes: { status: string }[] }) =>
          area.accessCodes?.some(
            (accessCode: { status: string }) => accessCode.status === 'open'
          )
      );
      const inspectedExists = item.areasCode.some(
        (area: { accessCodes: { status: string }[] }) =>
          area.accessCodes?.some(
            (accessCode: { status: string }) =>
              accessCode.status === 'inspected'
          )
      );
      const draftExists = item.areasCode.some(
        (area: { accessCodes: { status: string }[] }) =>
          area.accessCodes?.some(
            (accessCode: { status: string }) => accessCode.status === 'draft'
          )
      );
      if (openExists) {
        return ' 🔴' + '(OPEN)';
      } else if (inspectedExists) {
        return ' 🟢🟢' + '(INSPECTED)';
      } else if (draftExists) {
        return ' ⚪' + '(DRAFT)';
      } else {
        return ' 🟢' + '(CLOSED)';
      }
    } else if (item.subZonesCode) {
      // Check subZones for open, inspected, closed, or draft accessCodes
      const openExists = item.subZonesCode.some((subZone: any) =>
        getIndicator(subZone).includes(' 🔴')
      );
      const inspectedExists = item.subZonesCode.some((subZone: any) =>
        getIndicator(subZone).includes(' 🟢🟢')
      );
      const draftExists = item.subZonesCode.some((subZone: any) =>
        getIndicator(subZone).includes(' ⚪')
      );
      if (openExists) {
        return ' 🔴' + '(OPEN)';
      } else if (inspectedExists) {
        return ' 🟢🟢' + '(INSPECTED)';
      } else if (draftExists) {
        return ' ⚪' + '(DRAFT)';
      } else {
        return ' 🟢' + '(CLOSED)';
      }
    }

    return ' 🟢' + '(CLOSED)';
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
      console.log(selectedNode.accessCode);
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
        isAllChecked={true}
        checkable={true}
        treeData={filteredTreeData}
        onSelect={onSelect}
        height={660}
        searchQuery={searchQuery}
        onCheckItems={(selectedKeys: any[]) => {
          console.log(selectedKeys);
          return onCheckItems && onCheckItems(selectedKeys);
        }}
      />
    </div>
  );
};

export default AccessCodeTree;
