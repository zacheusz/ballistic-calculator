import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import defaultConfig from '../config/default_config.json';

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
    (set, get) => ({
      theme: defaultConfig.theme as Theme,
      language: defaultConfig.language,
      apiStage: defaultConfig.apiStage as ApiStage,
      apiKey: defaultConfig.apiKey,
      setTheme: (theme) => {
        const currentTheme = get().theme;
        console.log(`🎨 setTheme called: ${currentTheme} -> ${theme}`);
        
        // Only update if the theme has actually changed
        if (currentTheme !== theme) {
          console.log(`🎨 Theme actually changing from ${currentTheme} to ${theme}`);
          set({ theme });
        } else {
          console.log(`🎨 Theme unchanged, skipping update: ${theme}`);
        }
      },
      setLanguage: (language) => set({ language }),
      setApiStage: (apiStage) => set({ apiStage }),
      setApiKey: (apiKey) => set({ apiKey }),
    }),
    { 
      name: 'app-config-v2',
      onRehydrateStorage: () => {
        console.log('🔄 Persist middleware: Starting rehydration');
        return (state, error) => {
          if (error) {
            console.log('🔴 Persist middleware: Rehydration error', error);
          } else {
            console.log('✅ Persist middleware: Rehydration complete', state);
          }
        };
      },
    }
  )
);
