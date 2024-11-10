import React, { FC } from 'react';

import { IProjectTask } from '@/models/IProjectTaskMTB';
import TabContent from '@/components/shared/Table/TabContent';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import WOCloseForm from './WOCloseForm';
import WODICloseForm from './WODICloseForm';
import Times from './Times';

type CloseProps = { task: IProjectTask | null; upData: (record: any) => void };
const CloseContent: FC<CloseProps> = ({ task, upData }) => {
  const { isLoading, projectTasks } = useTypedSelector((state) => state.mtbase);
  return (
    <div className="flex">
      <div className=" mx-auto px-6 w-1/2 overflow-hidden h-full">
        <TabContent
          tabs={[
            {
              content: (
                <Times
                  disabled={
                    // !currentProjectTask?.optional?.isDone ||
                    !(
                      task?.actions &&
                      task.actions[task.actions.length - 1]?.performedName
                    ) ||
                    task.status === 'closed' ||
                    !(
                      task?.actions &&
                      task.actions[task.actions.length - 1].inspectedName
                    )
                  }
                  currentProjectTask={task}
                  finalAction={task?.finalAction || null}
                  isLoading={isLoading}
                  projectTasks={projectTasks}
                  onFinish={upData}
                />
              ),
              title: 'Times',
            },
            {
              content: (
                <WOCloseForm
                  disabled={
                    !task?.finalAction?.timeUsed ||
                    task.status === 'closed' ||
                    !(
                      task?.actions &&
                      task.actions[task.actions.length - 1].inspectedName
                    )
                  }
                  currentProjectTask={task}
                  finalAction={task?.finalAction || null}
                  isLoading={isLoading}
                  projectTasks={projectTasks}
                  onFinish={upData}
                />
              ),
              title: 'Close',
            },
            {
              content: (
                <WODICloseForm
                  disabled={
                    !task?.finalAction?.timeUsed ||
                    task.status === 'closed' ||
                    !(
                      task?.actions &&
                      task.actions[task.actions.length - 1].inspectedName
                    ) ||
                    !task.isDoubleInspectionRequired
                  }
                  currentProjectTask={task}
                  finalAction={task?.finalAction || null}
                  isLoading={isLoading}
                  projectTasks={projectTasks}
                  onFinish={upData}
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
