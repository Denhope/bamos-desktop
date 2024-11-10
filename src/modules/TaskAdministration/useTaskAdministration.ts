import { useState } from 'react';
import type { TaskFormValues } from './types';

export function useTaskAdministration() {
  const [tasksFormValues, setTasksFormValues] = useState<TaskFormValues>({});

  return {
    tasksFormValues,
    setTasksFormValues,
  };
}
