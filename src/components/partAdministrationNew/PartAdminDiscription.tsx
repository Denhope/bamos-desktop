import { IPartNumber } from '@/models/IUser';

import { ProDescriptions } from '@ant-design/pro-components';
import { Tag } from 'antd';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

type partsDiscriptionType = {
  part: IPartNumber | null;
  onpartSearch?: (orders: any | null) => void;
};

const WODiscription: FC<partsDiscriptionType> = ({ part, onpartSearch }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col ">
      <ProDescriptions
        column={6}
        size="middle"
        // layout="horizontal"
        className="bg-white px-4 py-3 rounded-md  align-middle"
      >
        <ProDescriptions.Item label={`${t('PART No')}`} valueType="text">
          {part?.PART_NUMBER && <Tag>{part?.PART_NUMBER}</Tag>}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="text" label={t('DESCRIPTION')}>
          {part?.DESCRIPTION && <Tag>{part?.DESCRIPTION?.toUpperCase()}</Tag>}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="text" label={t('CREATE BY')}>
          {part?.PART_NUMBER && (
            <Tag>{part?.createUserID?.name?.toUpperCase()}</Tag>
          )}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="date" label={t('CREATE DATE')}>
          {part?.createDate}
        </ProDescriptions.Item>

        <ProDescriptions.Item valueType="text" label={t('LAST MODIFIED BY')}>
          {part?.PART_NUMBER && (
            <Tag>{part?.updateUserID?.name?.toUpperCase()}</Tag>
          )}
        </ProDescriptions.Item>

        <ProDescriptions.Item valueType="date" label={t('MODIFICATION DATE')}>
          {part?.updateDate}
        </ProDescriptions.Item>
      </ProDescriptions>
    </div>
  );
};

export default WODiscription;