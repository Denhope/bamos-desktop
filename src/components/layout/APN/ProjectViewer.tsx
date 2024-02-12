import TabContent from '@/components/shared/Table/TabContent';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProjectViewerFilterForm from '../projectViewer/projectViewerFilterForm';
import ProjectViewList from '../projectViewer/ProjectViewList';
interface ProjectViewer {
  onDoubleClick?: (record: any, rowIndex?: any) => void;
  onSingleRowClick?: (record: any, rowIndex?: any) => void;
}
const ProjectViewer: FC<ProjectViewer> = ({
  onSingleRowClick,
  onDoubleClick,
}) => {
  const { t } = useTranslation();
  const [receivings, setReceiving] = useState<any[] | []>([]);
  const [data, setdata] = useState<any[] | []>(receivings);
  useEffect(() => {
    if (receivings) {
      setdata(receivings);
    }
  }, [receivings]);
  const tabs = [
    {
      content: (
        <ProjectViewList
          onDoubleRowClick={onDoubleClick}
          onSingleRowClick={onSingleRowClick}
          scroll={30}
          projects={data}
        ></ProjectViewList>
      ),
      title: `${t('PROJECT LOG')}`,
    },
  ];

  return (
    <div className="h-[82vh] overflow-hidden flex flex-col justify-between gap-1">
      <div className="flex flex-col gap-5">
        <ProjectViewerFilterForm onProjectSearch={setReceiving} />
        <TabContent tabs={tabs}></TabContent>
      </div>
    </div>
  );
};

export default ProjectViewer;
