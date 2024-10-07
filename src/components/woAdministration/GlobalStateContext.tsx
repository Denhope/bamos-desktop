import { createContext, useContext, useState, ReactNode } from 'react';

// Указываем тип для контекста
interface GlobalStateContextType {
  currentTime: number;
  tasksFormValues: any;
  projectTasksFormValues: any;
  notificationsEnabled: boolean;
  setCurrentTime: (time: number) => void;
  setTasksFormValues: (values: any) => void;
  setProjectTasksFormValues: (values: any) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

// Создаем контекст с типом и значением по умолчанию
const GlobalStateContext = createContext<GlobalStateContextType | undefined>(
  undefined
);

interface GlobalStateProviderProps {
  children: ReactNode;
}

export const GlobalStateProvider = ({ children }: GlobalStateProviderProps) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [tasksFormValues, setTasksFormValues] = useState<any>(null);
  const [projectTasksFormValues, setProjectTasksFormValues] =
    useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <GlobalStateContext.Provider
      value={{
        currentTime,
        setCurrentTime,
        tasksFormValues,
        setTasksFormValues,
        projectTasksFormValues,
        setProjectTasksFormValues,
        notificationsEnabled,
        setNotificationsEnabled,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};
