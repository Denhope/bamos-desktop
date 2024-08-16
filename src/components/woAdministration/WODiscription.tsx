import { IProjectItemWO } from '@/models/AC';
import { IProject } from '@/models/IProject';
import { ProDescriptions } from '@ant-design/pro-components';
import { Tag } from 'antd';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

type projectsDiscriptionType = {
  project: IProjectItemWO | null;
  onprojectSearch?: (orders: any | null) => void;
};

const WODiscription: FC<projectsDiscriptionType> = ({
  project,
  onprojectSearch,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col w-full">
      <ProDescriptions
        column={6}
        size="middle"
        className="bg-white px-4 py-3 rounded-md align-middle w-full"
      >
        <ProDescriptions.Item label={`${t('WORKORDER No')}`} valueType="text">
          {project?.taskWO && (
            <Tag
              color="#fc9601"
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {project?.taskWO}
            </Tag>
          )}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="text" label={t('CREATE BY')}>
          {project?.taskWO && (
            <Tag
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {project?.createUserID?.name?.toUpperCase()}
            </Tag>
          )}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="date" label={t('CREATE DATE')}>
          {project?.createDate}
        </ProDescriptions.Item>

        <ProDescriptions.Item valueType="text" label={t('LAST MODIFIED BY')}>
          {project?.taskWO && (
            <Tag
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {project?.updateUserID?.name?.toUpperCase()}
            </Tag>
          )}
        </ProDescriptions.Item>

        <ProDescriptions.Item valueType="date" label={t('MODIFICATION DATE')}>
          {project?.updateDate}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="text" label={t('STATUS')}>
          {project?.taskWO && (
            <Tag
              color="#fc9601"
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {project?.status?.toUpperCase()}
            </Tag>
          )}
        </ProDescriptions.Item>
        {/* <ProDescriptions.Item valueType="text" label={t('CLOSED BY')}>
          {project?.taskWO && <Tag>{project?.closedByID?.toUpperCase()}</Tag>}
        </ProDescriptions.Item> */}
      </ProDescriptions>
    </div>
  );
};

export default WODiscription;
