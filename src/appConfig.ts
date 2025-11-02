// src/appConfig.tsx
import React, { createContext, useContext } from 'react';

export type AppConfig = {
  nickname: string;
  debug: boolean;         // use for location debug
  eruda: boolean;
  mockForMacOS: boolean;
};

const Ctx = createContext<AppConfig | null>(null);
export const AppConfigProvider = Ctx.Provider;
export function useAppConfig() {
  const v = useContext(Ctx);
  if (!v) throw new Error('AppConfig not provided');
  return v;
}
