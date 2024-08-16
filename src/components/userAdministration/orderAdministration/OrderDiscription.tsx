import { ProDescriptions } from '@ant-design/pro-components';
import { Tag } from 'antd';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

type ordersDiscriptionType = {
  order: any | null;
  onorderSearch?: (orders: any | null) => void;
};

const OrderDiscription: FC<ordersDiscriptionType> = ({
  order,
  onorderSearch,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col w-full">
      <ProDescriptions
        emptyText={''}
        column={5}
        size="middle"
        className="bg-white px-4 py-3 rounded-md align-middle w-full"
      >
        <ProDescriptions.Item label={`${t('ORDER No')}`} valueType="text">
          <Tag
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {order?.orderNumberNew || ''}
          </Tag>
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="text" label={t('CREATE BY')}>
          <Tag
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {order?.createUserID?.name?.toUpperCase() || ''}
          </Tag>
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="date" label={t('CREATE DATE')}>
          {order?.createDate || ''}
        </ProDescriptions.Item>

        <ProDescriptions.Item valueType="text" label={t('LAST MODIFIED BY')}>
          <Tag
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {String(order?.updateUserID?.name || '')?.toUpperCase()}
          </Tag>
        </ProDescriptions.Item>

        <ProDescriptions.Item valueType="date" label={t('MODIFICATION DATE')}>
          {order?.updateDate || ''}
        </ProDescriptions.Item>
      </ProDescriptions>
    </div>
  );
};

export default OrderDiscription;
