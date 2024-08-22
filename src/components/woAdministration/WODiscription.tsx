import { IProjectItemWO } from '@/models/AC';
import { ProDescriptions } from '@ant-design/pro-components';
import { Tag } from 'antd';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

type projectsDiscriptionType = {
  project: IProjectItemWO | null;
};

const WODiscription: FC<projectsDiscriptionType> = ({ project }) => {
  const { t } = useTranslation();

  const getDocumentRevision = (documentName: string) => {
    const document = project?.projectID?.WOReferenceID?.documents?.find(
      (doc: any) => doc?.name === documentName
    );
    return document ? `${document?.revision}-${document?.revisionDate}` : '';
  };

  return (
    <div className="flex flex-col w-full">
      <ProDescriptions
        column={7}
        size="small"
        className="bg-white px-4  rounded-md align-middle w-full py-0"
      >
        {/* Добавление информации из project.projectID.WOReferenceID.planeId */}
        <ProDescriptions.Item label={`${t('Reg Nbr')}`} valueType="text">
          {project?.projectID?.WOReferenceID?.planeId?.regNbr && (
            <Tag
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {project.projectID.WOReferenceID.planeId.regNbr}
            </Tag>
          )}
        </ProDescriptions.Item>
        <ProDescriptions.Item label={`${t('AC Type')}`} valueType="text">
          {project?.projectID?.WOReferenceID?.planeId?.acTypeId[0]?.code && (
            <Tag
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {project?.projectID?.WOReferenceID?.planeId?.acTypeId[0]?.code}
            </Tag>
          )}
        </ProDescriptions.Item>

        <ProDescriptions.Item label={`${t('MSN')}`} valueType="text">
          {project?.projectID?.WOReferenceID?.planeId?.serialNbr && (
            <Tag
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {project.projectID.WOReferenceID.planeId.serialNbr}
            </Tag>
          )}
        </ProDescriptions.Item>
        <ProDescriptions.Item label={`${t('Effectivity')}`} valueType="text">
          {project?.projectID?.WOReferenceID?.planeId?.efectivityNumber && (
            <Tag
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {project.projectID.WOReferenceID.planeId.efectivityNumber}
            </Tag>
          )}
        </ProDescriptions.Item>

        <ProDescriptions.Item valueType="date" label={t('Manufactory date')}>
          {project?.projectID?.WOReferenceID?.planeId?.manafacturesDate}
        </ProDescriptions.Item>
        <ProDescriptions.Item label={`${t('Engine Type')}`} valueType="text">
          {project?.projectID?.WOReferenceID?.planeId?.engineType && (
            <Tag
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {project.projectID.WOReferenceID.planeId.engineType}
            </Tag>
          )}
        </ProDescriptions.Item>

        <ProDescriptions.Item label={`${t('APU Type')}`} valueType="text">
          {project?.projectID?.WOReferenceID?.planeId?.apuType && (
            <Tag
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {project.projectID.WOReferenceID.planeId.apuType}
            </Tag>
          )}
        </ProDescriptions.Item>

        <ProDescriptions.Item
          label={`${t('Total Frame Hours')}`}
          valueType="text"
        >
          {project?.projectID?.WOReferenceID?.planeId?.airFrameHours && (
            <Tag
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {project.projectID.WOReferenceID.planeId.airFrameHours}
            </Tag>
          )}
        </ProDescriptions.Item>

        <ProDescriptions.Item
          label={`${t('Total Frame Cycles')}`}
          valueType="text"
        >
          {project?.projectID?.WOReferenceID?.planeId?.airFrameLandings && (
            <Tag
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {project.projectID.WOReferenceID.planeId.airFrameLandings}
            </Tag>
          )}
        </ProDescriptions.Item>

        {/* Document revisions */}
        <ProDescriptions.Item label={`${t('MPD Rev')}`} valueType="text">
          <Tag
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {getDocumentRevision('MPD')}
          </Tag>
        </ProDescriptions.Item>
        <ProDescriptions.Item label={`${t('AMM Rev')}`} valueType="text">
          <Tag
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {getDocumentRevision('AMM')}
          </Tag>
        </ProDescriptions.Item>
        <ProDescriptions.Item label={`${t('SRM Rev')}`} valueType="text">
          <Tag
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {getDocumentRevision('SRM')}
          </Tag>
        </ProDescriptions.Item>
        <ProDescriptions.Item label={`${t('TC Rev')}`} valueType="text">
          <Tag
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {getDocumentRevision('TC')}
          </Tag>
        </ProDescriptions.Item>
        <ProDescriptions.Item label={`${t('NDTM Rev')}`} valueType="text">
          <Tag
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {getDocumentRevision('NDTM')}
          </Tag>
        </ProDescriptions.Item>
      </ProDescriptions>
    </div>
  );
};

export default WODiscription;
