import React, { useState, useMemo } from 'react';
import { Input, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { IOrder } from '@/models/IOrder';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import {
  SettingOutlined,
  DollarOutlined,
  HomeOutlined,
  DownOutlined,
} from '@ant-design/icons';

type ProjectDetailsFormType = {
  order: IOrder;
  onEditOrderDetailsEdit?: (data: any) => void;
  onSelectedPart: (id: any) => void;
  onSelectedPartVendor?: (record: any) => void;
};

type ColoredTextProps = {
  text: string;
  backgroundColor: string;
};

const ColoredText: React.FC<ColoredTextProps> = ({ text, backgroundColor }) => (
  <span style={{ color: backgroundColor }}>{text}</span>
);

const QuatationTree: React.FC<ProjectDetailsFormType> = React.memo(
  ({ order, onSelectedPartVendor, onSelectedPart }) => {
    const { t } = useTranslation();
    const [searchValue, setSearchValue] = useState('');
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);

    const getTreeData = (order: IOrder): DataNode[] => {
      let backgroundColor: string;
      switch (order.state) {
        case 'CLOSED':
          backgroundColor = '#62d156';
          break;
        case 'OPEN':
          backgroundColor = 'red';
          break;
        case 'RECEIVED':
          backgroundColor = '#62d156';
          break;
        case 'PARTLY_RECEIVED':
          backgroundColor = '#f0be37';
          break;
        default:
          backgroundColor = '#f0be37';
          break;
      }

      if (order.orderType === 'QUOTATION_ORDER') {
        return [
          {
            title: (
              <div>
                {`${t('ORDER NUMBER')}: `}
                <ColoredText
                  text={order?.orderNumber || ''}
                  backgroundColor={backgroundColor}
                />
              </div>
            ),
            key: uuidv4(),
            children:
              order.parts &&
              order?.parts.map((part, index) => {
                return {
                  title: (
                    <div>
                      <SettingOutlined /> {`${t('POS')}:${index + 1} `}
                      <ColoredText
                        text={`${part?.PART_NUMBER || part?.PN}`}
                        backgroundColor={backgroundColor}
                      />
                      ({part?.DESCRIPTION || part?.nameOfMaterial}){' '}
                      {part?.QUANTITY || part?.quantity}/{' '}
                      {part?.UNIT_OF_MEASURE || part?.unit}
                    </div>
                  ),
                  key: part.id,
                  children: part?.vendors?.map((vendor: any, index: any) => {
                    return {
                      title: (
                        <div className="flex gap-1">
                          <HomeOutlined />
                          {`${t('VENDOR')}:  ${vendor.CODE}-${vendor.NAME}`}
                        </div>
                      ),
                      key: vendor.id,
                      children: [
                        {
                          title: `${t('PART No')}:${vendor.partNumber}`,
                          key: uuidv4(),
                        },
                        {
                          title: `${t('DESCRIPTION')}:${vendor.description}`,
                          key: uuidv4(),
                        },
                        {
                          title: (
                            <div className="flex gap-1">
                              <DollarOutlined />{' '}
                              {`${t('PURCHASE PRICE')}:${vendor.price}` || ''}
                            </div>
                          ),
                          key: uuidv4(),
                        },
                        {
                          title: `${t('CURRENCY')}:${vendor.currency}` || '',
                          key: uuidv4(),
                        },
                        {
                          title: `${t('QUANTITY')}:${vendor.quantity}` || '',
                          key: uuidv4(),
                        },
                      ],
                    };
                  }),
                };
              }),
          },
        ];
      }
      return [];
    };

    const treeData = useMemo(() => getTreeData(order), [order]);

    const onExpand = (expandedKeysValue: React.Key[]) => {
      setExpandedKeys(expandedKeysValue);
      setAutoExpandParent(false);
    };

    const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value);
    };

    const filterTreeData = (data: DataNode[], search: string): DataNode[] => {
      return data.reduce((acc: DataNode[], item: DataNode) => {
        const index =
          item?.title &&
          item?.title.toString().toLowerCase().indexOf(search.toLowerCase());
        if (index !== -1) {
          acc.push({
            ...item,
            children: item.children
              ? filterTreeData(item.children, search)
              : [],
          });
        } else if (item.children) {
          const children = filterTreeData(item.children, search);
          if (children.length > 0) {
            acc.push({ ...item, children });
          }
        }
        return acc;
      }, []);
    };

    const filteredTreeData = useMemo(
      () => filterTreeData(treeData, searchValue),
      [treeData, searchValue]
    );

    return (
      <div>
        <Input.Search
          style={{ marginBottom: 8 }}
          placeholder={t('SEARCH')}
          onChange={onSearch}
          value={searchValue}
        />
        <Tree
          showLine
          switcherIcon={<DownOutlined />}
          onExpand={onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          treeData={filteredTreeData}
        />
      </div>
    );
  }
);

export default QuatationTree;
