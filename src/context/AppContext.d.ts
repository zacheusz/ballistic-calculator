import { ReactNode } from 'react';

// Define the context value type
export interface AppContextValue {
  apiKey: string;
  environment: string;
  unitPreferences: Record<string, string>;
  firearmProfile: any; // Replace with specific type if available
  ammo: any; // Replace with specific type if available
  calculationOptions: {
    calculateSpinDrift: boolean;
    calculateCoriolisEffect: boolean;
    calculateAeroJump: boolean;
    rangeCardStart: { value: number; unit: string };
    rangeCardStep: { value: number; unit: string };
  };
  displayPreferences: {
    theme?: string;
    [key: string]: any;
  };
  isConfigured: boolean;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  updateApiKey: (key: string) => void;
  updateEnvironment: (env: string) => void;
  updateUnitPreferences: (prefs: Record<string, string>) => void;
  updateFirearmProfile: (profile: any) => void;
  updateAmmo: (ammo: any) => void;
  updateCalculationOptions: (options: any) => void;
  updateDisplayPreferences: (prefs: any) => void;
}

// Define the provider props type
export interface AppProviderProps {
  children: ReactNode;
}

// Declare the context
declare const AppContext: React.Context<AppContextValue>;

// Export the AppProvider component
export const AppProvider: React.FC<AppProviderProps>;

export default AppContext;
