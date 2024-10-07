import React, { FC } from 'react';
import WOActionDescriptionList from './WOActionDescriptionList ';
import WOPerfomedForm from './WOPerfomedForm';
import { IProjectTask } from '@/models/IProjectTaskMTB';
import TabContent from '@/components/shared/Table/TabContent';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import WOInspectionForm from '../close/WOInspectionForm';
import WODInspectionForm from './WODInspectionForm';

type StepsProps = { task: IProjectTask | null };
const StepsContent: FC<StepsProps> = ({ task }) => {
  const {
    currentProjectTask,
    currentActiveIndex,
    currentAction,
    isLoading,
    projectTasks,
  } = useTypedSelector((state) => state.mtbase);
  return (
    <div className="flex">
      <div className="w-1/2">
        <WOActionDescriptionList data={task?.actions || []} />
      </div>
      <div className=" mx-auto px-6 w-1/2 overflow-hidden">
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
                  onFinish={function (record: any): void {
                    throw new Error('Function not implemented.');
                  }}
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
