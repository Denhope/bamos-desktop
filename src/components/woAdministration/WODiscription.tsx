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
    <div className="flex flex-col ">
      <ProDescriptions
        column={7}
        size="middle"
        // layout="horizontal"
        className="bg-white px-4 py-3 rounded-md  align-middle"
      >
        <ProDescriptions.Item label={`${t('WORKORDER No')}`} valueType="text">
          {(project?.taskWO || project?.projectTaskWO) && (
            <Tag>{project?.taskWO || project?.projectTaskWO}</Tag>
          )}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="text" label={t('CREATE BY')}>
          {(project?.taskWO || project?.projectTaskWO) && (
            <Tag>{project?.createUserID?.name?.toUpperCase()}</Tag>
          )}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="date" label={t('CREATE DATE')}>
          {project?.createDate}
        </ProDescriptions.Item>

        <ProDescriptions.Item valueType="text" label={t('LAST MODIFIED BY')}>
          {(project?.taskWO || project?.projectTaskWO) && (
            <Tag>{project?.updateUserID?.name?.toUpperCase()}</Tag>
          )}
        </ProDescriptions.Item>

        <ProDescriptions.Item valueType="date" label={t('MODIFICATION DATE')}>
          {project?.updateDate}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="text" label={t('STATE')}>
          {(project?.taskWO || project?.projectTaskWO) && (
            <Tag>{project?.status?.toUpperCase()}</Tag>
          )}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="text" label={t('CLOSED BY')}>
          {(project?.taskWO || project?.projectTaskWO) && (
            <Tag>{project?.closedByID?.toUpperCase()}</Tag>
          )}
        </ProDescriptions.Item>
      </ProDescriptions>
    </div>
  );
};

export default WODiscription;
