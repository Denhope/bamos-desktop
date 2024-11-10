import { IProjectItemWO } from '@/models/AC';
import { ProDescriptions } from '@ant-design/pro-components';
import { Tag } from 'antd';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ru } from 'date-fns/locale';
import { format } from 'date-fns';

type projectsDiscriptionType = {
  project: IProjectItemWO | null;
};

const WODiscription: FC<projectsDiscriptionType> = React.memo(
  ({ project }) => {
    const { t } = useTranslation();

    const getDocumentRevision = (documentName: string) => {
      const document = project?.projectID?.WOReferenceID?.documents?.find(
        (doc: any) => doc?.name === documentName
      );
      return document ? `${document?.revision}-${document?.revisionDate}` : '';
    };
    function formatDate(dateString: string | undefined): string {
      if (!dateString) return '';
      try {
        return format(new Date(dateString), 'dd.MM.yyyy', { locale: ru });
      } catch {
        return dateString;
      }
    }
    return (
      <div className="flex flex-col w-full">
        <ProDescriptions
          column={7}
          size="small"
          className="bg-white px-0  rounded-md align-middle w-full py-0"
        >
          {/* Добавление информации из project.projectID.WOReferenceID.planeId */}
          <ProDescriptions.Item label={`${t('AC Reg')}`} valueType="text">
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

          <ProDescriptions.Item label={t('Manufactory date')} valueType="text">
            {project?.projectID?.WOReferenceID?.planeId?.manafacturesDate && (
              <Tag
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatDate(
                  project.projectID.WOReferenceID.planeId.manafacturesDate
                )}
              </Tag>
            )}
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
  },
  (prevProps, nextProps) => {
    if (!prevProps.project && !nextProps.project) return true;
    if (!prevProps.project || !nextProps.project) return false;

    return (
      prevProps.project.id === nextProps.project.id &&
      prevProps.project.taskWO === nextProps.project.taskWO &&
      prevProps.project.taskDescription === nextProps.project.taskDescription
    );
  }
);

export default WODiscription;
