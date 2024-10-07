import React, { FC } from 'react';
import WOActionDescriptionList from './NRCActionDescriptionList ';
import WOPerfomedForm from './NRCPerfomedForm';
import { IProjectTask } from '@/models/IProjectTaskMTB';
import TabContent from '@/components/shared/Table/TabContent';
import { useTypedSelector } from '@/hooks/useTypedSelector';

import WODInspectionForm from './NRCDInspectionForm';
import WOInspectionForm from '../close/NRCInspectionForm';
import { IAdditionalTaskMTBCreate } from '@/models/IAdditionalTaskMTB';
import TestNRCStep from './TestNRCStep';

type StepsProps = { task: any | null };
const StepsContent: FC<StepsProps> = ({ task }) => {
  const {
    currentProjectAdditionalTask,
    currentActiveAdditionalIndex,
    currentAdditionalAction,
    isLoading,
    projectAdditionalTasks,
  } = useTypedSelector((state) => state.mtbase);
  return (
    <div className="flex">
      <div className="w-[99%]">
        <TestNRCStep
          currentTask={task ? task : null}
          data={task?.steps || []}
          currentProjectId={
            task && task.projectId && task.projectId._id
              ? task.projectId._id
              : null
          }
          taskId={task && task._id ? task._id : null}
        ></TestNRCStep>
        {/* <WOActionDescriptionList data={task?.actions || []} /> */}
      </div>
      {/* <div className=" mx-auto px-6 w-1/2 overflow-hidden h-full">
        <TabContent
          tabs={[
            {
              content: task && (
                <WOPerfomedForm
                  currentAdditionalTask={task}
                  currentActiveIndex={currentActiveAdditionalIndex}
                  currentAction={currentAdditionalAction}
                  isLoading={isLoading}
                  projectTasks={projectAdditionalTasks}
                  disabled={task ? task.status !== 'inProgress' : false}
                />
              ),
              title: 'PERFOMED',
            },
            {
              content: (
                <WOInspectionForm
                  currentAdditionalTask={task}
                  currentActiveIndex={currentActiveAdditionalIndex}
                  currentAction={currentAdditionalAction}
                  isLoading={isLoading}
                  projectTasks={projectAdditionalTasks}
                  disabled={
                    !(
                      currentAdditionalAction &&
                      currentAdditionalAction.performedName
                    ) || (task ? task.status !== 'inProgress' : false)
                  }
                />
              ),
              title: 'INSPECTION',
            },
            {
              content: (
                <WODInspectionForm
                  disabled={
                    !(
                      currentAdditionalAction &&
                      currentAdditionalAction.performedName
                    ) ||
                    !(
                      currentAdditionalAction &&
                      currentAdditionalAction.inspectedName
                    ) ||
                    !task?.isDoubleInspectionRequired ||
                    (task ? task.status !== 'inProgress' : false)
                  }
                  currentAdditionalTask={task}
                  currentActiveIndex={currentActiveAdditionalIndex}
                  currentAction={currentAdditionalAction}
                  isLoading={isLoading}
                  projectTasks={projectAdditionalTasks}
                />
              ),
              title: 'DIINSPECTION',
            },
          ]}
        />
      </div> */}
    </div>
  );
};

export default StepsContent;
