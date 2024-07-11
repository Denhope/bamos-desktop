import { createContext, useContext, useState, ReactNode } from 'react';

// Указываем тип для контекста
interface GlobalStateContextType {
  currentTime: number;
  setCurrentTime: (time: number) => void;
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

  return (
    <GlobalStateContext.Provider value={{ currentTime, setCurrentTime }}>
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
