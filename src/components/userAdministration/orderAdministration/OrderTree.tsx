import React, { FC, useState, useEffect, useMemo } from 'react';
import { Tree, Input } from 'antd';
import type { DataNode } from 'antd/lib/tree';
import { v4 as uuidv4 } from 'uuid';
import { DollarOutlined, DownloadOutlined } from '@ant-design/icons';
import CustomTree from '../zoneCodeAdministration/CustomTree';

import { IOrder, IOrderItem } from '@/models/IRequirement';
import { useTranslation } from 'react-i18next';
import { handleFileSelect } from '@/services/utilites';

interface TreeDataNode extends DataNode {
  color: any;
  order?: IOrder;
}

interface UserTreeProps {
  onCompanySelect: (order: IOrder) => void;
  onOrderItemSelect: (order: IOrderItem) => void;
  orders: IOrder[] | [];
}

const { TreeNode } = Tree;
const { Search } = Input;

const OrderTree: FC<UserTreeProps> = ({
  onCompanySelect,
  orders,
  onOrderItemSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const { t } = useTranslation();
  const getColor = (order: IOrder): string => {
    if (order.status === 'open') {
      return 'red';
    } else if (order.status === 'inProgress') {
      return 'blue';
    } else {
      return 'default'; // Default color or color for other cases
    }
  };
  const convertToTreeData = (orders: IOrder[]): TreeDataNode[] => {
    return orders.map((order) => {
      const title = `№:${order.orderNumberNew} - ${order.orderName}`;
      const vendorNodes = (order.vendorID || []).map((vendorId) => {
        const vendorOrders = (order.orderItemsID || []).filter(
          (item) => item.vendorID?._id === vendorId
        );
        return {
          title: vendorOrders[0]?.vendorID?.SHORT_NAME || 'Unknown Vendor',
          key: `vendor-${order.id}-${vendorId}`,
          order: order,
          children: vendorOrders.map((vendorOrder, index) => ({
            title: `POS: ${index + 1}: ${vendorOrder.partID.PART_NUMBER} - ${
              vendorOrder.amout
            }${vendorOrder.partID.UNIT_OF_MEASURE}`,
            key: `${order.id!.toString()}-${vendorId}-${index}`,
            order: vendorOrder,
            color: getColor(vendorOrder),
            children: [
              {
                title: (
                  <div className="flex gap-1">
                    <DollarOutlined />{' '}
                    {`${t('PRICE FOR ONE')}:${vendorOrder?.price}` || ''}
                  </div>
                ),
                key: uuidv4(),
              },
              {
                title: `${t('ALL PRICE')}:${vendorOrder?.allPrice}` || '',
                key: uuidv4(),
                order: order,
              },
              {
                title: `${t('CURRENCY')}:${vendorOrder?.currency}` || '',
                key: uuidv4(),
                order: order,
              },
              {
                title: `${t('MIN QUOTED')}:${vendorOrder?.minQuoted}` || '',
                key: uuidv4(),
                order: order,
              },
              {
                title:
                  `${t('QUANTITY QUOTED')}:${vendorOrder?.qtyQuoted}` || '',
                key: uuidv4(),
                order: order,
              },
              {
                title: `${t('UNIT OF MEASURE')}:${vendorOrder?.unit}` || '',
                key: uuidv4(),
                order: order,
              },
              {
                title: `${t('NDS')}:${vendorOrder?.nds}`,
                key: uuidv4(),
                order: order,
              },
              {
                title: `CONDITION:${vendorOrder.condition}`,
                key: uuidv4(),
                order: order,
              },
              {
                title: `${t('LEAD TIME')}:${vendorOrder.leadTime}`,
                key: uuidv4(),
                order: order,
              },
              {
                title: `${t('FILES')}:`,
                key: uuidv4(),
                children: [
                  ...(vendorOrder?.files?.map((file: any, index: any) => {
                    return {
                      title: (
                        <div className="flex gap-1">
                          <DownloadOutlined />
                          {`FILE/${''}${index + 1}:${file.name}`}
                        </div>
                      ),
                      key: file.id,
                    };
                  }) || []),
                ],
              },
            ],
          })),
        };
      });

      return {
        title,
        key: `order-${order.id}`,
        order,
        children: vendorNodes,
        color: getColor(order),
      };
    });
  };

  useEffect(() => {
    setTreeData(convertToTreeData(orders));
  }, [orders]);

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

    const selectedGroup = filteredTreeData[selectedIndex].order;
    if (selectedGroup) {
      onCompanySelect(selectedGroup);
    }
  };

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    const { node } = info;
    const { title, key, order, orderItem } = node;

    if (title.includes(t('POS'))) {
      onOrderItemSelect && onOrderItemSelect(order);
      // onCompanySelect(order);
    } else if (title.includes(t('FILE/'))) {
      const file = order.files.find((file: { id: any }) => file.id === key);
      if (file) {
        handleFileSelect(file);
      }
    } else onCompanySelect(order);
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
          onSelect(selectedKeys, info);
        }}
        height={540}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default OrderTree;
