import { IStore } from '@/models/IUser';

import { ProDescriptions } from '@ant-design/pro-components';
import { Tag } from 'antd';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

type StoreDiscriptionType = {
  store: IStore | null;
};

const StoreDiscription: FC<StoreDiscriptionType> = ({ store }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col ">
      <ProDescriptions
        column={6}
        size="middle"
        // layout="horizontal"
        className="bg-white px-4 py-3 rounded-md  align-middle"
      >
        <ProDescriptions.Item label={`${t('STORE NAME')}`} valueType="text">
          {store?.id && (
            <Tag>{String(store?.storeShortName).toUpperCase()}</Tag>
          )}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="text" label={t('CREATE BY')}>
          {store?.id && <Tag>{store?.createUserID?.name?.toUpperCase()}</Tag>}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="date" label={t('CREATE DATE')}>
          {store?.createDate}
        </ProDescriptions.Item>

        <ProDescriptions.Item valueType="text" label={t('LAST MODIFIED BY')}>
          {store?.id && <Tag>{store?.updateUserID?.name?.toUpperCase()}</Tag>}
        </ProDescriptions.Item>

        <ProDescriptions.Item valueType="date" label={t('MODIFICATION DATE')}>
          {store?.updateDate}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="text" label={t('STATUS')}>
          {store?.id && <Tag>{store?.status?.toUpperCase()}</Tag>}
        </ProDescriptions.Item>
      </ProDescriptions>
    </div>
  );
};

export default StoreDiscription;
