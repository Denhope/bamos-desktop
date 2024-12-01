import { IProjectItemWO } from '@/models/AC';
import { IProject } from '@/models/IProject';
import { IAccessCode } from '@/models/ITask';
import { ProDescriptions } from '@ant-design/pro-components';
import { Tag } from 'antd';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { getStatusColor } from '@/services/utilites';

type projectsDiscriptionType = {
  project: any | null;
  onprojectSearch?: (orders: any | null) => void;
};

const AccessDiscription: FC<projectsDiscriptionType> = ({
  project,
  onprojectSearch,
}) => {
  const { t } = useTranslation();

  // Функция для форматирования даты
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? ''
      : date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
  };

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
              color="geekblue"
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
          {formatDate(project?.createDate)}
        </ProDescriptions.Item>

        <ProDescriptions.Item valueType="text" label={t('OPEN BY')}>
          {project?.accessNbr && (
            <Tag
              color="purple"
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
          {formatDate(project?.updateDate)}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="text" label={t('STATUS')}>
          {project?.accessNbr &&
            (project?.status?.toUpperCase() === 'CLOSED' ? (
              <Tag color={getStatusColor(project?.status)}>
                {project?.status?.toUpperCase()}
              </Tag>
            ) : (
              project?.status?.toUpperCase()
            ))}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="text" label={t('CLOSED BY')}>
          {project?.accessNbr && (
            <Tag
              color="red"
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
