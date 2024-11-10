export interface TaskFormValues {
  status?: string[];
  acTypeId?: string;
  // добавьте другие необходимые поля
}

export interface TaskAdministrationState {
  tasksFormValues: TaskFormValues;
  setTasksFormValues: (values: TaskFormValues) => void;
}
