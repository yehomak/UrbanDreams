// context/LaunchParamsContext.tsx
import { createContext, useContext, ReactNode } from 'react';
import { LaunchParams } from '@telegram-apps/sdk-react';

const LaunchParamsContext = createContext<LaunchParams | null>(null);

export const useLaunchParams = () => {
  const context = useContext(LaunchParamsContext);
  if (!context) {
    throw new Error('useLaunchParams must be used within LaunchParamsProvider');
  }
  return context;
};

interface LaunchParamsProviderProps {
  children: ReactNode;
  launchParams: LaunchParams;
}

export const LaunchParamsProvider = ({ 
  children, 
  launchParams 
}: LaunchParamsProviderProps) => {
  return (
    <LaunchParamsContext.Provider value={launchParams}>
      {children}
    </LaunchParamsContext.Provider>
  );
};