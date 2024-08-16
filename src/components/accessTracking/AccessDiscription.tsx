import { IProjectItemWO } from '@/models/AC';
import { IProject } from '@/models/IProject';
import { IAccessCode } from '@/models/ITask';
import { ProDescriptions } from '@ant-design/pro-components';
import { Tag } from 'antd';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

type projectsDiscriptionType = {
  project: any | null;
  onprojectSearch?: (orders: any | null) => void;
};

const AccessDiscription: FC<projectsDiscriptionType> = ({
  project,
  onprojectSearch,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col w-full">
      <ProDescriptions
        column={7}
        size="middle"
        className="bg-white px-4 py-3 rounded-md align-middle w-full"
      >
        <ProDescriptions.Item label={`${t('ACCESS No')}`} valueType="text">
          {(project?.accessNbr || project?.accessNbr) && (
            <Tag
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {project?.accessNbr || project?.accessNbr}
            </Tag>
          )}
        </ProDescriptions.Item>
        {/* <ProDescriptions.Item valueType="text" label={t('CREATE BY')}>
          {project?.accessNbr && (
            <Tag>{project?.createUserID?.name?.toUpperCase()}</Tag>
          )}
        </ProDescriptions.Item> */}
        <ProDescriptions.Item valueType="date" label={t('CREATE DATE')}>
          {project?.createDate}
        </ProDescriptions.Item>

        <ProDescriptions.Item valueType="text" label={t('OPEN BY')}>
          {project?.accessNbr && (
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

        <ProDescriptions.Item valueType="date" label={t('OPEN DATE')}>
          {project?.updateDate}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="text" label={t('STATUS')}>
          {project?.accessNbr && (
            <Tag
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
        <ProDescriptions.Item valueType="text" label={t('CLOSED BY')}>
          {project?.accessNbr && (
            <Tag
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {project?.closedByID?.toUpperCase()}
            </Tag>
          )}
        </ProDescriptions.Item>
      </ProDescriptions>
    </div>
  );
};

export default AccessDiscription;
