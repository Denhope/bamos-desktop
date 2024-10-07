import { IProject } from '@/models/IProject';
import { ProDescriptions } from '@ant-design/pro-components';
import { Tag } from 'antd';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

type projectsDiscriptionType = {
  project: IProject | null;
  onprojectSearch?: (orders: any | null) => void;
};

const ProjectDiscription: FC<projectsDiscriptionType> = ({
  project,
  onprojectSearch,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col w-full">
      <ProDescriptions
        column={5}
        size="middle"
        className="bg-white px-4 py-3 rounded-md align-middle w-full"
      >
        <ProDescriptions.Item label={`${t('PROJECT No')}`} valueType="text">
          <Tag
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {project?.projectWO}
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
            {project?.createUserID?.name?.toUpperCase()}
          </Tag>
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="date" label={t('CREATE DATE')}>
          {project?.createDate}
        </ProDescriptions.Item>

        <ProDescriptions.Item valueType="text" label={t('LAST MODIFIED BY')}>
          <Tag
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {project?.updateUserID?.name?.toUpperCase()}
          </Tag>
        </ProDescriptions.Item>

        <ProDescriptions.Item valueType="date" label={t('MODIFICATION DATE')}>
          {project?.updateDate}
        </ProDescriptions.Item>
      </ProDescriptions>
    </div>
  );
};

export default ProjectDiscription;
