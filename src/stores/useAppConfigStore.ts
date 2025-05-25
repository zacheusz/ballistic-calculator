import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';
export type ApiStage = 'test' | 'dev' | 'stage' | 'prod';

interface AppConfigState {
  theme: Theme;
  language: string;
  apiStage: ApiStage;
  apiKey: string;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: string) => void;
  setApiStage: (stage: ApiStage) => void;
  setApiKey: (key: string) => void;
}

export const useAppConfigStore = create<AppConfigState>()(
  persist(
    (set) => ({
      theme: 'dark',
      language: 'en',
      apiStage: 'prod',
      apiKey: '',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setApiStage: (apiStage) => set({ apiStage }),
      setApiKey: (apiKey) => set({ apiKey }),
    }),
    { name: 'app-config' }
  )
);
