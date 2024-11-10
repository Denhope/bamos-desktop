import React, { createContext, useContext, useState } from 'react';

interface GlobalStateContextType {
  tasksFormValues: any;
  setTasksFormValues: (values: any) => void;
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(
  undefined
);

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasksFormValues, setTasksFormValues] = useState<any>(null);

  return (
    <GlobalStateContext.Provider
      value={{ tasksFormValues, setTasksFormValues }}
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
