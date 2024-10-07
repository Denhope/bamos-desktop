import { IProjectTask } from '@/models/IProjectTaskMTB';
import React, { FC, useEffect, useState } from 'react';

import TabContent from '@/components/shared/Table/TabContent';
import WOPerfomedForm from '@/components/mantainance/base/wp/activeTask/steps/WOPerfomedForm';
import WOInspectionForm from '@/components/mantainance/base/wp/activeTask/close/WOInspectionForm';
import WODInspectionForm from '@/components/mantainance/base/wp/activeTask/steps/WODInspectionForm';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import WOActionDescriptionList from './steps/WOActions';
import { getFilteredProjectTask } from '@/utils/api/thunks';
type StepsContentProps = {
  task: IProjectTask | null;
  upData: (record: any) => void;
};
const StepsContent: FC<StepsContentProps> = ({ task, upData }) => {
  const { isLoading, projectTasks } = useTypedSelector((state) => state.mtbase);
  const [currentAction, setCurrentActiveAction] = useState<any>();
  const [currentActiveIndex, setCurrentActiveIndex] = useState(1);

  return (
    <div className="flex">
      <div className="w-1/2">
        <WOActionDescriptionList
          currentActiveIndex={currentActiveIndex}
          onActiveClick={setCurrentActiveIndex}
          onActiveAction={setCurrentActiveAction}
          currentProjectTask={task} // currentAction={currentAction}
          updatedData={upData}
          data1={task?.actions || []}
        />
      </div>
      <div className=" mx-auto px-6 w-1/2 overflow-hidden h-full">
        <TabContent
          tabs={[
            {
              content: task && (
                <WOPerfomedForm
                  currentProjectTask={task}
                  currentActiveIndex={currentActiveIndex}
                  currentAction={currentAction}
                  isLoading={isLoading}
                  projectTasks={projectTasks}
                  disabled={task ? task.status !== 'inProgress' : false}
                  onFinish={upData}
                />
              ),
              title: 'PERFOMED',
            },
            {
              content: (
                <WOInspectionForm
                  currentProjectTask={task}
                  currentActiveIndex={currentActiveIndex}
                  currentAction={currentAction}
                  isLoading={isLoading}
                  projectTasks={projectTasks}
                  onFinish={upData}
                  disabled={
                    !(currentAction && currentAction.performedName) ||
                    (task ? task.status !== 'inProgress' : false)
                  }
                />
              ),
              title: 'INSPECTION',
            },
            {
              content: (
                <WODInspectionForm
                  disabled={
                    !(currentAction && currentAction.performedName) ||
                    !(currentAction && currentAction.inspectedName) ||
                    !task?.isDoubleInspectionRequired ||
                    (task ? task.status !== 'inProgress' : false)
                  }
                  currentProjectTask={task}
                  currentActiveIndex={currentActiveIndex}
                  currentAction={currentAction}
                  isLoading={isLoading}
                  projectTasks={projectTasks}
                  onFinish={upData}
                />
              ),
              title: 'DIINSPECTION',
            },
          ]}
        />
      </div>
    </div>
  );
};

export default StepsContent;
