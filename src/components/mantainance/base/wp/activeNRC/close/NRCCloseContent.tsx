import React, { FC } from 'react';

import TabContent from '@/components/shared/Table/TabContent';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import WOCloseForm from './NRCCloseForm';
import WODICloseForm from './NRCDICloseForm';
import Times from './NRCTimes';

type CloseProps = { task: any | null };
const CloseContent: FC<CloseProps> = ({ task }) => {
  const { currentProjectAdditionalTask, isLoading, projectAdditionalTasks } =
    useTypedSelector((state) => state.mtbase);
  return (
    <div className="flex">
      <div className=" mx-auto px-6 w-1/2 overflow-hidden h-full">
        <TabContent
          tabs={[
            {
              content: (
                <Times
                  disabled={
                    // !currentProjectAdditionalTask?.optional?.isDone ||
                    !(
                      currentProjectAdditionalTask?.actions &&
                      currentProjectAdditionalTask.actions[
                        currentProjectAdditionalTask.actions.length - 1
                      ]?.performedName
                    ) ||
                    currentProjectAdditionalTask.status === 'closed' ||
                    !(
                      currentProjectAdditionalTask?.actions &&
                      currentProjectAdditionalTask.actions[
                        currentProjectAdditionalTask.actions.length - 1
                      ].inspectedName
                    )
                  }
                  currentAdditionalTask={task}
                  finalAction={task?.optional?.finalAction || null}
                  isLoading={isLoading}
                  projectAdditionalTasks={projectAdditionalTasks}
                />
              ),
              title: 'Times',
            },
            {
              content: (
                <WOCloseForm
                  disabled={
                    !currentProjectAdditionalTask?.optional?.finalAction
                      ?.timeUsed ||
                    currentProjectAdditionalTask.status === 'closed' ||
                    !(
                      currentProjectAdditionalTask?.actions &&
                      currentProjectAdditionalTask.actions[
                        currentProjectAdditionalTask.actions.length - 1
                      ].inspectedName
                    )
                  }
                  currentAdditionalTask={task}
                  finalAction={task?.optional?.finalAction || null}
                  isLoading={isLoading}
                  projectAdditionalTasks={projectAdditionalTasks}
                />
              ),
              title: 'Close',
            },
            {
              content: (
                <WODICloseForm
                  disabled={
                    !currentProjectAdditionalTask?.optional?.finalAction
                      ?.timeUsed ||
                    currentProjectAdditionalTask.status === 'closed' ||
                    !(
                      currentProjectAdditionalTask?.actions &&
                      currentProjectAdditionalTask.actions[
                        currentProjectAdditionalTask.actions.length - 1
                      ].inspectedName
                    ) ||
                    !currentProjectAdditionalTask.isDoubleInspectionRequired
                  }
                  currentAdditionalTask={task}
                  finalAction={task?.optional?.finalAction || null}
                  isLoading={isLoading}
                  projectAdditionalTasks={projectAdditionalTasks}
                />
              ),
              title: 'DI Close',
            },
          ]}
        />
      </div>
      <div className="w-1/2">
        <></>
      </div>
    </div>
  );
};

export default CloseContent;
