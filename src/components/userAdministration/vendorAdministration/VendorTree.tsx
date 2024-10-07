import React, { FC, useState, useEffect, useMemo } from 'react';
import { Tree, Input } from 'antd';
import type { DataNode } from 'antd/lib/tree';
import { IVendor } from '@/models/IUser'; // Убедитесь, что вы импортировали правильный тип vendor
import CustomTree from '../zoneCodeAdministration/CustomTree';

interface TreeDataNode extends DataNode {
  vendor?: IVendor;
}

interface UserTreeProps {
  onVendorSelect: (vendor: IVendor) => void;
  vendors: IVendor[] | [];
}

const { Search } = Input;

const VendorTree: FC<UserTreeProps> = ({ onVendorSelect, vendors }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  const convertToTreeData = (vendors: IVendor[]): TreeDataNode[] => {
    return vendors.map((vendor) => ({
      title: String(vendor.CODE).toUpperCase(),
      key: vendor.id,
      vendor: vendor,
    }));
  };

  useEffect(() => {
    setTreeData(convertToTreeData(vendors));
  }, [vendors]);

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

    const selectedGroup = filteredTreeData[selectedIndex].vendor;
    if (selectedGroup) {
      onVendorSelect(selectedGroup);
    }
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
        checkable={false}
        treeData={filteredTreeData}
        onSelect={(selectedKeys, info) => {
          const vendor = vendors.find(
            (vendor) => vendor.id === selectedKeys[0]
          );
          if (vendor) {
            onVendorSelect(vendor);
          }
        }}
        height={660}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default VendorTree;
