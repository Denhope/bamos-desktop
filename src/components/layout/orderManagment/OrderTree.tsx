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
  DownloadOutlined,
} from '@ant-design/icons';
import { handleFileSelect } from '@/services/utilites';

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
                          {`${t('VENDOR')}:  ${vendor?.CODE}-${vendor?.NAME}`}
                        </div>
                      ),
                      key: vendor.id,
                      children: [
                        {
                          title: `${t('PART No')}:${vendor?.partNumber}`,
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
                          title:
                            `${t('QUANTITY QUOTED')}:${vendor.qtyQuoted}` || '',
                          key: uuidv4(),
                        },
                        {
                          title: `${t('UNIT OF MEASURE')}:${vendor.unit}` || '',
                          key: uuidv4(),
                        },
                        {
                          title: `DISCOUNT:${vendor.discount}`,
                          key: uuidv4(),
                        },
                        {
                          title: `CONDITION:${vendor.condition}`,
                          key: uuidv4(),
                        },
                        {
                          title: `${t('LEAD TIME')}:${vendor.leadTime}`,
                          key: uuidv4(),
                        },
                        {
                          title: (
                            <span style={{ color: backgroundColor }}>
                              {`${t('STATE')}: ${order?.state}`}
                            </span>
                          ),
                          key: uuidv4(),
                        },
                        {
                          title: `${t('FILES')}:`,
                          key: uuidv4(),
                          children: [
                            ...(vendor?.files?.map((file: any, index: any) => {
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
                    };
                  }),
                };
              }),
          },
          {
            title: `${t('FILES')}:`,
            key: uuidv4(),
            children: [
              ...(order?.files?.map((file: any, index: any) => {
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
        ];
      }
      if (order.orderType === 'PURCHASE_ORDER') {
        return [
          // {
          //   title: t('ORDERS'),
          //   key: '0-0-0',
          //   children: [
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

            children: [
              {
                title: (
                  <div>
                    {`${t('STATE')}: `}
                    <ColoredText
                      text={order?.state || ''}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                ),
                key: uuidv4(),
              },
              {
                title: `${t('VENDOR')}:`,
                key: uuidv4(),
                children: [
                  {
                    title: `CODE:${
                      (order?.vendors &&
                        String(order?.vendors[0]?.CODE).toUpperCase()) ||
                      ''
                    }`,
                    key: uuidv4(),
                  },
                  {
                    title: `ADRESS:${
                      String(
                        order?.vendors && order?.vendors[0]?.ADRESS
                      ).toUpperCase() || ''
                    }`,
                    key: uuidv4(),
                  },
                  {
                    title: `SHIP TO:${
                      (order?.vendors && order?.vendors[0]?.shipTo) || ''
                    }`,
                    key: uuidv4(),
                  },
                  {
                    title: `PLANNED DATE
                    :${(order?.vendors && order?.finishDate) || ''}`,
                    key: uuidv4(),
                  },
                ],
              },
              {
                title: `${t('PARTS')}:`,
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
                      children: [
                        {
                          title:
                            `QUANTITY:${part?.QUANTITY || part?.quantity} / ${
                              part?.UNIT_OF_MEASURE || part?.unit
                            }` || '',
                          key: uuidv4(),
                        },
                        {
                          title: `PURSHASE PRICE:${part?.price || ''}`,
                          key: uuidv4(),
                        },
                        {
                          title: `CURRENCY:${part.currency || ''}`,
                          key: uuidv4(),
                        },

                        {
                          title: `CONDITION:${part.condition || ''}`,
                          key: uuidv4(),
                        },
                        {
                          title: `${t('RECEIVINGS')}:${part.leadTime || ''}`,
                          key: uuidv4(),
                        },
                        {
                          title: (
                            <div>
                              {`${t('STATE')}: `}
                              <ColoredText
                                text={part?.state || ''}
                                backgroundColor={backgroundColor}
                              />
                            </div>
                          ),
                          key: uuidv4(),
                        },
                      ],
                    };
                  }),
              },
            ],
          },
          //   ],
          // },
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
    const onSelect = (selectedKeys: React.Key[], info: any) => {
      let title;
      if (typeof info.node.title === 'string') {
        title = info.node.title;
      } else if (
        typeof info.node.title === 'object' &&
        info.node.title.props.children
      ) {
        title = info.node.title.props.children.join('');
      }

      if (title) {
        title = title.replace(/\[object Object\]/g, '');
        if (title.includes(t('VENDOR:'))) {
          onSelectedPartVendor && onSelectedPartVendor(info.node.key);
        }
        if (title.includes(t('POS')) && order.orderType === 'QUOTATION_ORDER') {
          onSelectedPart && onSelectedPart(info.node.key);
        }
        if (title.includes(t('POS')) && order.orderType === 'PURCHASE_ORDER') {
          onSelectedPartVendor && onSelectedPartVendor(info.node.key);
          // onSelectedPart && onSelectedPart(info.node.key);
          // console.log(info.node.key);
        }
        if (title.includes(t('FILE/'))) {
          handleFileSelect({ id: info.node.key, name: title });
        }
      }
    };
    return (
      <div>
        <Input.Search
          style={{ marginBottom: 8 }}
          placeholder={t('SEARCH')}
          onChange={onSearch}
          value={searchValue}
        />
        <Tree
          onSelect={onSelect}
          showLine
          height={550}
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
